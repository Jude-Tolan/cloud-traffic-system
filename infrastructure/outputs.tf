output "sqs_queue_url" {
  value = aws_sqs_queue.traffic_queue.url
}

output "api_endpoint" {
  value = "${aws_apigatewayv2_api.http_api.api_endpoint}/traffic"
}
