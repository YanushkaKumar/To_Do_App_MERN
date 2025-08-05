output "load_balancer_dns_name" {
  description = "The DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "frontend_ecr_repository_url" {
  description = "The URL of the frontend ECR repository"
  value       = aws_ecr_repository.frontend.repository_url
}

output "backend_ecr_repository_url" {
  description = "The URL of the backend ECR repository"
  value       = aws_ecr_repository.backend.repository_url
}