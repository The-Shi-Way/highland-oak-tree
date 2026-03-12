variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type = string
}

variable "project" {
  type    = string
  default = "highland-oak-tree"
}

variable "domain_name" {
  type    = string
  default = ""
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "server_image" {
  type = string
}

variable "client_image" {
  type = string
}

variable "alarm_email" {
  type    = string
  default = ""
}
