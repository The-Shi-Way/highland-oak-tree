variable "domain_name" {
  type        = string
  description = "Root domain (e.g. thehighlandoaktree.org). Empty string disables all resources."
}

variable "environment" {
  type        = string
  description = "Environment tag"
}

variable "project" {
  type        = string
  description = "Project tag"
}

variable "alb_dns_name" {
  type        = string
  description = "ALB DNS name for alias records"
}

variable "alb_zone_id" {
  type        = string
  description = "ALB hosted zone ID for alias records"
}

variable "cdn_domain_name" {
  type        = string
  description = "CloudFront distribution domain name"
}

variable "cdn_hosted_zone_id" {
  type        = string
  description = "CloudFront hosted zone ID (always Z2FDTNDATAQYW2 for CloudFront)"
}
