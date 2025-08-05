# Fetch two availability zones in the selected region to deploy into
data "aws_availability_zones" "available" {
  state = "available"
}

# Define the VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "app-vpc"
  }
}

# Define two public subnets
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  availability_zone = data.aws_availability_zones.available.names[count.index]
  cidr_block        = "10.0.${count.index + 1}.0/24"
  map_public_ip_on_launch = true # Instances in public subnets get a public IP
  tags = {
    Name = "app-public-subnet-${count.index + 1}"
  }
}

# Define two private subnets
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  availability_zone = data.aws_availability_zones.available.names[count.index]
  cidr_block        = "10.0.${count.index + 101}.0/24"
  tags = {
    Name = "app-private-subnet-${count.index + 1}"
  }
}

# Internet Gateway for public subnets
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

# Associate public route table with public subnets
resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}