variable "aws_region" {
  description = "The AWS region to deploy resources in."
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "The CIDR block for the VPC."
  default     = "10.0.0.0/16"
}

variable "subnet_cidr" {
  description = "The CIDR block for the public subnet."
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "The EC2 instance type for the ECS node."
  default     = "t3.micro"
}

variable "key_name" {
  description = "The name of the existing EC2 key pair to use."
  default     = "my-app-v2-key"
}