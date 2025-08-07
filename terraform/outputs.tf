output "ecs_instance_ip" {
  description = "Public IP of ECS EC2 node"
  value       = aws_instance.ecs_node.public_ip
}

output "ecs_cluster_name" {
  description = "The name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "application_url" {
  description = "The URL to access the running NGINX container"
  value       = "http://${aws_instance.ecs_node.public_ip}:5050"
}