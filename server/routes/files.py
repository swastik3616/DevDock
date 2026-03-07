from flask import Blueprint, request, jsonify, current_app
from routes.auth import token_required
import os
import uuid

files_bp = Blueprint('files', __name__)

@files_bp.route('', methods=['GET'])
@token_required
def get_files(current_user):
    files_col = current_app.mongo.db.files
    files = list(files_col.find({'user': current_user}, {'_id': 0}))
    
    if not files:
        # Initial default files for new user
        files = [
            {'id': '1', 'name': 'Documents', 'type': 'folder', 'size': '--', 'user': current_user},
            {'id': '2', 'name': 'README.txt', 'type': 'file', 'size': '1.2 KB', 'user': current_user},
            {'id': '3', 'name': 'System Info', 'type': 'file', 'size': '456 B', 'user': current_user}
        ]
        files_col.insert_many([f.copy() for f in files]) # Insert copies to keep original 'user' for return
        
    return jsonify(files)

@files_bp.route('', methods=['POST'])
@token_required
def upload_file(current_user):
    data = request.get_json()
    new_file = {
        'id': str(uuid.uuid4()),
        'user': current_user,
        'name': data.get('name', 'new_file'),
        'type': data.get('type', 'file'),
        'size': data.get('size', '0 B')
    }
    
    files_col = current_app.mongo.db.files
    files_col.insert_one(new_file)
    
    res = new_file.copy()
    res.pop('user')
    res.pop('_id', None)
    return jsonify(res), 201

@files_bp.route('/<file_id>', methods=['DELETE'])
@token_required
def delete_file(current_user, file_id):
    files_col = current_app.mongo.db.files
    res = files_col.delete_one({'user': current_user, 'id': file_id})
    if res.deleted_count:
        return jsonify({'message': 'File deleted'})
    return jsonify({'message': 'File not found'}), 404

@files_bp.route('/<file_id>', methods=['PATCH'])
@token_required
def rename_file(current_user, file_id):
    data = request.get_json()
    new_name = data.get('name')
    if not new_name:
        return jsonify({'message': 'Name is required'}), 400
        
    files_col = current_app.mongo.db.files
    res = files_col.update_one(
        {'user': current_user, 'id': file_id},
        {'$set': {'name': new_name}}
    )
    
    if res.modified_count:
        return jsonify({'message': 'File renamed'})
    return jsonify({'message': 'File not found or no change made'}), 404
