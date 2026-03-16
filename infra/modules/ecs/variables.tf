variable "environment" { type = string }
variable "project" { type = string }
variable "vpc_id" { type = string }
variable "public_subnet_ids" { type = list(string) }
variable "private_subnet_ids" { type = list(string) }
variable "alb_security_group" { type = string }
variable "server_image" { type = string }
variable "client_image" { type = string }
variable "db_secret_arn" { type = string }
variable "redis_endpoint" { type = string }
variable "media_bucket" { type = string }
variable "cdn_domain" { type = string }

variable "server_target_group_arn" {
  type    = string
  default = ""
}

variable "client_target_group_arn" {
  type    = string
  default = ""
}

variable "domain_name" {
  type    = string
  default = ""
}
