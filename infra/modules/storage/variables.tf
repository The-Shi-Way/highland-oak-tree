variable "environment" { type = string }
variable "project" { type = string }
variable "domain_name" { type = string }

variable "certificate_arn" {
  type    = string
  default = ""
}

variable "media_subdomain" {
  type    = string
  default = ""
}
