from flask import Flask, request, jsonify
from inference_sdk import InferenceHTTPClient
import base64
import cv2
import numpy as np

app = Flask(__name__)

# Initialize the inference client with your Roboflow API details
CLIENT = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="RBLxcPUj7Talpqvu3TYF"
)

@app.route('/detect', methods=['POST'])
def detect():
    # Parse the incoming JSON payload
    data = request.json
    # Extract the base64-encoded image data (assumes format "data:image/jpeg;base64,...")
    image_data = data['image'].split(',')[1]
    image_bytes = base64.b64decode(image_data)
    
    # Convert the image bytes into an OpenCV image
    image_np = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
    
    # Perform inference using the Roboflow model
    result = CLIENT.infer(image, model_id="eye-disease-svz00/6")
    
    # Process the predictions to extract relevant detection info
    detections = []
    for prediction in result.get('predictions', []):
        detections.append({
            'class': prediction.get('class'),
            'confidence': prediction.get('confidence'),
            'bbox': {
                'x': prediction.get('x'),
                'y': prediction.get('y'),
                'width': prediction.get('width'),
                'height': prediction.get('height')
            }
        })
    
    # Return the detections and count as JSON
    return jsonify({
        'detections': detections,
        'count': len(detections)
    })

if __name__ == '__main__':
    app.run(debug=True)
