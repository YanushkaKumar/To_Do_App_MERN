resource "aws_ecr_repository" "frontend" {
  name = "app-frontend-free"
}

resource "aws_ecr_repository" "backend" {
  name = "app-backend-free"
}
