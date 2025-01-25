from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from datetime import datetime, timedelta
import os
from functools import wraps

app = Flask(__name__)
CORS(app)  # This enables CORS for all routes
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')

# Mock credentials with different orgIds (replace with database in production)
users = {
    'smartannoyers@smartserver.com': {'password': 'smartannoyers@2025', 'orgId': 3},
    'siri@smartserver.com': {'password': 'siri@2025', 'orgId': 7},
    'hotelmuntaz@smartserver.com': {'password': 'HotelMuntaz@2025', 'orgId': 4},
    'ammammagarillu': {'password': 'ammammagarillu', 'orgId': 2},
    'biryanis': {'password': 'biryanis', 'orgId': 1},
    'janedoe@example.com': {'password': 'J@neD03!24', 'orgId': 5},
    'spicychicken@restaurant.com': {'password': 'Sp!cyCh!ck3n', 'orgId': 6},
    'tastytreats@delights.com': {'password': 'T@styTreaT$', 'orgId': 8},
    'deliciousbites@foodies.com': {'password': 'D3l!c10usB!t3s', 'orgId': 9},
    'spicybiryani@spicydishes.com': {'password': 'Sp!cYB!rY@N!', 'orgId': 10}
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
            request.orgId = data['orgId']  # Pass the orgId along with the request
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
            'exp': datetime.utcnow() + timedelta(hours=24),
            'orgId': user['orgId']  # Include orgId in the token
        }, app.config['SECRET_KEY'])
        return jsonify({'token': token, 'orgId': user['orgId']})  # Return orgId along with token
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/admin/protected', methods=['GET'])
@token_required
def protected():
    return jsonify({'message': 'This is a protected route for orgId: {}'.format(request.orgId)})

if __name__ == '__main__':
    app.run(debug=True)
