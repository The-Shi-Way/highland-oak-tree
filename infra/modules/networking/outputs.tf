output "vpc_id" { value = aws_vpc.main.id }
output "public_subnet_ids" { value = aws_subnet.public[*].id }
output "private_subnet_ids" { value = aws_subnet.private[*].id }
output "alb_security_group_id" { value = aws_security_group.alb.id }
output "alb_dns_name" { value = aws_lb.main.dns_name }
output "alb_arn" { value = aws_lb.main.arn }

output "alb_zone_id" {
  description = "ALB canonical hosted zone ID for Route 53 alias records"
  value       = aws_lb.main.zone_id
}

output "server_target_group_arn" {
  description = "ARN of the server target group for ECS service registration"
  value       = aws_lb_target_group.server.arn
}

output "client_target_group_arn" {
  description = "ARN of the client target group for ECS service registration"
  value       = aws_lb_target_group.client.arn
}
