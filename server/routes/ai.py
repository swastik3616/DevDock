import os
import requests
from flask import Blueprint, request, jsonify
from routes.auth import token_required
import logging

ai_bp = Blueprint('ai', __name__)
logger = logging.getLogger(__name__)

@ai_bp.route('/chat', methods=['POST'])
@token_required
def chat(current_user): # token_required passes current_user
    data = request.json
    messages = data.get('messages', [])
    
    # We will mock the AI response for now unless GROQ_API_KEY is present
    api_key = os.environ.get('GROQ_API_KEY')
    
    if not api_key:
        # Mock response parsing
        prompt = messages[-1]['content'] if messages else ""
        if "hello" in prompt.lower() or "hi" in prompt.lower():
            reply = "Hello! I am Jarvis. Since no Groq API key is configured, I am operating in offline simulation mode. How can I assist you with your code today?"
        elif "code" in prompt.lower():
            reply = "```python\ndef hello_world():\n    print('Hello World!')\n```\nHere is a simple simulation response containing code."
        else:
            reply = f"System Offline: I received your message '{prompt}'. Please add your `GROQ_API_KEY` to the environment to enable full language capabilities."
        return jsonify({"reply": reply}), 200

    try:
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'llama3-8b-8192',
                'messages': messages
            }
        )
        response.raise_for_status()
        result = response.json()
        reply = result['choices'][0]['message']['content']
        return jsonify({"reply": reply}), 200
    except Exception as e:
        logger.error(f"Error calling Groq API: {e}")
        return jsonify({"message": "Failed to communicate with AI provider."}), 500
