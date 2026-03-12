output "cluster_name" { value = aws_ecs_cluster.main.name }
output "server_service_name" { value = aws_ecs_service.server.name }
output "client_service_name" { value = aws_ecs_service.client.name }
