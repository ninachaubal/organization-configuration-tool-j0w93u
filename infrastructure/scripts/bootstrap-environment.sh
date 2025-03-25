#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Script directories
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
CDK_DIR=${SCRIPT_DIR}/../cdk
CONFIG_DIR=${SCRIPT_DIR}/../config
DEFAULT_ENV="dev"
LOG_FILE="/tmp/bootstrap-$(date +%Y-%m-%d-%H-%M-%S).log"

# Initialize log file
touch $LOG_FILE
echo "Log file initialized at $LOG_FILE"

# Function to display usage information
print_usage() {
    echo "Organization Configuration Management Tool - Environment Bootstrap"
    echo "----------------------------------------------------------------"
    echo "This script bootstraps the AWS environment for deploying the Organization Configuration Management Tool."
    echo
    echo "Usage: $(basename $0) [options]"
    echo
    echo "Options:"
    echo "  -e, --environment ENV   Set the deployment environment (dev, test, prod) [default: dev]"
    echo "  -h, --help              Display this help message and exit"
    echo
    echo "Environments:"
    echo "  dev     Development environment"
    echo "  test    Testing environment"
    echo "  prod    Production environment"
    echo
    echo "Examples:"
    echo "  $(basename $0)              # Bootstrap the dev environment"
    echo "  $(basename $0) -e test      # Bootstrap the test environment"
    echo "  $(basename $0) --environment prod  # Bootstrap the production environment"
}

# Function to log a message to stdout and the log file
log_message() {
    local message="$1"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo "[${timestamp}] ${message}"
    echo "[${timestamp}] ${message}" >> $LOG_FILE
}

# Function to check if required tools are installed
check_prerequisites() {
    log_message "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_message "ERROR: AWS CLI is not installed. Please install it first."
        return 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_message "ERROR: Node.js is not installed. Please install it first."
        return 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_message "ERROR: npm is not installed. Please install it first."
        return 1
    fi
    
    # Check AWS CDK
    if ! command -v cdk &> /dev/null; then
        log_message "ERROR: AWS CDK is not installed. Please install it globally using 'npm install -g aws-cdk'."
        return 1
    fi
    
    # Check jq for JSON parsing
    if ! command -v jq &> /dev/null; then
        log_message "ERROR: jq is not installed. Please install it first."
        return 1
    fi
    
    log_message "All prerequisites are met."
    return 0
}

# Function to load environment-specific configuration from JSON files
load_environment_config() {
    local environment="$1"
    
    # Validate environment parameter
    if [[ ! "$environment" =~ ^(dev|test|prod)$ ]]; then
        log_message "ERROR: Invalid environment '$environment'. Must be one of: dev, test, prod"
        return 1
    fi
    
    local config_file="${CONFIG_DIR}/environments/${environment}.json"
    
    # Check if config file exists
    if [[ ! -f "$config_file" ]]; then
        log_message "ERROR: Configuration file not found: $config_file"
        return 1
    fi
    
    log_message "Loading configuration for $environment environment..."
    
    # Parse JSON configuration
    export AWS_ACCOUNT_ID=$(jq -r '.aws.accountId' $config_file)
    export AWS_REGION=$(jq -r '.aws.region' $config_file)
    
    if [[ -z "$AWS_ACCOUNT_ID" || "$AWS_ACCOUNT_ID" == "null" ]]; then
        log_message "ERROR: AWS account ID not found in configuration file"
        return 1
    fi
    
    if [[ -z "$AWS_REGION" || "$AWS_REGION" == "null" ]]; then
        log_message "ERROR: AWS region not found in configuration file"
        return 1
    fi
    
    log_message "Configuration loaded: Account ID=${AWS_ACCOUNT_ID}, Region=${AWS_REGION}"
    return 0
}

# Function to configure AWS CLI profile for the specified environment
configure_aws_profile() {
    local environment="$1"
    local profile_name="org-config-tool-${environment}"
    
    log_message "Configuring AWS profile for $environment environment..."
    
    # Check if AWS account and region are set
    if [[ -z "$AWS_ACCOUNT_ID" || -z "$AWS_REGION" ]]; then
        log_message "ERROR: AWS account ID or region not set. Please run load_environment_config first."
        return 1
    fi
    
    # Create or update AWS profile
    aws configure set region "$AWS_REGION" --profile "$profile_name"
    
    # Verify AWS credentials are valid
    if ! aws sts get-caller-identity --profile "$profile_name" &> /dev/null; then
        log_message "ERROR: AWS credentials validation failed. Please configure valid credentials for profile '$profile_name'."
        log_message "Run 'aws configure --profile $profile_name' to set up your AWS credentials."
        return 1
    fi
    
    # Set AWS_PROFILE environment variable
    export AWS_PROFILE="$profile_name"
    
    log_message "AWS profile '$profile_name' configured successfully."
    return 0
}

# Function to bootstrap the AWS CDK in the target environment
bootstrap_cdk() {
    local environment="$1"
    
    log_message "Bootstrapping CDK for $environment environment..."
    
    # Change to CDK directory
    cd "$CDK_DIR"
    
    # Install dependencies if node_modules doesn't exist
    if [[ ! -d "node_modules" ]]; then
        log_message "Installing CDK dependencies..."
        npm install
    fi
    
    # Bootstrap CDK
    log_message "Running CDK bootstrap command..."
    if ! cdk bootstrap aws://${AWS_ACCOUNT_ID}/${AWS_REGION} --profile ${AWS_PROFILE}; then
        log_message "ERROR: CDK bootstrap failed."
        return 1
    fi
    
    log_message "CDK bootstrap completed successfully."
    return 0
}

# Function to verify the CDK bootstrap was completed successfully
verify_bootstrap() {
    local environment="$1"
    
    log_message "Verifying CDK bootstrap for $environment environment..."
    
    # Check if CDK bootstrap stack exists
    local stack_name="CDKToolkit"
    local stack_status=$(aws cloudformation describe-stacks --stack-name $stack_name --query "Stacks[0].StackStatus" --output text --profile ${AWS_PROFILE} 2>/dev/null || echo "NOT_FOUND")
    
    if [[ "$stack_status" == "NOT_FOUND" ]]; then
        log_message "ERROR: CDK bootstrap stack not found."
        return 1
    elif [[ "$stack_status" == "CREATE_COMPLETE" || "$stack_status" == "UPDATE_COMPLETE" ]]; then
        log_message "CDK bootstrap stack verified: $stack_status"
        return 0
    else
        log_message "ERROR: CDK bootstrap stack is in an unexpected state: $stack_status"
        return 1
    fi
}

# Function to set up IAM permissions required for CDK deployments
setup_iam_permissions() {
    local environment="$1"
    
    log_message "Setting up IAM permissions for CDK deployments in $environment environment..."
    
    # Role name with environment suffix
    local role_name="OrgConfigToolDeploymentRole-${environment}"
    
    # Create temporary files for policy documents
    local temp_dir=$(mktemp -d)
    local policy_file="${temp_dir}/policy.json"
    local trust_file="${temp_dir}/trust.json"
    
    # Create deployment role policy document
    cat > "$policy_file" << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:*",
                "s3:*",
                "iam:PassRole",
                "iam:GetRole",
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:PutRolePolicy",
                "iam:AttachRolePolicy",
                "iam:DetachRolePolicy",
                "dynamodb:*",
                "amplify:*",
                "route53:*",
                "cloudfront:*",
                "waf:*",
                "cognito-idp:*"
            ],
            "Resource": "*"
        }
    ]
}
EOF
    
    # Create trust policy for deployment
    cat > "$trust_file" << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudformation.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF
    
    # Check if role exists
    if aws iam get-role --role-name "$role_name" --profile ${AWS_PROFILE} &>/dev/null; then
        log_message "IAM role '$role_name' already exists."
        
        # Update the role policy
        log_message "Updating deployment policy for IAM role..."
        aws iam put-role-policy \
            --role-name "$role_name" \
            --policy-name "DeploymentPolicy" \
            --policy-document "file://${policy_file}" \
            --profile ${AWS_PROFILE}
    else
        # Create role
        log_message "Creating IAM role '$role_name'..."
        aws iam create-role \
            --role-name "$role_name" \
            --assume-role-policy-document "file://${trust_file}" \
            --profile ${AWS_PROFILE}
        
        # Create inline policy
        log_message "Attaching deployment policy to IAM role..."
        aws iam put-role-policy \
            --role-name "$role_name" \
            --policy-name "DeploymentPolicy" \
            --policy-document "file://${policy_file}" \
            --profile ${AWS_PROFILE}
    fi
    
    # Clean up temporary files
    rm -rf "$temp_dir"
    
    log_message "IAM permissions setup completed."
    return 0
}

# Main function that orchestrates the bootstrap process
main() {
    local environment="$DEFAULT_ENV"
    
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
    
    log_message "Starting environment bootstrap for '$environment' environment..."
    
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
    
    # Configure AWS profile
    if ! configure_aws_profile "$environment"; then
        log_message "Failed to configure AWS profile."
        return 1
    fi
    
    # Bootstrap CDK
    if ! bootstrap_cdk "$environment"; then
        log_message "Failed to bootstrap CDK."
        return 1
    fi
    
    # Verify bootstrap
    if ! verify_bootstrap "$environment"; then
        log_message "Failed to verify CDK bootstrap."
        return 1
    fi
    
    # Setup IAM permissions
    if ! setup_iam_permissions "$environment"; then
        log_message "Failed to setup IAM permissions."
        return 1
    fi
    
    log_message "Environment bootstrap completed successfully for '$environment' environment."
    log_message "Log file is available at: $LOG_FILE"
    return 0
}

# If this script is being sourced, export the load_environment_config function
# so it can be used by other scripts
if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
    export -f load_environment_config
else
    # Otherwise, run the main function with all command line arguments
    main "$@"
    exit $?
fi