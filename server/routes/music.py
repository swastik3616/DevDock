from flask import Blueprint, request, jsonify
import requests

music_bp = Blueprint('music', __name__)

@music_bp.route('/search', methods=['GET'])
def search_song():
    q = request.args.get('q')
    engine = request.args.get('searchEngine', 'wunk')
    if not q:
        return jsonify({"status": 400, "message": "Query required"}), 400
    
    url = f"https://musicapi.x007.workers.dev/search?q={q}&searchEngine={engine}"
    try:
        r = requests.get(url, timeout=15, verify=False)
        if r.status_code != 200:
            print(f"API Error {r.status_code}: {r.text}")
        try:
            data = r.json()
            return jsonify(data)
        except Exception as json_e:
            return jsonify({"status": 500, "message": f"Invalid JSON response: {r.text[:100]}"}), 500
    except Exception as e:
        print(f"Fetch exception: {e}")
        return jsonify({"status": 500, "message": str(e)}), 500

@music_bp.route('/fetch', methods=['GET'])
def fetch_song():
    song_id = request.args.get('id')
    if not song_id:
        return jsonify({"status": 400, "message": "ID required"}), 400
    
    url = f"https://musicapi.x007.workers.dev/fetch?id={song_id}"
    try:
        r = requests.get(url, timeout=15, verify=False)
        try:
            data = r.json()
            return jsonify(data)
        except Exception as json_e:
            return jsonify({"status": 500, "message": f"Invalid JSON response: {r.text[:100]}"}), 500
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

