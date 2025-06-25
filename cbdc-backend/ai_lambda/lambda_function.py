import tensorflow as tf
import numpy as np
import json
import os

# Load the model from the directory
MODEL_DIR = os.environ.get("LAMBDA_TASK_ROOT")
model = tf.keras.models.load_model(os.path.join(MODEL_DIR, 'fraud_model'))

def lambda_handler(event, context):
    """
    Lambda function handler to predict transaction fraud.
    """
    try:
        # The event body comes as a string, parse it to a dictionary
        body = json.loads(event.get("body", "{}"))
        
        # Expect a list of transactions or a single transaction
        if 'transactions' not in body:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': "Missing 'transactions' key in request body."})
            }
        
        # Create a feature array from the input
        # The order must match the training data: ['amount', 'tx_per_hour', 'device_id_freq', 'is_foreign']
        feature_vectors = []
        for tx in body['transactions']:
            features = [
                tx.get('amount', 0),
                tx.get('tx_per_hour', 0),
                tx.get('device_id_freq', 0),
                tx.get('is_foreign', 0)
            ]
            feature_vectors.append(features)

        if not feature_vectors:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': "Transaction list cannot be empty."})
            }

        # Convert to numpy array for the model
        data_to_predict = np.array(feature_vectors)

        # Get predictions
        predictions = model.predict(data_to_predict)
        
        # Format the response
        results = [float(pred[0]) for pred in predictions]

        return {
            'statusCode': 200,
            'body': json.dumps({'fraud_scores': results})
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        } 