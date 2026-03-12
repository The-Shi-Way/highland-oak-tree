output "db_secret_arn" { value = aws_secretsmanager_secret.db.arn }
output "db_endpoint" { value = aws_db_instance.main.address }
output "redis_endpoint" { value = aws_elasticache_replication_group.main.primary_endpoint_address }
