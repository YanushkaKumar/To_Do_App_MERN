resource "aws_secretsmanager_secret" "app_secrets" {
  name = "application_secrets_v2"
}

resource "aws_secretsmanager_secret_version" "app_secrets_version" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    MONGO_URI  = "mongodb+srv://yanushkakumaar:D5hGHSieYM6CFaXx@cluster0.blnzamp.mongodb.net/todoDB?retryWrites=true&w=majority&appName=Cluster0" # From docker-compose.yml
    JWT_SECRET = "12345" # From docker-compose.yml. Change this to a strong, random string.
  })
}