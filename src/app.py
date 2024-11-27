from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import jwt
import os
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class Restaurant(db.Model):
    __tablename__ = 'restaurants'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    logo = db.Column(db.String(255))
    org_id = db.Column(db.Integer, unique=True, nullable=False)
    people_count = db.Column(db.Integer, default=0)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    org_id = db.Column(db.Integer, nullable=False)

# Add more models as needed...

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

# Routes
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    auth = request.json
    if not auth or not auth.get('username') or not auth.get('password'):
        return jsonify({'message': 'Could not verify'}), 401
    
    user = User.query.filter_by(username=auth['username']).first()
    
    if user and auth['password'] == user.password:  # In production, use proper password hashing
        token = jwt.encode({
            'username': auth['username'],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        return jsonify({'token': token, 'orgId': user.org_id})
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    try:
        restaurants = Restaurant.query.all()
        return jsonify([{
            'id': r.id,
            'name': r.name,
            'logo': r.logo,
            'orgId': r.org_id,
            'peopleCount': r.people_count
        } for r in restaurants])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Initialize database tables
with app.app_context():
    db.create_all()
    
    # Add initial users if they don't exist
    if not User.query.first():
        initial_users = [
            User(username='royalspice@smartserver.com', password='R0y@!$p!ce', org_id=3),
            User(username='ammammagarillu', password='ammammagarillu', org_id=2),
            User(username='biryanis', password='biryanis', org_id=1)
        ]
        for user in initial_users:
            db.session.add(user)
        
        # Add initial restaurants
        initial_restaurants = [
            Restaurant(name='Royal Spice', logo='/assets/royal-spice.jpg', org_id=3, people_count=0),
            Restaurant(name='Ammamma Gari Illu', logo='/assets/ammamma-gari-illu.jpg', org_id=2, people_count=0),
            Restaurant(name='Biryanis and More', logo='/assets/biryanis-and-more.jpg', org_id=1, people_count=0)
        ]
        for restaurant in initial_restaurants:
            db.session.add(restaurant)
            
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True)