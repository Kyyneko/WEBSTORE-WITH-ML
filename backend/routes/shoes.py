from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token
from datetime import datetime
import pytz
import json
from models import db, ShoeDetail, ShoeCategory

# Setup Blueprint
shoes_bp = Blueprint('shoes', __name__)


# Fungsi untuk mendapatkan waktu WITA
def get_current_time_wita():
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz)


# Endpoint untuk menambahkan sepatu (diperlukan autentikasi JWT)
@shoes_bp.route('/api/shoes', methods=['POST'])
@jwt_required()
def add_shoe_detail():
    data = request.json
    category = ShoeCategory.query.get(data['category_id'])
    if not category:
        return jsonify({'message': 'Category ID does not exist'}), 400

    new_shoe = ShoeDetail(
        category_id=data['category_id'],
        shoe_name=data['shoe_name'],
        shoe_price=data['shoe_price'],
        sizes_stock=data['sizes_stock'], # Expecting JSON string from admin
        colors=data.get('colors', ''),
        stock=data.get('stock', 0),
        description=data.get('description', ''),
        image_url=data.get('image_url', ''),
        date_added=get_current_time_wita(),
        last_updated=get_current_time_wita()
    )

    db.session.add(new_shoe)
    db.session.commit()

    return jsonify({
        'message': 'Shoe detail added successfully',
        'shoe_detail_id': new_shoe.shoe_detail_id
    }), 201


# Endpoint untuk memperbarui sepatu
@shoes_bp.route('/api/shoes/<int:shoe_detail_id>', methods=['PUT'])
@jwt_required()
def update_shoe_detail(shoe_detail_id):
    data = request.json
    shoe = ShoeDetail.query.get(shoe_detail_id)
    if not shoe:
        return jsonify({'message': 'Shoe detail not found'}), 404

    if 'category_id' in data:
        category = ShoeCategory.query.get(data['category_id'])
        if not category:
            return jsonify({'message': 'Category ID does not exist'}), 400
        shoe.category_id = data['category_id']

    shoe.shoe_name = data.get('shoe_name', shoe.shoe_name)
    shoe.shoe_price = data.get('shoe_price', shoe.shoe_price)
    if 'sizes_stock' in data:
        shoe.sizes_stock = data['sizes_stock']
    if 'colors' in data:
        shoe.colors = data['colors']
    shoe.stock = data.get('stock', shoe.stock)
    shoe.description = data.get('description', shoe.description)
    shoe.image_url = data.get('image_url', shoe.image_url)
    shoe.last_updated = get_current_time_wita()

    db.session.commit()
    return jsonify({'message': 'Shoe detail updated successfully'}), 200


# Endpoint untuk menghapus sepatu
@shoes_bp.route('/api/shoes/<int:shoe_detail_id>', methods=['DELETE'])
@jwt_required()
def delete_shoe_detail(shoe_detail_id):
    shoe = ShoeDetail.query.get(shoe_detail_id)
    if shoe:
        db.session.delete(shoe)
        db.session.commit()
        return jsonify({'message': 'Shoe detail deleted successfully'}), 200
    return jsonify({'message': 'Shoe detail not found'}), 404


# Endpoint untuk melihat detail sepatu
@shoes_bp.route('/api/shoes/<int:shoe_detail_id>', methods=['GET'])
@jwt_required()
def get_shoe_detail(shoe_detail_id):
    shoe = ShoeDetail.query.get(shoe_detail_id)
    if shoe:
        return jsonify({
            'shoe_detail_id': shoe.shoe_detail_id,
            'category_id': shoe.category_id,
            'shoe_name': shoe.shoe_name,
            'shoe_price': shoe.shoe_price,
            'sizes_stock': json.loads(shoe.sizes_stock) if shoe.sizes_stock else {},
            'colors': shoe.colors,
            'stock': shoe.stock,
            'description': shoe.description,
            'image_url': shoe.image_url,
            'date_added': shoe.date_added,
            'last_updated': shoe.last_updated
        }), 200
    return jsonify({'message': 'Shoe detail not found'}), 404


# Endpoint untuk mendapatkan semua sepatu
@shoes_bp.route('/api/shoes', methods=['GET'])
@jwt_required()
def get_all_shoes():
    shoes = ShoeDetail.query.all()
    if shoes:
        result = [{
            'shoe_detail_id': shoe.shoe_detail_id,
            'category_id': shoe.category_id,
            'shoe_name': shoe.shoe_name,
            'shoe_price': shoe.shoe_price,
            'sizes_stock': json.loads(shoe.sizes_stock) if shoe.sizes_stock else {},
            'colors': shoe.colors,
            'stock': shoe.stock,
            'description': shoe.description,
            'image_url': shoe.image_url,
            'date_added': shoe.date_added,
            'last_updated': shoe.last_updated
        } for shoe in shoes]
        return jsonify(result), 200
    return jsonify({'message': 'No Shoe detail found'}), 404
