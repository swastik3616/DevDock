from flask import Blueprint, request, jsonify, current_app
from routes.auth import token_required
import uuid
import datetime

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('', methods=['GET'])
@token_required
def get_notes(current_user):
    notes_col = current_app.mongo.db.notes
    notes = list(notes_col.find({'user': current_user}, {'_id': 0}))
    return jsonify(notes)

@notes_bp.route('', methods=['POST'])
@token_required
def create_note(current_user):
    data = request.get_json()
    new_note = {
        'id': str(uuid.uuid4()),
        'user': current_user,
        'title': data.get('title', 'Untitled'),
        'content': data.get('content', ''),
        'date': datetime.datetime.now().strftime("%b %d, %Y")
    }
    
    notes_col = current_app.mongo.db.notes
    notes_col.insert_one(new_note)
    
    # Remove user from dict before returning
    res = new_note.copy()
    res.pop('user')
    res.pop('_id', None)
    return jsonify(res), 201

@notes_bp.route('/<note_id>', methods=['PUT', 'DELETE'])
@token_required
def handle_note(current_user, note_id):
    notes_col = current_app.mongo.db.notes
    
    if request.method == 'DELETE':
        res = notes_col.delete_one({'user': current_user, 'id': note_id})
        if res.deleted_count:
            return jsonify({'message': 'Note deleted'})
        return jsonify({'message': 'Note not found'}), 404
        
    if request.method == 'PUT':
        data = request.get_json()
        update_data = {}
        if 'title' in data: update_data['title'] = data['title']
        if 'content' in data: update_data['content'] = data['content']
        
        res = notes_col.update_one(
            {'user': current_user, 'id': note_id},
            {'$set': update_data}
        )
        
        if res.matched_count:
            note = notes_col.find_one({'user': current_user, 'id': note_id}, {'_id': 0, 'user': 0})
            return jsonify(note)
        return jsonify({'message': 'Note not found'}), 404
