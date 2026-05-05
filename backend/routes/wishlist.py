# wishlist.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Wishlist, User, ShoeDetail, UserInteraction, InteractionType
from datetime import datetime
import pytz

wishlist_bp = Blueprint('wishlist', __name__)

def get_current_time_wita():
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz)

@wishlist_bp.route('/api/wishlist/<int:user_id>', methods=['GET'])
@jwt_required()
def get_wishlist(user_id):
    current_user = get_jwt_identity()
    if str(current_user) != str(user_id):
        return jsonify({'message': 'Unauthorized'}), 403
    wishlist_items = Wishlist.query.filter_by(id_user=user_id).all()
    if wishlist_items:
        result = []
        for item in wishlist_items:
            shoe = ShoeDetail.query.get(item.shoe_detail_id)
            result.append({
                'id_wishlist': item.id_wishlist,
                'shoe_detail_id': item.shoe_detail_id,
                'id_user': item.id_user,
                'shoe_name': shoe.shoe_name if shoe else 'Unknown',
                'shoe_price': shoe.shoe_price if shoe else 0,
                'date_added': item.date_added
            })
        return jsonify(result), 200
    return jsonify({'message': 'Wishlist is empty'}), 404

@wishlist_bp.route('/api/wishlist', methods=['POST'])
@jwt_required()
def add_to_wishlist():
    data = request.json
    user = User.query.get(data['id_user'])
    if not user:
        return jsonify({'message': 'User not found'}), 404
    shoe = ShoeDetail.query.get(data['shoe_detail_id'])
    if not shoe:
        return jsonify({'message': 'Shoe not found'}), 404
    existing = Wishlist.query.filter_by(id_user=data['id_user'], shoe_detail_id=data['shoe_detail_id']).first()
    if existing:
        return jsonify({'message': 'Already in wishlist'}), 400
    new_item = Wishlist(shoe_detail_id=data['shoe_detail_id'], id_user=data['id_user'], date_added=get_current_time_wita())
    new_interaction = UserInteraction(id_user=data['id_user'], shoe_detail_id=data['shoe_detail_id'], interaction_type=InteractionType.wishlist, interaction_date=get_current_time_wita())
    db.session.add(new_item)
    db.session.add(new_interaction)
    db.session.commit()
    return jsonify({'message': 'Item added to wishlist successfully'}), 201

@wishlist_bp.route('/api/wishlist/<int:id_wishlist>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist(id_wishlist):
    item = Wishlist.query.get(id_wishlist)
    if item:
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Item removed from wishlist successfully'}), 200
    return jsonify({'message': 'Item not found'}), 404

@wishlist_bp.route('/api/wishlist/<int:id_wishlist>', methods=['PUT'])
@jwt_required()
def update_wishlist(id_wishlist):
    data = request.json
    item = Wishlist.query.get(id_wishlist)
    if item:
        item.shoe_detail_id = data.get('shoe_detail_id', item.shoe_detail_id)
        item.id_user = data.get('id_user', item.id_user)
        db.session.commit()
        return jsonify({'message': 'Wishlist updated successfully'}), 200
    return jsonify({'message': 'Item not found'}), 404

@wishlist_bp.route('/api/wishlist/item/<int:id_wishlist>', methods=['GET'])
@jwt_required()
def get_wishlist_item(id_wishlist):
    item = Wishlist.query.get(id_wishlist)
    if item:
        return jsonify({'id_wishlist': item.id_wishlist, 'shoe_detail_id': item.shoe_detail_id, 'id_user': item.id_user, 'date_added': item.date_added}), 200
    return jsonify({'message': 'Item not found'}), 404

@wishlist_bp.route('/api/wishlist', methods=['GET'])
@jwt_required()
def get_all_wishlist_items():
    items = Wishlist.query.all()
    result = [{'id_wishlist': i.id_wishlist, 'shoe_detail_id': i.shoe_detail_id, 'id_user': i.id_user, 'date_added': i.date_added.isoformat() if i.date_added else None} for i in items]
    return jsonify(result), 200
