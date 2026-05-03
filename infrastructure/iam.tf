# IAM Role for Lambda Processor
resource "aws_iam_role" "lambda_processor_role" {
  name = "cloudtraffic_lambda_processor_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy" "lambda_processor_policy" {
  name = "cloudtraffic_lambda_processor_policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Effect   = "Allow"
        Resource = aws_sqs_queue.traffic_queue.arn
      },
      {
        Action = [
          "sns:Publish"
        ]
        Effect   = "Allow"
        Resource = aws_sns_topic.traffic_alerts.arn
      },
      {
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:BatchWriteItem"
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.traffic_data.arn
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "processor_attach" {
  role       = aws_iam_role.lambda_processor_role.name
  policy_arn = aws_iam_policy.lambda_processor_policy.arn
}

# IAM Role for API Lambda
resource "aws_iam_role" "lambda_api_role" {
  name = "cloudtraffic_lambda_api_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy" "lambda_api_policy" {
  name = "cloudtraffic_lambda_api_policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem"
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.traffic_data.arn
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "api_attach" {
  role       = aws_iam_role.lambda_api_role.name
  policy_arn = aws_iam_policy.lambda_api_policy.arn
}
