import json
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import os

def train_model():
    print("Loading dataset...")
    with open("dataset.json", "r") as f:
        data = json.load(f)

    texts = [item["text"] for item in data]
    labels = [item["label"] for item in data]

    print("Training vectorizer...")
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(texts)

    print("Training model...")
    model = LogisticRegression()
    model.fit(X, labels)

    print("Saving artifacts...")
    pickle.dump(model, open("model.pkl", "wb"))
    pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))
    print("Training complete!")

if __name__ == "__main__":
    train_model()
