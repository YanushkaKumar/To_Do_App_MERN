variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "frontend_repo" {
  description = "ECR frontend repo name"
  type        = string
}

variable "backend_repo" {
  description = "ECR backend repo name"
  type        = string
}

variable "ecs_cluster_name" {
  description = "ECS Cluster name"
  type        = string
}

variable "ec2_key_name" {
  description = "EC2 key pair name for SSH access"
  type        = string
}
