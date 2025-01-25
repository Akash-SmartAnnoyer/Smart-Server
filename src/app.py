from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from datetime import datetime, timedelta
import os
from functools import wraps
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)  # This enables CORS for all routes
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')

# Load environment variables based on FLASK_ENV
if os.environ.get('FLASK_ENV') == 'production':
    load_dotenv('.env.production')
else:
    load_dotenv('.env.development')

# Get environment type
ENVIRONMENT = os.environ.get('FLASK_ENV', 'development')

# Define credentials based on environment
if ENVIRONMENT == 'production':
    users = {
        'royalspice@smartserver.com': {'password': os.environ.get('ROYAL_SPICE_PASS'), 'orgId': 3},
        'ammammagarillu': {'password': os.environ.get('AMMA_PASS'), 'orgId': 2},
        'biryanis': {'password': os.environ.get('BIRYANI_PASS'), 'orgId': 1},
        'johndoe@example.com': {'password': os.environ.get('JOHN_PASS'), 'orgId': 4},
        'janedoe@example.com': {'password': os.environ.get('JANE_PASS'), 'orgId': 5},
        'spicychicken@restaurant.com': {'password': os.environ.get('SPICY_CHICKEN_PASS'), 'orgId': 6},
        'foodlover@mail.com': {'password': os.environ.get('FOOD_LOVER_PASS'), 'orgId': 7},
        'tastytreats@delights.com': {'password': os.environ.get('TASTY_TREATS_PASS'), 'orgId': 8},
        'deliciousbites@foodies.com': {'password': os.environ.get('DELICIOUS_BITES_PASS'), 'orgId': 9},
        'spicybiryani@spicydishes.com': {'password': os.environ.get('SPICY_BIRYANI_PASS'), 'orgId': 10}
    }
else:  # development/testing environment
    users = {
        'royalspice@smartserver.com': {'password': os.environ.get('DEV_ROYAL_SPICE_PASS', 'dev_password1'), 'orgId': 3},
        'ammammagarillu': {'password': os.environ.get('DEV_AMMA_PASS', 'dev_password2'), 'orgId': 2},
        'biryanis': {'password': os.environ.get('DEV_BIRYANI_PASS', 'dev_password3'), 'orgId': 1},
        'johndoe@example.com': {'password': os.environ.get('DEV_JOHN_PASS', 'dev_password4'), 'orgId': 4},
        'janedoe@example.com': {'password': os.environ.get('DEV_JANE_PASS', 'dev_password5'), 'orgId': 5},
        'spicychicken@restaurant.com': {'password': os.environ.get('DEV_SPICY_CHICKEN_PASS', 'dev_password6'), 'orgId': 6},
        'foodlover@mail.com': {'password': os.environ.get('DEV_FOOD_LOVER_PASS', 'dev_password7'), 'orgId': 7},
        'tastytreats@delights.com': {'password': os.environ.get('DEV_TASTY_TREATS_PASS', 'dev_password8'), 'orgId': 8},
        'deliciousbites@foodies.com': {'password': os.environ.get('DEV_DELICIOUS_BITES_PASS', 'dev_password9'), 'orgId': 9},
        'spicybiryani@spicydishes.com': {'password': os.environ.get('DEV_SPICY_BIRYANI_PASS', 'dev_password10'), 'orgId': 10}
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
