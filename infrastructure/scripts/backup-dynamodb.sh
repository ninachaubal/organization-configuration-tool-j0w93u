#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Script directories
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
CONFIG_DIR=${SCRIPT_DIR}/../config
DEFAULT_ENV="dev"
BACKUP_RETENTION_DAYS="90"
LOG_FILE="/tmp/backup-dynamodb-$(date +%Y-%m-%d-%H-%M-%S).log"

# Function to display usage information
print_usage() {
    echo "Organization Configuration Management Tool - DynamoDB Backup"
    echo "----------------------------------------------------------------"
    echo "This script creates a backup of the DynamoDB table used by the configuration tool."
    echo
    echo "Usage: $(basename $0) [options]"
    echo
    echo "Options:"
    echo "  -e, --environment ENV   Set the environment (dev, test, prod) [default: dev]"
    echo "  -r, --retention DAYS    Set backup retention period in days [default: 90]"
    echo "  -h, --help              Display this help message and exit"
    echo
    echo "Environments:"
    echo "  dev     Development environment"
    echo "  test    Testing environment"
    echo "  prod    Production environment"
    echo
    echo "Examples:"
    echo "  $(basename $0)                   # Backup dev environment with default retention"
    echo "  $(basename $0) -e test           # Backup test environment with default retention"
    echo "  $(basename $0) -e prod -r 120    # Backup production with 120 days retention"
}

# Function to log a message to both stdout and the log file
log_message() {
    local message="$1"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo "[${timestamp}] ${message}"
    echo "[${timestamp}] ${message}" >> $LOG_FILE
}

# Function to check if all required tools are installed
check_prerequisites() {
    log_message "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_message "ERROR: AWS CLI is not installed. Please install it first."
        return 1
    fi
    
    # Check jq for JSON parsing
    if ! command -v jq &> /dev/null; then
        log_message "ERROR: jq is not installed. Please install it first."
        return 1
    fi
    
    # Verify AWS credentials are configured
    if ! aws sts get-caller-identity &> /dev/null; then
        log_message "ERROR: AWS credentials not configured or invalid."
        log_message "Run 'aws configure' to set up your AWS credentials."
        return 1
    fi
    
    log_message "All prerequisites are met."
    return 0
}

# Function to load environment-specific configuration
# Using the load_environment_config function from bootstrap-environment.sh
load_environment_config() {
    local environment="$1"
    
    # Source the bootstrap-environment script to get the load_environment_config function
    source ${SCRIPT_DIR}/bootstrap-environment.sh
    
    # Call the load_environment_config function
    if ! load_environment_config "$environment"; then
        log_message "ERROR: Failed to load environment configuration for '$environment'."
        return 1
    fi
    
    # Get the DynamoDB table name from the configuration
    local config_file="${CONFIG_DIR}/environments/${environment}.json"
    DYNAMODB_TABLE=$(jq -r '.dynamodb.organizationConfigurationTableName' "$config_file")
    
    if [[ -z "$DYNAMODB_TABLE" || "$DYNAMODB_TABLE" == "null" ]]; then
        log_message "ERROR: DynamoDB table name not found in configuration file."
        return 1
    fi
    
    log_message "Loaded configuration for $environment environment. DynamoDB table: $DYNAMODB_TABLE"
    return 0
}

# Function to create a backup of the DynamoDB table
create_backup() {
    local table_name="$1"
    local environment="$2"
    local backup_name="org-config-tool-${environment}-$(date +%Y%m%d%H%M%S)"
    
    log_message "Creating backup of DynamoDB table '$table_name' with name '$backup_name'..."
    
    # Create the backup
    local backup_result
    local backup_arn=""
    
    backup_result=$(aws dynamodb create-backup \
        --table-name "$table_name" \
        --backup-name "$backup_name" \
        --region "$AWS_REGION" \
        2>&1)
    
    if [ $? -ne 0 ]; then
        log_message "ERROR: Failed to create backup: $backup_result"
        echo ""
        return 1
    fi
    
    # Extract the backup ARN from the result
    backup_arn=$(echo "$backup_result" | jq -r '.BackupDetails.BackupArn')
    
    log_message "Backup created successfully with ARN: $backup_arn"
    echo "$backup_arn"
    return 0
}

# Function to list existing backups for the DynamoDB table
list_backups() {
    local table_name="$1"
    
    log_message "Listing backups for DynamoDB table '$table_name'..."
    
    # List backups for the table
    local backups_result
    
    backups_result=$(aws dynamodb list-backups \
        --table-name "$table_name" \
        --region "$AWS_REGION" \
        2>&1)
    
    if [ $? -ne 0 ]; then
        log_message "ERROR: Failed to list backups: $backups_result"
        return 1
    fi
    
    # Output JSON result for further processing
    echo "$backups_result"
    return 0
}

# Function to clean up old backups beyond the retention period
cleanup_old_backups() {
    local table_name="$1"
    local retention_days="$2"
    local backups_deleted=0
    
    log_message "Cleaning up backups older than $retention_days days for table '$table_name'..."
    
    # Get list of backups
    local backups_json
    backups_json=$(list_backups "$table_name")
    
    if [ $? -ne 0 ]; then
        log_message "ERROR: Failed to list backups for cleanup."
        echo 0
        return 1
    fi
    
    # Calculate cutoff date for retention (in seconds since epoch)
    local cutoff_date=$(date -d "-$retention_days days" +%s)
    
    # Process each backup
    local backup_count=$(echo "$backups_json" | jq '.BackupSummaries | length')
    
    for (( i=0; i<$backup_count; i++ )); do
        local backup_arn=$(echo "$backups_json" | jq -r ".BackupSummaries[$i].BackupArn")
        local backup_date=$(echo "$backups_json" | jq -r ".BackupSummaries[$i].BackupCreationDateTime")
        
        # Convert backup date to seconds since epoch (AWS returns dates in ISO 8601 format)
        local backup_timestamp=$(date -d "${backup_date}" +%s)
        
        # Check if backup is older than retention period
        if [ "$backup_timestamp" -lt "$cutoff_date" ]; then
            log_message "Deleting old backup: $backup_arn (created on $backup_date)"
            
            # Delete the backup
            if aws dynamodb delete-backup \
                --backup-arn "$backup_arn" \
                --region "$AWS_REGION" &> /dev/null; then
                ((backups_deleted++))
                log_message "Successfully deleted backup: $backup_arn"
            else
                log_message "ERROR: Failed to delete backup: $backup_arn"
            fi
        fi
    done
    
    log_message "Cleanup completed. Deleted $backups_deleted old backups."
    echo $backups_deleted
    return 0
}

# Function to verify the backup was created successfully
verify_backup() {
    local backup_arn="$1"
    
    if [ -z "$backup_arn" ]; then
        log_message "ERROR: No backup ARN provided for verification."
        return 1
    fi
    
    log_message "Verifying backup: $backup_arn"
    
    # Describe the backup to check its status
    local backup_status
    
    backup_status=$(aws dynamodb describe-backup \
        --backup-arn "$backup_arn" \
        --region "$AWS_REGION" \
        --query 'BackupDescription.BackupDetails.BackupStatus' \
        --output text \
        2>&1)
    
    if [ $? -ne 0 ]; then
        log_message "ERROR: Failed to verify backup: $backup_status"
        return 1
    fi
    
    if [ "$backup_status" == "AVAILABLE" ]; then
        log_message "Backup verification successful. Status: $backup_status"
        return 0
    else
        log_message "ERROR: Backup verification failed. Status: $backup_status"
        return 1
    fi
}

# Main function that orchestrates the backup process
main() {
    local environment="$DEFAULT_ENV"
    local retention_days="$BACKUP_RETENTION_DAYS"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -e|--environment)
                if [[ -z "$2" || "$2" =~ ^- ]]; then
                    log_message "ERROR: Missing value for option $1"
                    print_usage
                    return 1
                fi
                environment="$2"
                shift 2
                ;;
            -r|--retention)
                if [[ -z "$2" || "$2" =~ ^- ]]; then
                    log_message "ERROR: Missing value for option $1"
                    print_usage
                    return 1
                fi
                retention_days="$2"
                shift 2
                ;;
            -h|--help)
                print_usage
                exit 0
                ;;
            *)
                log_message "ERROR: Unknown option: $1"
                print_usage
                return 1
                ;;
        esac
    done
    
    log_message "Starting DynamoDB backup process for '$environment' environment..."
    
    # Check prerequisites
    if ! check_prerequisites; then
        log_message "Failed to meet prerequisites. Please install the required tools and try again."
        return 1
    fi
    
    # Load environment configuration
    if ! load_environment_config "$environment"; then
        log_message "Failed to load environment configuration."
        return 1
    fi
    
    # Create backup
    local backup_arn
    backup_arn=$(create_backup "$DYNAMODB_TABLE" "$environment")
    
    if [ $? -ne 0 ] || [ -z "$backup_arn" ]; then
        log_message "Backup creation failed."
        return 1
    fi
    
    # Verify backup
    if ! verify_backup "$backup_arn"; then
        log_message "Backup verification failed."
        return 1
    fi
    
    # Clean up old backups
    local deleted_count
    deleted_count=$(cleanup_old_backups "$DYNAMODB_TABLE" "$retention_days")
    
    log_message "Backup process completed successfully."
    log_message "  - Environment: $environment"
    log_message "  - Table: $DYNAMODB_TABLE"
    log_message "  - Backup ARN: $backup_arn"
    log_message "  - Old backups deleted: $deleted_count"
    log_message "  - Retention period: $retention_days days"
    log_message "  - Log file: $LOG_FILE"
    
    return 0
}

# Run the main function with all command line arguments
main "$@"
exit $?