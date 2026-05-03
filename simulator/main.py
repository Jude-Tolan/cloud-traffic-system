import time
import json
import random
import os
import uuid
import boto3
from datetime import datetime, timezone

# Load config from environment variables
SQS_QUEUE_URL = os.getenv('SQS_QUEUE_URL', 'YOUR_SQS_QUEUE_URL_HERE')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')

# Initialize SQS client
sqs = boto3.client('sqs', region_name=AWS_REGION)

CAMERAS = ['CAM-001-NORTH', 'CAM-002-SOUTH', 'CAM-003-EAST', 'CAM-004-WEST']

def generate_reading(camera_id):
    """Generate a simulated traffic reading."""
    # Simulate a sudden spike for CAM-001 to trigger alerts occasionally
    is_spiking = camera_id == 'CAM-001-NORTH' and random.random() < 0.2
    
    base_flow = random.randint(10, 50)
    if is_spiking:
        base_flow += random.randint(100, 200)

    return {
        'camera_id': camera_id,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'vehicle_count': base_flow,
        'average_speed_mph': max(10, 65 - (base_flow // 3)), # Speed drops as volume increases
        'congestion_level': 'HIGH' if base_flow > 100 else ('MEDIUM' if base_flow > 40 else 'LOW')
    }

def publish_to_sqs(reading):
    """Publish a single reading to the SQS queue."""
    if SQS_QUEUE_URL == 'YOUR_SQS_QUEUE_URL_HERE':
        print(f"[{reading['timestamp']}] DRY RUN (No SQS URL set) {reading['camera_id']}: {reading['vehicle_count']} vehicles")
        return

    try:
        kwargs = {
            'QueueUrl': SQS_QUEUE_URL,
            'MessageBody': json.dumps(reading),
        }
        
        # If it's a FIFO queue, we need MessageGroupId and MessageDeduplicationId
        if SQS_QUEUE_URL.endswith('.fifo'):
            kwargs['MessageGroupId'] = reading['camera_id']
            kwargs['MessageDeduplicationId'] = str(uuid.uuid4())
            
        response = sqs.send_message(**kwargs)
        print(f"[{reading['timestamp']}] Published {reading['camera_id']}: {reading['vehicle_count']} vehicles (MsgID: {response.get('MessageId')})")
    except Exception as e:
        print(f"Error publishing to SQS: {e}")

def main():
    print("========================================")
    print("Starting CloudTraffic Simulator...")
    print(f"Target SQS Queue: {SQS_QUEUE_URL}")
    print(f"Region: {AWS_REGION}")
    print("========================================")
    
    while True:
        for camera in CAMERAS:
            reading = generate_reading(camera)
            publish_to_sqs(reading)
        
        # Wait 5 seconds before the next reading
        time.sleep(5)

if __name__ == '__main__':
    main()
