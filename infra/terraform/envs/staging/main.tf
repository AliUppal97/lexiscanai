terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Local values
locals {
  common_tags = {
    Project     = "LexiScan"
    Environment = "staging"
    ManagedBy   = "Terraform"
  }
}

# VPC Module
module "vpc" {
  source = "../modules/vpc"
  
  environment = "staging"
  vpc_cidr    = "10.1.0.0/16"
  
  tags = local.common_tags
}

# RDS Module
module "rds" {
  source = "../modules/rds"
  
  environment = "staging"
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  
  db_instance_class = "db.t3.small"
  db_name          = "lexiscan_staging"
  db_username      = "lexiscan_staging"
  db_password      = var.db_password
  
  tags = local.common_tags
}

# ECS Module
module "ecs" {
  source = "../modules/ecs"
  
  environment = "staging"
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.public_subnet_ids
  
  cluster_name = "lexiscan-staging"
  aws_region   = var.aws_region
  ecr_repository_url = var.ecr_repository_url
  certificate_arn    = var.certificate_arn
  domain            = var.domain
  database_url_secret_arn = var.database_url_secret_arn
  
  tags = local.common_tags
}

# S3 Module
module "s3" {
  source = "../modules/s3"
  
  environment = "staging"
  
  tags = local.common_tags
}

# IAM Module
module "iam" {
  source = "../modules/iam"
  
  environment = "staging"
  
  tags = local.common_tags
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "ecr_repository_url" {
  description = "ECR repository URL"
  type        = string
}

variable "certificate_arn" {
  description = "SSL certificate ARN"
  type        = string
}

variable "domain" {
  description = "Domain name"
  type        = string
}

variable "database_url_secret_arn" {
  description = "Database URL secret ARN"
  type        = string
}

# Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.endpoint
  sensitive   = true
}

output "ecs_cluster_id" {
  description = "ECS cluster ID"
  value       = module.ecs.cluster_id
}

output "s3_bucket_name" {
  description = "S3 bucket name for file storage"
  value       = module.s3.bucket_name
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.ecs.alb_dns_name
}
