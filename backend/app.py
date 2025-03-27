from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime

app = Flask(__name__)

# Load the dataset (update path if needed)
df = pd.read_csv('canteen_shop_data.csv')

# Preprocess the Date and Time columns (if applicable)
df['Date'] = pd.to_datetime(df['Date'])
df['Customer Satisfaction'] = df['Customer Satisfaction'].fillna(df['Customer Satisfaction'].mean())

# --- TRAINING THE MODEL ---

# Add generalized questions and responses
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
    ("How do you handle customer complaints?", "We have a dedicated team to address customer complaints promptly.")
]

# Add basic greetings and responses
greetings_data = [
    ("hello", "Hello! How can I assist you today?"),
    ("hi", "Hi there! How can I help you?"),
    ("hey", "Hey! What can I do for you?"),
    ("good morning", "Good morning! How can I assist you today?"),
    ("good afternoon", "Good afternoon! How can I help you?"),
    ("good evening", "Good evening! What can I do for you?")
]

# Merge FAQs with menu-based responses
df['Response'] = df.apply(lambda row: f"We have {row['Item']} available at {row['Price']}.", axis=1)
qa_df = pd.concat([df[['Item', 'Response']].rename(columns={'Item': 'Question', 'Response': 'Answer'}), pd.DataFrame(faq_data, columns=['Question', 'Answer'])])

# Add greetings to the QA dataframe
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

    # Adjust the threshold to provide better responses
    if best_match_score < 0.2:
        return "Sorry, I couldn't understand your question. Please try again."

    # Check if the query is about today's menu
    if "today" in query or "food" in query or "menu" in query:
        # Filter for today's menu items
        today_date = datetime.now().strftime('%Y-%m-%d')
        today_items = df[df['Date'].dt.strftime('%Y-%m-%d') == today_date]['Item'].tolist()

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