import json
import pickle
import os
import glob
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import accuracy_score, confusion_matrix

def train_model():
    print("Loading dataset...")
    with open("dataset.json", "r") as f:
        data = json.load(f)

    texts = [item["text"] for item in data]
    labels = [item["label"] for item in data]

    # 1. Train/Test Splitting
    print("Splitting data into 80% training and 20% testing...")
    X_text_train, X_text_test, y_train, y_test = train_test_split(texts, labels, test_size=0.2, random_state=42)

    print("Training vectorizer...")
    # ADVANCED: Remove common stop words (the, is, in) and analyze phrases (bigrams) instead of just single words.
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    X_train = vectorizer.fit_transform(X_text_train)
    X_test = vectorizer.transform(X_text_test)

    print("Training new model with GridSearchCV...")
    # ADVANCED: Use GridSearchCV to test multiple configurations and find the absolute perfect settings.
    param_grid = {
        'C': [0.1, 1.0, 10.0],
        'max_iter': [1000, 2000]
    }
    base_model = LogisticRegression(class_weight='balanced')
    grid_search = GridSearchCV(base_model, param_grid, cv=3, n_jobs=-1, verbose=1)
    grid_search.fit(X_train, y_train)
    
    new_model = grid_search.best_estimator_
    print(f"Best Parameters Found: {grid_search.best_params_}")

    # Evaluation
    print("Evaluating new model...")
    y_pred = new_model.predict(X_test)
    new_accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n--- New Model Evaluation ---")
    print(f"Accuracy Score: {new_accuracy * 100:.2f}%")
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("----------------------------\n")

    # 2. Model Versioning & Validation
    replace_production = True
    
    if os.path.exists("model.pkl") and os.path.exists("vectorizer.pkl"):
        print("Existing production model found. Evaluating old model...")
        try:
            old_model = pickle.load(open("model.pkl", "rb"))
            old_vectorizer = pickle.load(open("vectorizer.pkl", "rb"))
            
            # Evaluate old model on the same test set
            X_test_old = old_vectorizer.transform(X_text_test)
            old_pred = old_model.predict(X_test_old)
            old_accuracy = accuracy_score(y_test, old_pred)
            
            print(f"Old Model Accuracy: {old_accuracy * 100:.2f}%")
            
            if new_accuracy > old_accuracy:
                print("New model is better! Replacing production model.")
            else:
                print("New model is NOT better than the existing model. Keeping the old model.")
                replace_production = False
        except Exception as e:
            print(f"Error loading old model: {e}. Replacing it anyway.")

    # Determine next version number
    existing_versions = glob.glob("model_v*.pkl")
    version_num = len(existing_versions) + 1
    
    versioned_model_name = f"model_v{version_num}.pkl"
    versioned_vec_name = f"vectorizer_v{version_num}.pkl"
    
    print(f"Saving new model as {versioned_model_name} for version history...")
    pickle.dump(new_model, open(versioned_model_name, "wb"))
    pickle.dump(vectorizer, open(versioned_vec_name, "wb"))

    if replace_production:
        print("Updating production model.pkl and vectorizer.pkl...")
        pickle.dump(new_model, open("model.pkl", "wb"))
        pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))
        
    print("\nTraining process complete!")

if __name__ == "__main__":
    train_model()
