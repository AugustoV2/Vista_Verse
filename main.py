from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
from inference_sdk import InferenceHTTPClient
import base64
import cv2
import numpy as np
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Setup logging for debugging
logging.basicConfig(level=logging.INFO)

# Dataset configuration
CLASSES = ['bulging_eyes', 'cataract', 'crossed_eye', 'glaucoma', 'uveitis']

# Initialize the inference client with your Roboflow API details
CLIENT = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="RBLxcPUj7Talpqvu3TYF"  # Replace with your actual API key if needed
)

@app.route('/detect', methods=['POST'])
def detect():
    # Parse the incoming JSON payload
    data = request.json
    if 'image' not in data:
        return jsonify({"error": "No image provided"}), 400

    try:
        # Extract the base64-encoded image data (assumes format "data:image/jpeg;base64,...")
        image_data = data['image'].split(',')[1]
        image_bytes = base64.b64decode(image_data)
    except Exception as e:
        logging.error("Error decoding image: %s", e)
        return jsonify({"error": "Invalid image data"}), 400

    # Convert the image bytes into an OpenCV image
    image_np = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
    if image is None:
        logging.error("Error decoding image into OpenCV format.")
        return jsonify({"error": "Could not decode image"}), 400

    # Perform inference using the Roboflow model
    try:
        result = CLIENT.infer(image, model_id="eye-disease-svz00/6")
        logging.info("Inference result: %s", result)
    except Exception as e:
        logging.error("Error during inference: %s", e)
        return jsonify({"error": "Inference failed"}), 500

    # Process the predictions to extract relevant detection info and validate classes
    detections = []
    for prediction in result.get('predictions', []):
        pred_class = prediction.get('class')
        # Optionally, filter out predictions not in the expected classes
        if pred_class not in CLASSES:
            logging.warning("Unexpected class detected: %s", pred_class)
            continue
        
        detections.append({
            'class': pred_class,
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
