from flask import Flask, request, jsonify
import pickle
import os
import json
import threading
from train import train_model

app = Flask(__name__)

# Load models at startup
def load_models():
    global model, vectorizer
    try:
        model = pickle.load(open("model.pkl", "rb"))
        vectorizer = pickle.load(open("vectorizer.pkl", "rb"))
        print("Models successfully loaded into memory.")
    except FileNotFoundError:
        print("Models not found. Ensure train.py has been run.")
        model = None
        vectorizer = None

load_models()

def log_user_query(text, label):
    """Automatically log user queries to dataset.json"""
    cleaned_text = text.lower().strip()
    try:
        with open("dataset.json", "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        data = []
        
    # Only log if it doesn't already exist
    if not any(d.get("text") == cleaned_text for d in data):
        data.append({"text": cleaned_text, "label": label})
        with open("dataset.json", "w") as f:
            json.dump(data, f, indent=2)

def background_retrain():
    """Run training in a background thread and hot-reload"""
    print("Starting background retraining pipeline...")
    train_model()
    load_models()
    print("Background retraining and hot-reload complete.")

@app.route("/predict", methods=["POST"])
def predict():
    if not model or not vectorizer:
        return jsonify({"error": "Models not loaded"}), 500

    data = request.json
    if not data or "text" not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data["text"]
    try:
        X = vectorizer.transform([text])
        
        # Get the highest probability instead of just a forced prediction
        probabilities = model.predict_proba(X)[0]
        max_prob = max(probabilities)
        
        classes = model.classes_
        top_class_index = probabilities.argmax()
        prediction = classes[top_class_index]
        
        # If the model is guessing (< 35% confident), mark it as unrelated
        if max_prob < 0.35:
            intent = "unrelated"
        else:
            intent = prediction
            
        # PIPELINE SAFEGUARD: Only log user queries if the model is highly confident.
        # This prevents random words (like "food") from corrupting the dataset!
        if max_prob > 0.60:
            log_user_query(text, prediction)
        
        return jsonify({"intent": intent, "confidence": float(max_prob)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/retrain", methods=["POST"])
def retrain():
    """Trigger the pipeline to retrain on new user data"""
    threading.Thread(target=background_retrain).start()
    return jsonify({"message": "Retraining pipeline triggered. The model will hot-reload once complete."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
