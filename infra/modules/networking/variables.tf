variable "environment" { type = string }
variable "project" { type = string }

variable "certificate_arn" {
  type        = string
  default     = ""
  description = "ACM certificate ARN for the HTTPS listener. Empty string disables the HTTPS listener."
}

variable "domain_name" {
  type        = string
  default     = ""
  description = "Domain name — used for count conditionals (known at plan time unlike certificate_arn)."
}
