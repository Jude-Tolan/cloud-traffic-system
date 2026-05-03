import json
import os
import boto3

dynamodb = boto3.resource('dynamodb')
sns_client = boto3.client('sns')

DYNAMODB_TABLE = os.getenv('DYNAMODB_TABLE', 'cloudtraffic_data')
SNS_TOPIC_ARN = os.getenv('SNS_TOPIC_ARN')

def lambda_handler(event, context):
    table = dynamodb.Table(DYNAMODB_TABLE)
    
    for record in event['Records']:
        body = json.loads(record['body'])
        camera_id = body['camera_id']
        timestamp = body['timestamp'] # Keep full ISO format
        vehicle_count = body['vehicle_count']
        speed = body['average_speed_mph']
        level = body['congestion_level']
        
        # Insert into DynamoDB
        table.put_item(
            Item={
                'camera_id': camera_id,
                'timestamp_utc': timestamp,
                'vehicle_count': vehicle_count,
                'average_speed_mph': speed,
                'congestion_level': level
            }
        )
        
        # Simple threshold for alerting
        if vehicle_count > 120:
            sns_client.publish(
                TopicArn=SNS_TOPIC_ARN,
                Subject=f"CloudTraffic Alert: {camera_id}",
                Message=f"High traffic detected on {camera_id} at {timestamp} UTC.\nVehicle count: {vehicle_count}.\nSpeed: {speed} mph."
            )
            
    return {"statusCode": 200, "body": "Processed successfully."}
