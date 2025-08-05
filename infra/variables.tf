variable "aws_account_id" {
  description = "881962383269"
  type        = string
  # No default value, so Terraform will require you to provide one.
}

variable "aws_region" {
  description = "The AWS Region to deploy resources in."
  type        = string
  default     = "us-east-1"
}