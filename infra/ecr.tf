# NOTE: The AWS Free Tier includes 500MB-month of storage for private repositories.
# For larger needs, consider using AWS ECR Public, which has a 50GB free tier.
resource "aws_ecr_repository" "frontend" {
  name                 = "app-frontend-free"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "backend" {
  name                 = "app-backend-free"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}