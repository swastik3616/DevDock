from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import os

auth_bp = Blueprint('auth', __name__)
SECRET_KEY = os.environ.get('JWT_SECRET', 'aqua-secret-key')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token.split(" ")[1], SECRET_KEY, algorithms=["HS256"])
            current_user = data['user']
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    users_col = current_app.mongo.db.users
    if users_col.find_one({'username': username}):
        return jsonify({'message': 'User already exists!'}), 400
        
    hashed_password = generate_password_hash(password)
    users_col.insert_one({'username': username, 'password': hashed_password})
    return jsonify({'message': 'User registered successfully!'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    users_col = current_app.mongo.db.users
    user = users_col.find_one({'username': username})
    
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid credentials!'}), 401
        
    token = jwt.encode({
        'user': username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, SECRET_KEY)
    
    return jsonify({'token': token})

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me(current_user):
    return jsonify({'username': current_user})
