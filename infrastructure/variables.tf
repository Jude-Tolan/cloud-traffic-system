variable "region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "alert_email" {
  description = "Email address to receive traffic alerts"
  default     = "traffic-admin@example.com"
}
