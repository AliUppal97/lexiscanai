terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# IAM Role for Lambda functions
resource "aws_iam_role" "lambda_execution" {
  name = "${var.environment}-lambda-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.environment}-lambda-execution-role"
  })
}

# IAM Policy for Lambda to access S3
resource "aws_iam_policy" "lambda_s3_access" {
  name        = "${var.environment}-lambda-s3-access"
  description = "Policy for Lambda to access S3 buckets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::${var.environment}-lexiscan-files",
          "arn:aws:s3:::${var.environment}-lexiscan-files/*",
          "arn:aws:s3:::${var.environment}-lexiscan-static",
          "arn:aws:s3:::${var.environment}-lexiscan-static/*"
        ]
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.environment}-lambda-s3-access"
  })
}

# Attach S3 access policy to Lambda role
resource "aws_iam_role_policy_attachment" "lambda_s3_access" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.lambda_s3_access.arn
}

# Attach basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# IAM Role for API Gateway
resource "aws_iam_role" "api_gateway" {
  name = "${var.environment}-api-gateway-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.environment}-api-gateway-role"
  })
}

# IAM Policy for API Gateway to invoke Lambda
resource "aws_iam_policy" "api_gateway_lambda_invoke" {
  name        = "${var.environment}-api-gateway-lambda-invoke"
  description = "Policy for API Gateway to invoke Lambda functions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          "arn:aws:lambda:*:*:function:${var.environment}-lexiscan-*"
        ]
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.environment}-api-gateway-lambda-invoke"
  })
}

# Attach Lambda invoke policy to API Gateway role
resource "aws_iam_role_policy_attachment" "api_gateway_lambda_invoke" {
  role       = aws_iam_role.api_gateway.name
  policy_arn = aws_iam_policy.api_gateway_lambda_invoke.arn
}

# IAM Role for CloudWatch Logs
resource "aws_iam_role" "cloudwatch_logs" {
  name = "${var.environment}-cloudwatch-logs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "logs.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.environment}-cloudwatch-logs-role"
  })
}

# IAM Policy for CloudWatch Logs
resource "aws_iam_policy" "cloudwatch_logs" {
  name        = "${var.environment}-cloudwatch-logs-policy"
  description = "Policy for CloudWatch Logs"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = [
          "arn:aws:logs:*:*:log-group:/aws/lambda/${var.environment}-lexiscan-*",
          "arn:aws:logs:*:*:log-group:/ecs/${var.environment}-lexiscan-*"
        ]
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.environment}-cloudwatch-logs-policy"
  })
}

# Attach CloudWatch Logs policy
resource "aws_iam_role_policy_attachment" "cloudwatch_logs" {
  role       = aws_iam_role.cloudwatch_logs.name
  policy_arn = aws_iam_policy.cloudwatch_logs.arn
}

# IAM User for CI/CD
resource "aws_iam_user" "cicd" {
  name = "${var.environment}-lexiscan-cicd"

  tags = merge(var.tags, {
    Name = "${var.environment}-lexiscan-cicd"
  })
}

# IAM Policy for CI/CD
resource "aws_iam_policy" "cicd" {
  name        = "${var.environment}-lexiscan-cicd-policy"
  description = "Policy for CI/CD operations"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "iam:PassRole"
        ]
        Resource = [
          "arn:aws:iam::*:role/${var.environment}-ecs-execution-role",
          "arn:aws:iam::*:role/${var.environment}-ecs-task-role"
        ]
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.environment}-lexiscan-cicd-policy"
  })
}

# Attach CI/CD policy to user
resource "aws_iam_user_policy_attachment" "cicd" {
  user       = aws_iam_user.cicd.name
  policy_arn = aws_iam_policy.cicd.arn
}

# Create access key for CI/CD user
resource "aws_iam_access_key" "cicd" {
  user = aws_iam_user.cicd.name
}

# Variables
variable "environment" {
  description = "Environment name"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

# Outputs
output "lambda_execution_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.lambda_execution.arn
}

output "api_gateway_role_arn" {
  description = "ARN of the API Gateway role"
  value       = aws_iam_role.api_gateway.arn
}

output "cloudwatch_logs_role_arn" {
  description = "ARN of the CloudWatch Logs role"
  value       = aws_iam_role.cloudwatch_logs.arn
}

output "cicd_user_access_key_id" {
  description = "Access key ID for CI/CD user"
  value       = aws_iam_access_key.cicd.id
  sensitive   = true
}

output "cicd_user_secret_access_key" {
  description = "Secret access key for CI/CD user"
  value       = aws_iam_access_key.cicd.secret
  sensitive   = true
}
