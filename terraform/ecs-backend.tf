# Using hardcoded role ARN to avoid needing iam:GetRole permission
# The role ecs-task-execution-role already exists in your AWS account
locals {
  ecs_task_execution_role_arn = "arn:aws:iam::881962383269:role/ecs-task-execution-role"
}