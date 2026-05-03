import json
import os
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
DYNAMODB_TABLE = os.getenv('DYNAMODB_TABLE', 'cloudtraffic_data')
CAMERAS = ['CAM-001-NORTH', 'CAM-002-SOUTH', 'CAM-003-EAST', 'CAM-004-WEST']

def lambda_handler(event, context):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    }
    
    try:
        table = dynamodb.Table(DYNAMODB_TABLE)
        data = []
        
        # Query the latest 5 records for each camera
        for cam in CAMERAS:
            response = table.query(
                KeyConditionExpression=Key('camera_id').eq(cam),
                ScanIndexForward=False, # sort descending
                Limit=5
            )
            data.extend(response.get('Items', []))
            
        # Convert Decimals to ints/floats for JSON serialization
        for item in data:
            item['vehicle_count'] = int(item['vehicle_count'])
            item['average_speed_mph'] = int(item['average_speed_mph'])
            item['timestamp'] = item['timestamp_utc'] # Match what frontend expects
            
        if not data:
            raise Exception("No data found in DynamoDB, falling back to mock")

        # Sort the combined list by timestamp descending
        data.sort(key=lambda x: x['timestamp_utc'], reverse=True)

        return {"statusCode": 200, "headers": headers, "body": json.dumps(data[:20])}
        
    except Exception as e:
        print(f"Error querying DynamoDB: {e}")
        
    # Fallback/Mock data if DB is empty or error occurs
    import random
    from datetime import datetime, timezone
    
    mock_data = []
    for cam in CAMERAS:
        base = random.randint(20, 60)
        mock_data.append({
            "camera_id": cam,
            "vehicle_count": base,
            "average_speed_mph": max(10, 65 - (base // 3)),
            "congestion_level": "LOW" if base < 40 else "MEDIUM",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps(mock_data)
    }
