variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "lexiscan"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "lexiscan"
}

variable "cluster_name" {
  description = "ECS cluster name"
  type        = string
  default     = "lexiscan"
}
