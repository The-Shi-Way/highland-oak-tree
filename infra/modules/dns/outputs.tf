output "certificate_arn" {
  description = "ACM certificate ARN (empty string when domain is not configured)"
  value       = var.domain_name != "" ? aws_acm_certificate_validation.main[0].certificate_arn : ""
}

output "name_servers" {
  description = "Route 53 name server records for NS delegation at domain registrar"
  value       = var.domain_name != "" ? aws_route53_zone.main[0].name_servers : []
}

output "zone_id" {
  description = "Route 53 hosted zone ID (empty string when domain is not configured)"
  value       = var.domain_name != "" ? aws_route53_zone.main[0].zone_id : ""
}
