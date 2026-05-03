data "archive_file" "processor_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda/processor.py"
  output_path = "${path.module}/lambda/processor.zip"
}

resource "aws_lambda_function" "processor" {
  filename      = data.archive_file.processor_zip.output_path
  function_name = "cloudtraffic-processor"
  role          = aws_iam_role.lambda_processor_role.arn
  handler       = "processor.lambda_handler"
  runtime       = "python3.11"
  source_code_hash = data.archive_file.processor_zip.output_base64sha256

  environment {
    variables = {
      SNS_TOPIC_ARN   = aws_sns_topic.traffic_alerts.arn
      DYNAMODB_TABLE  = aws_dynamodb_table.traffic_data.name
    }
  }
}

resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = aws_sqs_queue.traffic_queue.arn
  function_name    = aws_lambda_function.processor.arn
  batch_size       = 10
}

data "archive_file" "api_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda/api.py"
  output_path = "${path.module}/lambda/api.zip"
}

resource "aws_lambda_function" "api" {
  filename      = data.archive_file.api_zip.output_path
  function_name = "cloudtraffic-api"
  role          = aws_iam_role.lambda_api_role.arn
  handler       = "api.lambda_handler"
  runtime       = "python3.11"
  source_code_hash = data.archive_file.api_zip.output_base64sha256

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.traffic_data.name
    }
  }
}
