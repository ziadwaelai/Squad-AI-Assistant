import os
import openai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from modesTempalets import dms,mentions 
# Load environment variables from .env file
load_dotenv()

# --- Flask App Initialization ---
app = Flask(__name__)
# Allow requests from your Chrome extension's origin
CORS(app, resources={r"/process": {"origins": "*"}})

# --- AI Model Configuration ---
try:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in .env file.")

    model = openai.OpenAI(api_key=api_key)
    print("🤖 GPT-4 AI model configured successfully.")

except Exception as e:
    print(f"❌ Error configuring AI model: {e}")
    model = None


# --- API Endpoint Definition ---
@app.route('/process', methods=['POST'])
def process_text():
    """
    Receives text from the frontend, processes it with Gemini,
    and returns the result.
    """
    if not model:
        return jsonify({"error": "AI model is not available."}), 500

    # Get the text from the JSON request body
    data = request.get_json()
    print(f"📥 Received request data: {data}")
    if not data or 'text' not in data:
        return jsonify({"error": "Invalid request: 'text' field is required."}), 400
    selected_text = data['text']
    mode = "mentions"
    if 'mode' in data:
        mode = data['mode']
    print(f"📝 Received text for processing: '{selected_text[:50]}...'")
    try:
        prompt = dms.dm_tamplate(selected_text) if mode == "dms" else mentions.mentions_template(selected_text)
        # Generate content with OpenAI GPT-4
        response = model.chat.completions.create(
            model="gpt-4.1-nano-2025-04-14", 
            messages=[
                {"role": "system", "content": "You are a social media assistant for Ninja, a Saudi delivery app. Respond in Saudi Arabic, with an extremely concise, youthful, friendly style. Use blue heart emojis (🩵) and other appropriate emojis. Keep responses under 50 characters. Focus on quick, informal replies that match Saudi youth slang and culture."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=100
        )
        
        processed_text = response.choices[0].message.content
        print(f"✅ AI response generated successfully.")
        print(f"Processed text: '{processed_text[:50]}...'")
        
        # Return the processed text in a JSON response
        return jsonify({"processed_text": processed_text})

    except Exception as e:
        print(f"❌ Error during AI generation: {e}")
        return jsonify({"error": f"An error occurred during AI processing: {e}"}), 500

# --- Run the Flask App ---
if __name__ == '__main__':
    # Runs the server on http://127.0.0.1:5000
    app.run(debug=True)