terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

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
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  
  tags = local.common_tags
}

# RDS Module
module "rds" {
  source = "./modules/rds"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  
  db_instance_class = var.db_instance_class
  db_name          = var.db_name
  db_username      = var.db_username
  
  tags = local.common_tags
}

# ECS Module
module "ecs" {
  source = "./modules/ecs"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.public_subnet_ids
  
  cluster_name = var.cluster_name
  
  tags = local.common_tags
}

# S3 Module
module "s3" {
  source = "./modules/s3"
  
  environment = var.environment
  
  tags = local.common_tags
}

# IAM Module
module "iam" {
  source = "./modules/iam"
  
  environment = var.environment
  
  tags = local.common_tags
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
