from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS  # Import CORS
import requests
import config

app = Flask(__name__)
CORS(app)  # Enable CORS

# Fetch the API key from the config file
OPENAI_API_KEY = config.OPENAI_API_KEY

# Route to serve the main page
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Route to serve the JavaScript file
@app.route('/script.js')
def script():
    return send_from_directory('.', 'script.js')

# API route to handle OpenAI queries
@app.route('/api/query', methods=['POST'])
def query_openai():
    data = request.json
    document_context = data.get('documentContext')
    question = data.get('question')

    if not OPENAI_API_KEY:
        return jsonify({'error': 'API key is missing'}), 400

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {OPENAI_API_KEY}'
    }

    payload = {
        'model': 'gpt-4o',
        'messages': [
            {'role': 'system', 'content': 'You are a helpful assistant.'},
            {'role': 'user', 'content': f'Here is some reference information:\n\n{document_context}\n\nNow, based on this information, answer the following question:\n\n{question}'}
        ],
        'max_tokens': 300
    }

    try:
        response = requests.post('https://api.openai.com/v1/chat/completions', headers=headers, json=payload)
        response.raise_for_status()  # Raise an exception for HTTP errors
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
