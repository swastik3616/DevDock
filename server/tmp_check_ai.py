import requests, json, os
url = 'http://localhost:5000/api/ai/chat'
payload = {'messages': [{'role': 'user', 'content': 'hello'}]}
try:
    resp = requests.post(url, json=payload, timeout=5)
    print('Status:', resp.status_code)
    print('Response:', resp.text)
except Exception as e:
    print('Error contacting backend:', e)
