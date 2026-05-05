from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import ShoeDetail, User, db, UserInteraction, InteractionType
from datetime import datetime
import pytz
import logging

user_interaction_bp = Blueprint('user_interaction', __name__)
logger = logging.getLogger(__name__)

def get_current_time_wita():
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz)

@user_interaction_bp.route('/user_interactions', methods=['GET'])
@jwt_required()
def get_all_interactions():
    interactions = UserInteraction.query.all()
    return jsonify([{
        'interaction_id': i.interaction_id, 'id_user': i.id_user,
        'shoe_detail_id': i.shoe_detail_id, 'interaction_type': i.interaction_type.value,
        'interaction_date': i.interaction_date
    } for i in interactions]), 200

@user_interaction_bp.route('/user_interactions', methods=['POST'])
@jwt_required()
def create_interaction():
    data = request.get_json()
    if not data or 'id_user' not in data or 'shoe_detail_id' not in data or 'interaction_type' not in data:
        return jsonify({'message': 'Missing required fields'}), 400
    user = User.query.get(data['id_user'])
    if not user:
        return jsonify({'message': 'User not found'}), 404
    shoe = ShoeDetail.query.get(data['shoe_detail_id'])
    if not shoe:
        return jsonify({'message': 'Shoe not found'}), 404
    try:
        interaction_type = InteractionType[data['interaction_type']]
    except KeyError:
        return jsonify({'message': 'Invalid interaction type'}), 400
    try:
        new_interaction = UserInteraction(id_user=data['id_user'], shoe_detail_id=data['shoe_detail_id'], interaction_type=interaction_type, interaction_date=get_current_time_wita())
        db.session.add(new_interaction)
        db.session.commit()
        return jsonify({'message': 'Interaction recorded successfully'}), 201
    except Exception as e:
        logger.error(f"Error creating interaction: {str(e)}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

@user_interaction_bp.route('/user_interactions/<int:interaction_id>', methods=['PUT'])
@jwt_required()
def update_interaction(interaction_id):
    data = request.json
    interaction = UserInteraction.query.get(interaction_id)
    if not interaction:
        return jsonify({'message': 'Interaction not found'}), 404
    interaction.interaction_type = InteractionType[data['interaction_type']]
    interaction.interaction_date = get_current_time_wita()
    db.session.commit()
    return jsonify({'message': 'Interaction updated successfully'}), 200

@user_interaction_bp.route('/user_interactions/<int:interaction_id>', methods=['DELETE'])
@jwt_required()
def delete_interaction(interaction_id):
    interaction = UserInteraction.query.get(interaction_id)
    if not interaction:
        return jsonify({'message': 'Interaction not found'}), 404
    db.session.delete(interaction)
    db.session.commit()
    return jsonify({'message': 'Interaction deleted successfully'}), 200
