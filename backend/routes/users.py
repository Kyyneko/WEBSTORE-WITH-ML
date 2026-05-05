from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
from datetime import datetime
import pytz

users_bp = Blueprint('users', __name__)

def get_current_time_wita():
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz)

@users_bp.route('/api/users/register', methods=['POST'])
def register():
    data = request.json
    if not data.get('username') or not data.get('password') or not data.get('email'):
        return jsonify({'message': 'Username, password, and email are required'}), 400
    existing_user = User.query.filter_by(username=data['username']).first()
    if existing_user:
        return jsonify({'message': 'Username already exists'}), 409
    existing_email = User.query.filter_by(email=data['email']).first()
    if existing_email:
        return jsonify({'message': 'Email already exists'}), 409
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    new_user = User(username=data['username'], password=hashed_password, email=data['email'], first_name=data.get('first_name', ''), last_name=data.get('last_name', ''), role=data.get('role', 'User'))
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@users_bp.route('/api/users/login', methods=['POST'])
def login():
    data = request.json
    if not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Username and password are required'}), 400
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=str(user.user_id))
        return jsonify({'message': 'Login successful', 'access_token': access_token, 'username': user.username, 'role': user.role, 'user_id': user.user_id}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@users_bp.route('/api/users/profile/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_profile(user_id):
    current_user_id = get_jwt_identity()
    if str(current_user_id) != str(user_id):
        return jsonify({'message': 'Permission denied'}), 403
    data = request.json
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    new_username = data.get('username', user.username)
    existing_user = User.query.filter(User.username == new_username, User.user_id != user_id).first()
    if existing_user:
        return jsonify({'message': 'Username already exists'}), 409
    user.username = new_username
    user.email = data.get('email', user.email)
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.address = data.get('address', user.address)
    user.phone = data.get('phone', user.phone)
    user.last_updated = get_current_time_wita()
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'}), 200

@users_bp.route('/api/users/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200

@users_bp.route('/api/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify({'user_id': user.user_id, 'username': user.username, 'email': user.email, 'first_name': user.first_name, 'last_name': user.last_name, 'address': user.address, 'phone': user.phone, 'role': user.role, 'date_added': user.date_added, 'last_updated': user.last_updated}), 200
    return jsonify({'message': 'User not found'}), 404

@users_bp.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    if users:
        result = [{'user_id': u.user_id, 'username': u.username, 'email': u.email, 'first_name': u.first_name, 'last_name': u.last_name, 'address': u.address, 'phone': u.phone, 'role': u.role, 'date_added': u.date_added, 'last_updated': u.last_updated} for u in users]
        return jsonify(result), 200
    return jsonify({'message': 'No users found'}), 404

@users_bp.route('/api/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    return jsonify({'message': 'User not found'}), 404
