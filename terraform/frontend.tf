# 1. Create the S3 bucket to store the static website files
resource "aws_s3_bucket" "frontend" {
  bucket = "yanushka-unique-react-app-bucket" # <-- IMPORTANT: Use a globally unique name
}

# 2. Configure the bucket for public access
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# 3. Configure the bucket for static website hosting
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html" # Redirect all errors to index.html for React Router
  }
}

# 4. Apply a bucket policy to allow public read access
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "PublicReadGetObject",
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

# 5. Output the S3 bucket website URL
output "frontend_url" {
  description = "The URL of the frontend application."
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}