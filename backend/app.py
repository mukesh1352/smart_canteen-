from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import firebase_admin
from firebase_admin import credentials, firestore
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime

app = Flask(__name__)

# Initialize Firebase
cred = credentials.Certificate("/home/mukesh/Documents/smart_canteen-/backend/1.json")  # Ensure correct path
firebase_admin.initialize_app(cred)
db = firestore.client()

# --- TRAINING THE MODEL ---
faq_data = [
    ("What are the opening hours?", "Our canteen is open from 8 AM to 8 PM."),
    ("Do you accept card payments?", "Yes, we accept both cash and card payments."),
    ("Do you have vegetarian options?", "Yes, we have a variety of vegetarian meals."),
    ("Is home delivery available?", "Currently, we do not offer home delivery."),
    ("Do you have any discounts?", "We offer discounts for students and bulk orders."),
    ("Who can I contact for support?", "You can contact our manager at support@canteen.com."),
    ("How can I apply for a job?", "Please send your resume to careers@canteen.com."),
    ("What is the canteen's capacity?", "Our canteen can accommodate up to 100 people at a time."),
    ("How do you manage inventory?", "We use an automated inventory management system to track stock levels."),
    ("What are the hygiene standards?", "We follow strict hygiene protocols to ensure food safety."),
    ("Can I book the canteen for an event?", "Yes, you can book the canteen for private events. Contact us for details."),
    ("How do you handle customer complaints?", "We have a dedicated team to address customer complaints promptly."),
]

greetings_data = [
    ("hello", "Hello! How can I assist you today?"),
    ("hi", "Hi there! How can I help you?"),
    ("hey", "Hey! What can I do for you?"),
    ("good morning", "Good morning! How can I assist you today?"),
    ("good afternoon", "Good afternoon! How can I help you?"),
    ("good evening", "Good evening! What can I do for you?")
]

# Create DataFrame
qa_df = pd.DataFrame(faq_data, columns=['Question', 'Answer'])
qa_df = pd.concat([qa_df, pd.DataFrame(greetings_data, columns=['Question', 'Answer'])])

# Convert text data into TF-IDF vectors
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(qa_df['Question'].str.lower())

# Save model for future use
with open("chatbot_model.pkl", "wb") as f:
    pickle.dump((vectorizer, X, qa_df), f)

# --- CHATBOT RESPONSE LOGIC ---
def chatbot_response(query):
    query = query.lower()

    # Load model
    with open("chatbot_model.pkl", "rb") as f:
        vectorizer, X, qa_df = pickle.load(f)

    # Transform query
    query_vector = vectorizer.transform([query])
    similarities = cosine_similarity(query_vector, X)

    # Get best match
    best_match_index = np.argmax(similarities)
    best_match_score = np.max(similarities)

    if best_match_score < 0.2:
        return "Sorry, I couldn't understand your question. Please try again."

    # Check if the query is about today's menu
    if "today" in query or "food" in query or "menu" in query:
        today_date = datetime.now().strftime('%Y-%m-%d')

        # Fetch today's items from Firestore
        items_ref = db.collection("items")
        docs = items_ref.stream()
        today_items = [doc.to_dict().get('Item', 'Unknown') for doc in docs]

        if today_items:
            return f"Here are the items available today: {', '.join(today_items)}."
        else:
            return "Sorry, no items available for today."

    return qa_df.iloc[best_match_index]['Answer']

@app.route('/chat', methods=['GET'])
def chat():
    query = request.args.get('query', '')
    if query:
        response = chatbot_response(query)
        return jsonify({'response': response})
    return jsonify({'response': "Please provide a query."})

if __name__ == "__main__":
    app.run(debug=True)
