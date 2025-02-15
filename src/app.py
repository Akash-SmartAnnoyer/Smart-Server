from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from datetime import datetime, timedelta
import os
from functools import wraps

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')

# Mock credentials with different orgIds (replace with database in production)
users = {
    'royalspice@smartserver.com': {'password': 'R0y@!$p!ce', 'orgId': 3, 'role': 'captain'},
    'ammammagarillu': {'password': 'ammammagarillu', 'orgId': 2, 'role': 'admin'},
    'biryanis': {'password': 'biryanis', 'orgId': 1, 'role': 'admin'},
    'johndoe@example.com': {'password': 'J0hn!D0e#2024', 'orgId': 4, 'role': 'admin'},
    'janedoe@example.com': {'password': 'J@neD03!24', 'orgId': 5, 'role': 'admin'},
    'spicychicken@restaurant.com': {'password': 'Sp!cyCh!ck3n', 'orgId': 6, 'role': 'captain'},
    'foodlover@mail.com': {'password': 'F00dL0v3r#2024', 'orgId': 7, 'role': 'captain'},
    'tastytreats@delights.com': {'password': 'T@styTreaT$', 'orgId': 8, 'role': 'admin'},
    'deliciousbites@foodies.com': {'password': 'D3l!c10usB!t3s', 'orgId': 9, 'role': 'captain'},
    'spicybiryani@spicydishes.com': {'password': 'Sp!cYB!rY@N!', 'orgId': 10, 'role': 'admin'}
}

# Token verification decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        except Exception as e:
            return jsonify({'message': f'Token is invalid: {str(e)}'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    auth = request.json
    if not auth or not auth.get('username') or not auth.get('password'):
        return jsonify({'message': 'Could not verify'}), 401
    
    user = users.get(auth['username'])
    
    if user and auth['password'] == user['password']:
        token = jwt.encode({
            'username': auth['username'],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        return jsonify({'token': token, 'orgId': user['orgId'], 'role': user['role']})  # Return role along with token
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/admin/protected', methods=['GET'])
@token_required
def protected():
    # Use the decoded token data to get the orgId
    orgId = jwt.decode(request.headers.get('Authorization'), app.config['SECRET_KEY'], algorithms=["HS256"])['orgId']
    return jsonify({'message': 'This is a protected route for orgId: {}'.format(orgId)})

if __name__ == '__main__':
    app.run(debug=True)