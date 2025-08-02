resource "aws_ssm_parameter" "mongo_uri" {
  name  = "/app/mongo_uri"
  type  = "SecureString" # Encrypts the parameter
  value = "mongodb+srv://yanushkakumaar:D5hGHSieYM6CFaXx@cluster0.blnzamp.mongodb.net/todoDB?retryWrites=true&w=majority&appName=Cluster0" # From docker-compose.yml
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/app/jwt_secret"
  type  = "SecureString"
  value = "12345" # From docker-compose.yml. [cite_start]IMPORTANT: Change this to a strong, random string. [cite: 2]
}