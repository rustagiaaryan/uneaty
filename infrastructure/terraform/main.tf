provider "aws" {
  region = var.aws_region
}

# VPC for the EKS cluster
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 3.0"

  name = "uneaty-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
  enable_vpn_gateway = false

  # Tags required for EKS
  private_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"           = "1"
  }

  public_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
  }

  tags = {
    Environment = var.environment
    Project     = "UnEaty"
  }
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  version = "~> 18.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.24"

  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets

  # EKS Managed Node Group(s)
  eks_managed_node_group_defaults = {
    disk_size      = 50
    instance_types = ["t3.medium"]
  }

  eks_managed_node_groups = {
    uneaty_workers = {
      min_size     = 2
      max_size     = 5
      desired_size = 2

      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"

      tags = {
        Environment = var.environment
        Project     = "UnEaty"
      }
    }
  }

  tags = {
    Environment = var.environment
    Project     = "UnEaty"
  }
}

# RDS Database for MongoDB
resource "aws_db_subnet_group" "uneaty" {
  name       = "uneaty-db-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name = "UnEaty DB subnet group"
  }
}

resource "aws_security_group" "db_sg" {
  name        = "uneaty-db-sg"
  description = "Allow MongoDB traffic"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "UnEaty DB Security Group"
  }
}

# ElastiCache for Redis (session cache)
resource "aws_elasticache_subnet_group" "uneaty" {
  name       = "uneaty-cache-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "cache_sg" {
  name        = "uneaty-cache-sg"
  description = "Allow Redis traffic"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "UnEaty Cache Security Group"
  }
}

resource "aws_elasticache_cluster" "uneaty" {
  cluster_id           = "uneaty-cache"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis6.x"
  subnet_group_name    = aws_elasticache_subnet_group.uneaty.name
  security_group_ids   = [aws_security_group.cache_sg.id]
  port                 = 6379
}

# S3 bucket for static assets
resource "aws_s3_bucket" "frontend_assets" {
  bucket = "${var.project_name}-frontend-assets"

  tags = {
    Name        = "${var.project_name} Frontend Assets"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "frontend_assets" {
  bucket = aws_s3_bucket.frontend_assets.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "allow_access_from_cloudfront" {
  bucket = aws_s3_bucket.frontend_assets.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend_assets.arn}/*"
      }
    ]
  })
}