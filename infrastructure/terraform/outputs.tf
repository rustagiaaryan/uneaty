output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = module.eks.cluster_certificate_authority_data
}

output "region" {
  description = "AWS region"
  value       = var.aws_region
}

output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "vpc_id" {
  description = "VPC ID used by EKS cluster"
  value       = module.vpc.vpc_id
}

output "elasticache_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_cluster.uneaty.cache_nodes.0.address
}

output "frontend_bucket_name" {
  description = "S3 bucket name for frontend assets"
  value       = aws_s3_bucket.frontend_assets.bucket
}