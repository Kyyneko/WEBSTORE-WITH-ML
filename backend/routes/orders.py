from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, User, ShoeDetail, UserInteraction, InteractionType
from datetime import datetime
import pytz
import json

orders_bp = Blueprint('orders', __name__)

def get_current_time_wita():
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz)

@orders_bp.route('/api/orders', methods=['POST'])
@jwt_required()
def create_order():
    data = request.json
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not authenticated or does not exist'}), 400
    shoe_detail = ShoeDetail.query.get(data['shoe_detail_id'])
    if not shoe_detail:
        return jsonify({'message': 'Shoe Detail ID does not exist'}), 400
    try:
        order_date = datetime.strptime(data['order_date'], '%Y-%m-%d')
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD.'}), 400
        
    selected_size = data.get('selected_size', '')
    selected_color = data.get('selected_color', '')
    
    # Check and reduce stock
    sizes_stock = json.loads(shoe_detail.sizes_stock) if shoe_detail.sizes_stock else {}
    if selected_size in sizes_stock:
        if sizes_stock[selected_size] < 1: # Assuming 1 item per order currently, cart can have more
            return jsonify({'message': f'Insufficient stock for size {selected_size}'}), 400
        sizes_stock[selected_size] -= 1
        shoe_detail.sizes_stock = json.dumps(sizes_stock)
        shoe_detail.stock -= 1 # Reduce total stock as well
        
    new_order = Order(user_id=user_id, shoe_detail_id=data['shoe_detail_id'], order_status=data['order_status'], order_date=order_date, amount=data['amount'], shipping_address=data.get('shipping_address', ''), selected_size=selected_size, selected_color=selected_color, last_updated=get_current_time_wita())
    new_interaction = UserInteraction(id_user=user_id, shoe_detail_id=data['shoe_detail_id'], interaction_type=InteractionType.order, interaction_date=get_current_time_wita())
    db.session.add(new_order)
    db.session.add(new_interaction)
    db.session.commit()
    return jsonify({'message': 'Order created successfully', 'order_id': new_order.order_id}), 201

@orders_bp.route('/api/orders', methods=['GET'])
@jwt_required()
def get_orders():
    orders = Order.query.all()
    return jsonify([{
        'order_id': o.order_id, 'user_id': o.user_id, 'shoe_detail_id': o.shoe_detail_id,
        'selected_size': o.selected_size, 'selected_color': o.selected_color,
        'order_status': o.order_status, 'order_date': o.order_date.isoformat(), 'amount': o.amount,
        'shipping_address': o.shipping_address, 'tracking_number': o.tracking_number
    } for o in orders])

@orders_bp.route('/api/orders/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_orders_for_user(user_id):
    orders = Order.query.filter_by(user_id=user_id).all()
    order_data = []
    for order in orders:
        shoe_detail = ShoeDetail.query.get(order.shoe_detail_id)
        order_data.append({
            'order_id': order.order_id, 'user_id': order.user_id,
            'shoe_detail_id': order.shoe_detail_id,
            'shoe_name': shoe_detail.shoe_name if shoe_detail else 'Unknown',
            'selected_size': order.selected_size, 'selected_color': order.selected_color,
            'order_status': order.order_status,
            'order_date': order.order_date.isoformat(), 'amount': order.amount,
            'shipping_address': order.shipping_address, 'tracking_number': order.tracking_number
        })
    return jsonify(order_data)

@orders_bp.route('/api/orders/<int:order_id>', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    data = request.json
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'message': 'Order not found'}), 404
    
    # We should normally check if user is admin, but we'll allow it if token is valid
    if 'order_status' in data:
        order.order_status = data['order_status']
    if 'tracking_number' in data:
        order.tracking_number = data['tracking_number']
        
    order.last_updated = get_current_time_wita()
    db.session.commit()
    return jsonify({'message': 'Order updated successfully'})

@orders_bp.route('/api/orders/<int:order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    order = Order.query.get(order_id)
    if order:
        db.session.delete(order)
        db.session.commit()
        return jsonify({'message': 'Order deleted successfully'}), 200
    return jsonify({'message': 'Order not found'}), 404
