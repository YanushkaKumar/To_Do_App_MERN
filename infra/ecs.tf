# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "app-cluster-free-tier"
}

# ECS-Optimized AMI
data "aws_ami" "ecs" {
  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-*-x86_64-ebs"]
  }
  most_recent = true
  owners      = ["amazon"]
}

# IAM Instance Profile for ECS EC2 Instances
resource "aws_iam_instance_profile" "ecs_instance" {
  name = "ecsInstanceProfile"
  role = aws_iam_role.ecs_instance_role.name
}

# ECS Instance Role
resource "aws_iam_role" "ecs_instance_role" {
  name = "ecsInstanceRole"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Attach Policies to ECS Instance Role
resource "aws_iam_role_policy_attachment" "ecs_instance_role_policy" {
  role       = aws_iam_role.ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

# Launch Template for ECS EC2 Instances
resource "aws_launch_template" "ecs" {
  name_prefix   = "ecs-instance-"
  image_id      = data.aws_ami.ecs.id
  # Change this line back to t3.medium
  instance_type = "t3.medium"

  iam_instance_profile {
    name = aws_iam_instance_profile.ecs_instance.name
  }

  user_data = base64encode("#!/bin/bash\necho ECS_CLUSTER=${aws_ecs_cluster.main.name} >> /etc/ecs/ecs.config")
}

# Auto Scaling Group for ECS EC2 Instances
resource "aws_autoscaling_group" "ecs_asg" {
  desired_capacity    = 1
  max_size            = 2
  min_size            = 1
  protect_from_scale_in = true
  vpc_zone_identifier = aws_subnet.public[*].id

  launch_template {
    id      = aws_launch_template.ecs.id
    version = "$Latest"
  }

  tag {
    key                 = "AmazonECSManaged"
    value               = "true"
    propagate_at_launch = true
  }
}

# ECS Capacity Provider
resource "aws_ecs_capacity_provider" "ecs_cp" {
  name = "app-asg-capacity-provider"

  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.ecs_asg.arn
    managed_termination_protection = "ENABLED"

    managed_scaling {
      status                    = "ENABLED"
      target_capacity           = 100
      minimum_scaling_step_size = 1
      maximum_scaling_step_size = 1000
    }
  }
}

# Attach Capacity Provider to Cluster
resource "aws_ecs_cluster_capacity_providers" "ecs_cp_attach" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = [aws_ecs_capacity_provider.ecs_cp.name]
  default_capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.ecs_cp.name
    weight            = 1
  }
}

# Task Definition for Frontend
resource "aws_ecs_task_definition" "frontend" {
  family                   = "frontend-task"
  requires_compatibilities = ["EC2"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "frontend"
      image     = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/app-frontend-free:latest"
      essential = true,
      
      # --- ADD THIS ENVIRONMENT BLOCK ---
      # This tells your frontend container where to find the backend API.
      environment = [
        {
          # IMPORTANT: Change this name if your frontend app expects a different variable.
          name  = "REACT_APP_BACKEND_URL" 
          # We use the Load Balancer's DNS name dynamically. 
          # NOTE: This assumes your load balancer resource is named "aws_lb.main". 
          # If it has a different name, like "aws_lb.app_lb", update it here.
          # If you don't have the LB resource defined, you can temporarily hardcode the value.
          value = "http://${aws_lb.main.dns_name}:5050"
        }
      ],

      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
        }
      ]
    }
  ])
}

# Task Definition for Backend
resource "aws_ecs_task_definition" "backend" {
  family                   = "backend-task"
  requires_compatibilities = ["EC2"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/app-backend-free:latest"
      essential = true
      portMappings = [
        {
          containerPort = 5050
          hostPort      = 5050
          protocol      = "tcp"
        }
      ],
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = "5050"
        }
      ],
      # FINAL CORRECTION APPLIED HERE
      secrets = [
        {
          name      = "MONGO_URI"
          valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:MONGO_URI::"
        },
        {
          name      = "JWT_SECRET"
          valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:JWT_SECRET::"
        }
      ]
    }
  ])
}

# ECS Service for Frontend
resource "aws_ecs_service" "frontend" {
  name            = "frontend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1

  # Force a new deployment on every apply to ensure changes are picked up
  force_new_deployment = true

  capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.ecs_cp.name
    weight            = 1
  }

  network_configuration {
    subnets         = aws_subnet.public[*].id
    security_groups = [aws_security_group.ecs_service.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 80
  }

  depends_on = [aws_lb_listener.frontend_listener]
}

# ECS Service for Backend
resource "aws_ecs_service" "backend" {
  name            = "backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1

  # Force a new deployment on every apply to ensure changes are picked up
  force_new_deployment = true

  capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.ecs_cp.name
    weight            = 1
  }

  network_configuration {
    subnets         = aws_subnet.public[*].id
    security_groups = [aws_security_group.ecs_service.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 5050
  }

  depends_on = [aws_lb_listener.backend_listener]
}