# Define the VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "app-vpc-free-tier"
  }
}

# Fetch two available zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Define two public subnets across two different availability zones
resource "aws_subnet" "public" {
  count                   = 2 # Create 2 subnets
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  map_public_ip_on_launch = true
  availability_zone       = data.aws_availability_zones.available.names[count.index] # Use a different AZ for each
  tags = {
    Name = "app-public-subnet-${count.index + 1}"
  }
}

# Internet Gateway for the public subnet
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "app-igw"
  }
}

# Route table for public traffic
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
  tags = {
    Name = "app-public-rt"
  }
}

# Associate public route table with BOTH public subnets
resource "aws_route_table_association" "public" {
  count          = 2 # Associate both subnets
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}