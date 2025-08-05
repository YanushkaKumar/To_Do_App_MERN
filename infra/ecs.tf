# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "app-cluster-free-tier"
}

# Task Definition for Frontend
resource "aws_ecs_task_definition" "frontend" {
  family                   = "frontend-task"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = "256"
  memory                  = "512"
  execution_role_arn      = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "frontend"
      image     = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/app-frontend-free:latest"
      essential = true
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
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = "256"
  memory                  = "512"
  execution_role_arn      = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_execution_role.arn

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
      secrets = [
        {
          name      = "MONGO_URI"
          valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:MONGO_URI"
        },
        {
          name      = "JWT_SECRET"
          valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:JWT_SECRET"
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
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets         = aws_subnet.public[*].id
    security_groups = [aws_security_group.ecs_service.id]
    assign_public_ip = true
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
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets         = aws_subnet.public[*].id
    security_groups = [aws_security_group.ecs_service.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 5050
  }

  depends_on = [aws_lb_listener.backend_listener]

}
