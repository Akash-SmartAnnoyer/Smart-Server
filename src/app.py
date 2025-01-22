from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import jwt
from datetime import datetime, timedelta
import os
from functools import wraps

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')

# Mock credentials with different orgIds (replace with database in production)
users = {
    'royalspice@smartserver.com': {'password': 'R0y@!$p!ce', 'orgId': 3},
    'ammammagarillu': {'password': 'ammammagarillu', 'orgId': 2},
    'biryanis': {'password': 'biryanis', 'orgId': 1},
    'johndoe@example.com': {'password': 'J0hn!D0e#2024', 'orgId': 4},
    'janedoe@example.com': {'password': 'J@neD03!24', 'orgId': 5},
    'spicychicken@restaurant.com': {'password': 'Sp!cyCh!ck3n', 'orgId': 6},
    'foodlover@mail.com': {'password': 'F00dL0v3r#2024', 'orgId': 7},
    'tastytreats@delights.com': {'password': 'T@styTreaT$', 'orgId': 8},
    'deliciousbites@foodies.com': {'password': 'D3l!c10usB!t3s', 'orgId': 9},
    'spicybiryani@spicydishes.com': {'password': 'Sp!cYB!rY@N!', 'orgId': 10}
}

# Keep track of connected clients
connected_clients = set()

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
        return jsonify({'token': token, 'orgId': user['orgId']})  # Return orgId along with token
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/admin/protected', methods=['GET'])
@token_required
def protected():
    # Use the decoded token data to get the orgId
    orgId = jwt.decode(request.headers.get('Authorization'), app.config['SECRET_KEY'], algorithms=["HS256"])['orgId']
    return jsonify({'message': 'This is a protected route for orgId: {}'.format(orgId)})

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    print('Client connected')
    connected_clients.add(request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    connected_clients.remove(request.sid)

@socketio.on('newOrder')
def handle_new_order(data):
    print('New order received:', data)
    # Broadcast the new order to all connected clients
    emit('newOrder', data, broadcast=True)

@socketio.on('statusUpdate')
def handle_status_update(data):
    print('Status update received:', data)
    # Broadcast the status update to all connected clients
    emit('statusUpdate', data, broadcast=True)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    socketio.run(app, host='0.0.0.0', port=port)