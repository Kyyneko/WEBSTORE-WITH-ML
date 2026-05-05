from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Payment, Order
from datetime import datetime

payments_bp = Blueprint('payments', __name__)


@payments_bp.route('/api/payments', methods=['POST'])
@jwt_required()
def process_payment():
    data = request.json

    # Validasi input
    if not data or 'order_id' not in data or 'payment_method' not in data or 'payment_status' not in data or 'payment_date' not in data:
        return jsonify({'message': 'Data yang dikirim tidak lengkap'}), 400

    try:
        payment_date = datetime.strptime(data['payment_date'], '%Y-%m-%d')
    except ValueError:
        return jsonify({'message': 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD.'}), 400

    # Pengecekan apakah order_id ada di tabel Order
    order = Order.query.get(data['order_id'])
    if not order:
        return jsonify({'message': 'Order ID tidak ditemukan'}), 400

    # Pengecekan apakah sudah ada pembayaran dengan order_id yang sama
    existing_payment = Payment.query.filter_by(order_id=data['order_id']).first()
    if existing_payment:
        return jsonify({'message': 'Pembayaran sudah dilakukan untuk Order ini'}), 400

    new_payment = Payment(
        order_id=data['order_id'],
        payment_method=data['payment_method'],
        payment_status=data['payment_status'],
        payment_date=payment_date
    )
    db.session.add(new_payment)
    db.session.commit()
    return jsonify({'message': 'Pembayaran berhasil diproses'}), 201


@payments_bp.route('/api/payments/<int:payment_id>', methods=['PUT'])
@jwt_required()
def update_payment_status(payment_id):
    data = request.json
    payment = Payment.query.get(payment_id)
    if payment:
        if 'payment_status' in data:
            payment.payment_status = data['payment_status']
            db.session.commit()
            return jsonify({'message': 'Status pembayaran berhasil diperbarui'}), 200
        return jsonify({'message': 'Status pembayaran tidak disertakan'}), 400
    return jsonify({'message': 'Pembayaran tidak ditemukan'}), 404


@payments_bp.route('/api/payments/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if payment:
        return jsonify({
            'payment_id': payment.payment_id,
            'order_id': payment.order_id,
            'payment_method': payment.payment_method,
            'payment_status': payment.payment_status,
            'payment_date': payment.payment_date.strftime('%Y-%m-%d')
        }), 200
    return jsonify({'message': 'Pembayaran tidak ditemukan'}), 404


@payments_bp.route('/api/payments', methods=['GET'])
@jwt_required()
def get_payments():
    payments = Payment.query.all()
    if payments:
        result = [{
            'payment_id': payment.payment_id,
            'order_id': payment.order_id,
            'payment_method': payment.payment_method,
            'payment_status': payment.payment_status,
            'payment_date': payment.payment_date.strftime('%Y-%m-%d')
        } for payment in payments]
        return jsonify(result), 200
    return jsonify({'message': 'Tidak ada pembayaran ditemukan'}), 404


@payments_bp.route('/api/payments/<int:payment_id>', methods=['DELETE'])
@jwt_required()
def delete_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if payment:
        db.session.delete(payment)
        db.session.commit()
        return jsonify({'message': 'Pembayaran berhasil dihapus'}), 200
    return jsonify({'message': 'Pembayaran tidak ditemukan'}), 404
