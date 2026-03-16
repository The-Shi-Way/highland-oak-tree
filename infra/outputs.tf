output "alb_dns" {
  value = module.networking.alb_dns_name
}

output "cdn_domain" {
  value = module.storage.cdn_domain
}

output "cognito_user_pool_id" {
  value = module.auth.user_pool_id
}

output "cognito_client_id" {
  value = module.auth.client_id
}

output "route53_name_servers" {
  description = "Route 53 name servers for NS delegation at domain registrar"
  value       = module.dns.name_servers
}
