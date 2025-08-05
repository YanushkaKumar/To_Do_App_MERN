resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecs_task_execution_role"

  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action    = "sts:AssumeRole",
        Effect    = "Allow",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Policy to allow reading secrets
resource "aws_iam_policy" "secrets_read_policy" {
  name        = "ECSTaskSecretsRead"
  description = "Allows ECS tasks to read from Secrets Manager"
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
          "kms:Decrypt"
        ],
        Effect   = "Allow",
        Resource = aws_secretsmanager_secret.app_secrets.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "secrets_policy_attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.secrets_read_policy.arn
}