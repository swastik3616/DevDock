from flask import Flask, jsonify
from flask_cors import CORS
try:
    from flask_pymongo import PyMongo
except ImportError:
    PyMongo = None
import os
from dotenv import load_dotenv

load_dotenv()

def create_app(test_config=None):
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('JWT_SECRET', 'aqua-secret-key')
    app.config['MONGO_URI'] = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/aquadesk')

    if test_config:
        app.config.update(test_config)

    # Initialise either the real PyMongo or a simple in‑memory mock when the package is missing
    if PyMongo:
        mongo = PyMongo(app)
    else:
        # Minimal mock mimicking the attribute access used in the routes
        class _MockCollection(dict):
            def find(self, *args, **kwargs):
                return []
            def find_one(self, *args, **kwargs):
                return None
            def insert_one(self, *args, **kwargs):
                pass
            def insert_many(self, *args, **kwargs):
                pass
            def delete_one(self, *args, **kwargs):
                class Result:
                    deleted_count = 0
                return Result()
            def update_one(self, *args, **kwargs):
                class Result:
                    modified_count = 0
                    matched_count = 0
                return Result()
        class _MockMongo:
            def __init__(self):
                self.db = {
                    'users': _MockCollection(),
                    'files': _MockCollection(),
                    'notes': _MockCollection(),
                    'ai': _MockCollection(),
                    'music': _MockCollection(),
                }
        mongo = _MockMongo()
    app.mongo = mongo  # Expose to blueprints

    CORS(app)

    # Register Blueprints (imported here to avoid circular import issues)
    from routes.auth import auth_bp
    from routes.notes import notes_bp
    from routes.files import files_bp
    from routes.ai import ai_bp
    from routes.music import music_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(notes_bp, url_prefix='/notes')
    app.register_blueprint(files_bp, url_prefix='/files')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(music_bp, url_prefix='/api/music')

    # Seed Guest User (skip during testing to keep tests isolated)
    if not test_config:
        from werkzeug.security import generate_password_hash
        with app.app_context():
            try:
                users = mongo.db.users
                if not users.find_one({'username': 'guest'}):
                    users.insert_one({
                        'username': 'guest',
                        'password': generate_password_hash('guest')
                    })
                    print("Guest user created successfully.")
            except Exception as e:
                print(f"Error seeding guest user: {e}")

    @app.route('/')
    def index():
        return jsonify({
            "status": "AquaDesk Backend Running",
            "version": "1.0.0",
            "endpoints": ["/auth/register", "/auth/login", "/notes", "/files"]
        })

    return app


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app = create_app()
    app.run(host='0.0.0.0', port=port, debug=True)
