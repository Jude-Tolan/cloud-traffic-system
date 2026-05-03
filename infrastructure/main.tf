terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# SQS Queue
resource "aws_sqs_queue" "traffic_queue" {
  name = "cloudtraffic-queue"
}

# SNS Topic
resource "aws_sns_topic" "traffic_alerts" {
  name = "cloudtraffic-alerts"
}

resource "aws_sns_topic_subscription" "email_alert" {
  topic_arn = aws_sns_topic.traffic_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# DynamoDB Table
resource "aws_dynamodb_table" "traffic_data" {
  name           = "cloudtraffic_data"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "camera_id"
  range_key      = "timestamp_utc"

  attribute {
    name = "camera_id"
    type = "S"
  }

  attribute {
    name = "timestamp_utc"
    type = "S"
  }
}
