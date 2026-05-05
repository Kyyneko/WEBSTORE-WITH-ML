from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, ShoeCategory
from datetime import datetime
import pytz

categories_bp = Blueprint('categories', __name__)


def get_current_time_wita():
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz)


@categories_bp.route('/api/categories', methods=['POST'])
@jwt_required()
def add_category():
    data = request.json
    if not data.get('category_name'):
        return jsonify({'message': 'Category name is required'}), 400

    new_category = ShoeCategory(
        category_name=data['category_name'],
        date_added=get_current_time_wita(),
        last_updated=get_current_time_wita()
    )

    db.session.add(new_category)
    db.session.commit()
    return jsonify({'message': 'Category added successfully'}), 201


@categories_bp.route('/api/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    category = ShoeCategory.query.get(category_id)
    if category:
        db.session.delete(category)
        db.session.commit()
        return jsonify({'message': 'Category deleted successfully'}), 200
    return jsonify({'message': 'Category not found'}), 404


@categories_bp.route('/api/categories/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    data = request.json
    category = ShoeCategory.query.get(category_id)
    if category:
        category.category_name = data.get('category_name', category.category_name)
        category.last_updated = get_current_time_wita()
        db.session.commit()
        return jsonify({'message': 'Category updated successfully'}), 200
    return jsonify({'message': 'Category not found'}), 404


@categories_bp.route('/api/categories/<int:category_id>', methods=['GET'])
def get_category(category_id):
    category = ShoeCategory.query.get(category_id)
    if category:
        return jsonify({
            'category_id': category.category_id,
            'category_name': category.category_name,
            'date_added': category.date_added,
            'last_updated': category.last_updated
        }), 200
    return jsonify({'message': 'Category not found'}), 404


@categories_bp.route('/api/categories', methods=['GET'])
def get_categories():
    categories = ShoeCategory.query.all()
    if categories:
        result = [{
            'category_id': category.category_id,
            'category_name': category.category_name,
            'date_added': category.date_added,
            'last_updated': category.last_updated
        } for category in categories]
        return jsonify(result), 200
    return jsonify({'message': 'No categories found'}), 404
