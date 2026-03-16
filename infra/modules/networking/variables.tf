variable "environment" { type = string }
variable "project" { type = string }

variable "certificate_arn" {
  type        = string
  default     = ""
  description = "ACM certificate ARN for the HTTPS listener. Empty string disables the HTTPS listener."
}
