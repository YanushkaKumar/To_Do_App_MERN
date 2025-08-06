# secrets.tf

resource "aws_secretsmanager_secret" "app_secrets" {
  name = "application_secrets_v2"
}

resource "aws_secretsmanager_secret_version" "app_secrets_version" {
  secret_id     = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    MONGO_URI  = "mongodb+srv://yanushkakumaar:D5hGHSieYM6CFaXx@cluster0.blnzamp.mongodb.net/todoDB?retryWrites=true&w=majority&appName=Cluster0"
    JWT_SECRET = "12345" # For production, generate a strong, random string.
  })
}