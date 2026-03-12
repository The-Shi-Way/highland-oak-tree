terraform {
  required_version = ">= 1.7.0"

  backend "s3" {
    bucket         = "highland-oak-tree-tfstate"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "highland-oak-tree-tflock"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "highland-oak-tree"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

module "networking" {
  source      = "./modules/networking"
  environment = var.environment
  project     = var.project
}

module "database" {
  source            = "./modules/database"
  environment       = var.environment
  project           = var.project
  vpc_id            = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  db_instance_class = var.db_instance_class
}

module "storage" {
  source      = "./modules/storage"
  environment = var.environment
  project     = var.project
  domain_name = var.domain_name
}

module "ecs" {
  source              = "./modules/ecs"
  environment         = var.environment
  project             = var.project
  vpc_id              = module.networking.vpc_id
  public_subnet_ids   = module.networking.public_subnet_ids
  private_subnet_ids  = module.networking.private_subnet_ids
  alb_security_group  = module.networking.alb_security_group_id
  server_image        = var.server_image
  client_image        = var.client_image
  db_secret_arn       = module.database.db_secret_arn
  redis_endpoint      = module.database.redis_endpoint
  media_bucket        = module.storage.media_bucket_name
  cdn_domain          = module.storage.cdn_domain
}

module "auth" {
  source      = "./modules/auth"
  environment = var.environment
  project     = var.project
}

module "monitoring" {
  source       = "./modules/monitoring"
  environment  = var.environment
  project      = var.project
  ecs_cluster  = module.ecs.cluster_name
  alarm_email  = var.alarm_email
}
