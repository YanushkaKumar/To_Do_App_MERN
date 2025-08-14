



# Get current AWS account ID and region for IAM policy
data "aws_caller_identity" "current" {}

# Get the latest ECS-Optimized Amazon Linux 2 AMI
data "aws_ami" "ecs_optimized" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-*-x86_64-ebs"]
  }
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

# IAM Role for the ECS Instance
resource "aws_iam_role" "ecs_instance_role" {
  name = "ecsInstanceRole"

  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

# Attach the standard ECS policy to the role
resource "aws_iam_role_policy_attachment" "ecs_instance_attach" {
  role       = aws_iam_role.ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

# **FIX:** Add policy to allow EC2 Instance Connect
resource "aws_iam_role_policy" "ec2_instance_connect_policy" {
  name = "EC2InstanceConnectPolicy"
  role = aws_iam_role.ecs_instance_role.id

  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action   = "ec2-instance-connect:SendSSHPublicKey",
        Effect   = "Allow",
        Resource = "arn:aws:ec2:${var.aws_region}:${data.aws_caller_identity.current.account_id}:instance/${aws_instance.ecs_node.id}",
        Condition = {
          StringEquals = {
            "ec2:osuser" = "ec2-user"
          }
        }
      }
    ]
  })
}

# IAM Instance Profile to attach the role to the EC2 instance
resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "ecs-instance-profile"
  role = aws_iam_role.ecs_instance_role.name
}

# --- ECS Cluster & EC2 Instance ---

# ECS Cluster definition
resource "aws_ecs_cluster" "main" {
  name = "my-ecs-cluster"
}

# EC2 Instance that will host the ECS tasks
resource "aws_instance" "ecs_node" {
  ami                         = data.aws_ami.ecs_optimized.id
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