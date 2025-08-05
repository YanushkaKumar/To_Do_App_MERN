# Application Load Balancer
resource "aws_lb" "main" {
  name               = "app-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ecs_service.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    Name = "app-lb"
  }
}

# Target group for frontend service
resource "aws_lb_target_group" "frontend" {
  name        = "frontend-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    Name = "frontend-tg"
  }
}

# Target group for backend service
resource "aws_lb_target_group" "backend" {
  name        = "backend-tg"
  port        = 5050
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    Name = "backend-tg"
  }
}

# Listener on port 80 (Frontend Service)
resource "aws_lb_listener" "frontend_listener" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# Listener on port 5050 (Backend Service)
resource "aws_lb_listener" "backend_listener" {
  load_balancer_arn = aws_lb.main.arn
  port              = 5050
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}
