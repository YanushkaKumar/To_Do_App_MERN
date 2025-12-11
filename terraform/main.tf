



# Get current AWS account ID and region for IAM policy
data "aws_caller_identity" "current" {}

# Hardcoded ECS-Optimized Amazon Linux 2 AMI for us-east-1
# This avoids needing ec2:DescribeImages permission
locals {
  ecs_ami_id = "ami-0b3ca45933d9d6d87"
}

# --- Networking ---

# VPC
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  tags       = { Name = "main-vpc" }
}

# Internet Gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "main-igw" }
}

# Public Subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.subnet_cidr
  availability_zone       = "${var.aws_region}a" # Use the region's 'a' AZ
  map_public_ip_on_launch = true
  tags                    = { Name = "public-subnet" }
}

# Route Table for public traffic
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
}

# Associate Route Table with the Public Subnet
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Security Group for the EC2 Instance
resource "aws_security_group" "ecs_sg" {
  name        = "ecs-sg"
  description = "Allow SSH, App, and all egress traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Allow SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow access to the application on port 5050"
    from_port   = 5050
    to_port     = 5050
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ecs-security-group"
  }
}

# --- IAM Role and Policies ---

# IAM Instance Profile to attach the existing role to the EC2 instance
# Using hardcoded role name to avoid needing iam:GetRole permission
resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "ecs-instance-profile"
  role = "ecsInstanceRole"
}

# --- ECS Cluster & EC2 Instance ---

# ECS Cluster definition
resource "aws_ecs_cluster" "main" {
  name = "my-ecs-cluster"
}

# EC2 Instance that will host the ECS tasks
resource "aws_instance" "ecs_node" {
  ami                         = local.ecs_ami_id
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.ecs_sg.id]
  key_name                    = var.key_name
  iam_instance_profile        = aws_iam_instance_profile.ecs_instance_profile.name
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              echo ECS_CLUSTER=${aws_ecs_cluster.main.name} >> /etc/ecs/ecs.config
              yum update -y
              EOF

  tags = {
    Name = "ecs-node"
  }
}

# --- Outputs ---

# Output the public IP address of the EC2 instance
output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.ecs_node.public_ip
}