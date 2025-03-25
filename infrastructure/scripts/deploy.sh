#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Script directories
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
CDK_DIR=${SCRIPT_DIR}/../cdk
CONFIG_DIR=${SCRIPT_DIR}/../config
DEFAULT_ENV="dev"
LOG_FILE="/tmp/deploy-$(date +%Y-%m-%d-%H-%M-%S).log"
STACK_PATTERN="OrgConfigTool"

# Function to display usage information
print_usage() {
    echo "Organization Configuration Management Tool - Deployment"
    echo "-----------------------------------------------------"
    echo "This script deploys the Organization Configuration Management Tool infrastructure using AWS CDK."
    echo
    echo "Usage: $(basename $0) [options]"
    echo
    echo "Options:"
    echo "  -e, --environment ENV   Set the deployment environment (dev, test, prod) [default: dev]"
    echo "  -s, --stack STACK       Specify the stack to deploy (all, amplify, dynamodb, cloudfront, iam, monitoring) [default: all]"
    echo "  -h, --help              Display this help message and exit"
    echo
    echo "Environments:"
    echo "  dev     Development environment"
    echo "  test    Testing environment"
    echo "  prod    Production environment"
    echo
    echo "Stacks:"
    echo "  all        Deploy all stacks in the correct order"
    echo "  amplify    Deploy the Amplify hosting stack"
    echo "  dynamodb   Deploy the DynamoDB table stack"
    echo "  cloudfront Deploy the CloudFront distribution stack"
    echo "  iam        Deploy the IAM roles and policies stack"
    echo "  monitoring Deploy the monitoring resources stack"
    echo
    echo "Examples:"
    echo "  $(basename $0)                       # Deploy all stacks to dev environment"
    echo "  $(basename $0) -e test               # Deploy all stacks to test environment"
    echo "  $(basename $0) -e prod -s dynamodb   # Deploy only DynamoDB stack to production"
}

# Function to log a message to stdout and the log file
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

# Source the bootstrap environment script to use load_environment_config function
source "${SCRIPT_DIR}/bootstrap-environment.sh"

# Function to verify the CDK bootstrap was completed for the environment
verify_bootstrap() {
    local environment="$1"
    
    log_message "Verifying CDK bootstrap for $environment environment..."
    
    # Check if CDK bootstrap stack exists
    local stack_name="CDKToolkit"
    local stack_status=$(aws cloudformation describe-stacks --stack-name $stack_name --query "Stacks[0].StackStatus" --output text --profile ${AWS_PROFILE} 2>/dev/null || echo "NOT_FOUND")
    
    if [[ "$stack_status" == "NOT_FOUND" ]]; then
        log_message "CDK bootstrap stack not found. Running bootstrap script..."
        ${SCRIPT_DIR}/bootstrap-environment.sh -e "$environment"
        
        # Verify bootstrap again
        stack_status=$(aws cloudformation describe-stacks --stack-name $stack_name --query "Stacks[0].StackStatus" --output text --profile ${AWS_PROFILE} 2>/dev/null || echo "NOT_FOUND")
        
        if [[ "$stack_status" == "NOT_FOUND" ]]; then
            log_message "ERROR: Bootstrap failed. CDK bootstrap stack still not found."
            return 1
        elif [[ "$stack_status" == "CREATE_COMPLETE" || "$stack_status" == "UPDATE_COMPLETE" ]]; then
            log_message "CDK bootstrap stack verified: $stack_status"
            return 0
        else
            log_message "ERROR: CDK bootstrap stack is in an unexpected state: $stack_status"
            return 1
        fi
    elif [[ "$stack_status" == "CREATE_COMPLETE" || "$stack_status" == "UPDATE_COMPLETE" ]]; then
        log_message "CDK bootstrap stack verified: $stack_status"
        return 0
    else
        log_message "ERROR: CDK bootstrap stack is in an unexpected state: $stack_status"
        return 1
    fi
}

# Function to deploy a specific CDK stack to the environment
deploy_stack() {
    local environment="$1"
    local stack_name="$2"
    
    log_message "Deploying $stack_name stack to $environment environment..."
    
    # Change to CDK directory
    cd "$CDK_DIR"
    
    # Install dependencies if node_modules doesn't exist
    if [[ ! -d "node_modules" ]]; then
        log_message "Installing CDK dependencies..."
        npm install
    fi
    
    # Prepare full stack name
    local full_stack_name="${STACK_PATTERN}${stack_name}-${environment}"
    
    # Execute CDK deploy command
    log_message "Running CDK deploy command for $full_stack_name..."
    if ! cdk deploy $full_stack_name --profile ${AWS_PROFILE} --require-approval never; then
        log_message "ERROR: Deployment of $full_stack_name failed."
        return 1
    fi
    
    log_message "Deployment of $full_stack_name completed successfully."
    return 0
}

# Function to verify the deployment was successful
verify_deployment() {
    local environment="$1"
    local stack_name="$2"
    
    log_message "Verifying deployment of $stack_name to $environment environment..."
    
    # Prepare full stack name
    local full_stack_name="${STACK_PATTERN}${stack_name}-${environment}"
    
    # Check if stack exists and has a successful status
    local stack_status=$(aws cloudformation describe-stacks --stack-name $full_stack_name --query "Stacks[0].StackStatus" --output text --profile ${AWS_PROFILE} 2>/dev/null || echo "NOT_FOUND")
    
    if [[ "$stack_status" == "NOT_FOUND" ]]; then
        log_message "ERROR: Stack $full_stack_name not found."
        return 1
    elif [[ "$stack_status" == "CREATE_COMPLETE" || "$stack_status" == "UPDATE_COMPLETE" ]]; then
        log_message "Stack $full_stack_name verified: $stack_status"
        return 0
    else
        log_message "ERROR: Stack $full_stack_name is in an unexpected state: $stack_status"
        return 1
    fi
}

# Function to roll back a failed deployment
rollback_deployment() {
    local environment="$1"
    local stack_name="$2"
    
    log_message "Rolling back deployment of $stack_name in $environment environment..."
    
    # Prepare full stack name
    local full_stack_name="${STACK_PATTERN}${stack_name}-${environment}"
    
    # Change to CDK directory
    cd "$CDK_DIR"
    
    # Execute rollback using CloudFormation
    log_message "Running rollback for $full_stack_name..."
    
    # Check if this is a create or update failure
    local stack_status=$(aws cloudformation describe-stacks --stack-name $full_stack_name --query "Stacks[0].StackStatus" --output text --profile ${AWS_PROFILE} 2>/dev/null || echo "NOT_FOUND")
    
    if [[ "$stack_status" == "NOT_FOUND" ]]; then
        log_message "Stack $full_stack_name not found. Nothing to roll back."
        return 0
    elif [[ "$stack_status" == "CREATE_FAILED" ]]; then
        # For failed creations, delete the stack
        log_message "Stack creation failed. Deleting stack..."
        if ! aws cloudformation delete-stack --stack-name $full_stack_name --profile ${AWS_PROFILE}; then
            log_message "ERROR: Failed to delete stack $full_stack_name."
            return 1
        fi
    elif [[ "$stack_status" == "UPDATE_FAILED" || "$stack_status" == "UPDATE_ROLLBACK_FAILED" ]]; then
        # For failed updates, try to roll back the update
        log_message "Stack update failed. Rolling back..."
        if ! aws cloudformation continue-update-rollback --stack-name $full_stack_name --profile ${AWS_PROFILE}; then
            log_message "ERROR: Failed to roll back stack update for $full_stack_name."
            return 1
        fi
    else
        log_message "Stack $full_stack_name is in state $stack_status. No rollback needed."
        return 0
    fi
    
    # Wait for rollback to complete
    log_message "Waiting for rollback to complete..."
    if ! aws cloudformation wait stack-delete-complete --stack-name $full_stack_name --profile ${AWS_PROFILE}; then
        log_message "ERROR: Failed to wait for stack deletion of $full_stack_name."
        return 1
    fi
    
    log_message "Rollback of $full_stack_name completed successfully."
    return 0
}

# Function to deploy all stacks for the environment in the correct order
deploy_all_stacks() {
    local environment="$1"
    
    log_message "Deploying all stacks to $environment environment in the correct order..."
    
    # Deploy stacks in the correct order
    # 1. DynamoDB (data layer)
    # 2. IAM (security layer)
    # 3. Amplify (application layer)
    # 4. CloudFront (network layer)
    # 5. Monitoring (monitoring layer)
    
    local stacks=("DynamoDB" "IAM" "Amplify" "CloudFront" "Monitoring")
    local success=true
    
    for stack in "${stacks[@]}"; do
        if ! deploy_stack "$environment" "$stack"; then
            log_message "ERROR: Deployment of $stack failed."
            success=false
            break
        fi
        
        if ! verify_deployment "$environment" "$stack"; then
            log_message "ERROR: Verification of $stack deployment failed."
            success=false
            break
        fi
    done
    
    if $success; then
        log_message "All stacks deployed successfully to $environment environment."
        return 0
    else
        log_message "ERROR: Not all stacks were deployed successfully."
        return 1
    fi
}

# Main function that orchestrates the deployment process
main() {
    local environment="$DEFAULT_ENV"
    local stack="all"
    
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
            -s|--stack)
                if [[ -z "$2" || "$2" =~ ^- ]]; then
                    log_message "ERROR: Missing value for option $1"
                    print_usage
                    return 1
                fi
                stack="$2"
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
    
    log_message "Starting deployment to '$environment' environment for stack '$stack'..."
    
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
    
    # Set up AWS profile
    local profile_name="org-config-tool-${environment}"
    export AWS_PROFILE="$profile_name"
    
    # Verify bootstrap
    if ! verify_bootstrap "$environment"; then
        log_message "Failed to verify CDK bootstrap."
        return 1
    fi
    
    # Deploy stacks
    local deployment_success=false
    
    if [[ "$stack" == "all" ]]; then
        if deploy_all_stacks "$environment"; then
            deployment_success=true
        fi
    else
        # Normalize stack name to title case
        stack="$(tr '[:lower:]' '[:upper:]' <<< ${stack:0:1})${stack:1}"
        
        if deploy_stack "$environment" "$stack"; then
            if verify_deployment "$environment" "$stack"; then
                deployment_success=true
            else
                log_message "Deployment verification failed. Attempting rollback..."
                rollback_deployment "$environment" "$stack"
            fi
        else
            log_message "Deployment failed. Attempting rollback..."
            rollback_deployment "$environment" "$stack"
        fi
    fi
    
    if $deployment_success; then
        log_message "Deployment completed successfully."
        log_message "Log file is available at: $LOG_FILE"
        return 0
    else
        log_message "Deployment failed. Please check the log file for details."
        log_message "Log file is available at: $LOG_FILE"
        return 1
    fi
}

# Run the main function with all command line arguments
main "$@"
exit $?