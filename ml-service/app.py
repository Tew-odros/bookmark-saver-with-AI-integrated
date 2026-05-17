from flask import Flask, request, jsonify
import pickle
import os

app = Flask(__name__)

# Load models at startup
try:
    model = pickle.load(open("model.pkl", "rb"))
    vectorizer = pickle.load(open("vectorizer.pkl", "rb"))
except FileNotFoundError:
    print("Models not found. Ensure train.py has been run.")
    model = None
    vectorizer = None

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
        prediction = model.predict(X)[0]
        return jsonify({"intent": prediction})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
