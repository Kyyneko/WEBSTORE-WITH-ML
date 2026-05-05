from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pytz
import enum

db = SQLAlchemy()


def get_current_time_wita():
    """Mengambil waktu saat ini di zona waktu WITA (Asia/Makassar)."""
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz)


class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    address = db.Column(db.String(200))
    phone = db.Column(db.String(20))
    first_name = db.Column(db.String(80), nullable=True, default=" ")
    last_name = db.Column(db.String(80), nullable=True, default=" ")
    role = db.Column(db.String(50), nullable=True, default="User")
    date_added = db.Column(db.DateTime, default=get_current_time_wita)
    last_updated = db.Column(db.DateTime, default=get_current_time_wita, onupdate=get_current_time_wita)

    # Relationships
    orders = db.relationship('Order', backref='user', lazy=True)
    cart_items = db.relationship('Cart', backref='user', lazy=True)
    wishlist_items = db.relationship('Wishlist', backref='user', lazy=True)
    interactions = db.relationship('UserInteraction', backref='user', lazy=True)
    recommendations = db.relationship('ShoeRecomendationForUsers', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'


class ShoeCategory(db.Model):
    category_id = db.Column(db.Integer, primary_key=True)
    category_name = db.Column(db.String(100), nullable=False)
    date_added = db.Column(db.DateTime, default=get_current_time_wita)
    last_updated = db.Column(db.DateTime, default=get_current_time_wita, onupdate=get_current_time_wita)

    # Relationships
    shoes = db.relationship('ShoeDetail', backref='category', lazy=True)

    def __repr__(self):
        return f'<ShoeCategory {self.category_name}>'


class ShoeDetail(db.Model):
    shoe_detail_id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('shoe_category.category_id'), nullable=False)
    shoe_name = db.Column(db.String(100), nullable=False)
    shoe_price = db.Column(db.Float, nullable=False)
    sizes_stock = db.Column(db.Text, nullable=False) # Stored as JSON string
    colors = db.Column(db.String(255), nullable=True, default="")
    stock = db.Column(db.Integer, nullable=False) # Total stock
    description = db.Column(db.Text, nullable=True, default="")
    image_url = db.Column(db.String(255), nullable=True, default="")
    date_added = db.Column(db.DateTime, default=get_current_time_wita)
    last_updated = db.Column(db.DateTime, default=get_current_time_wita, onupdate=get_current_time_wita)

    # Relationships
    orders = db.relationship('Order', backref='shoe', lazy=True)
    cart_items = db.relationship('Cart', backref='shoe', lazy=True)
    wishlist_items = db.relationship('Wishlist', backref='shoe', lazy=True)
    interactions = db.relationship('UserInteraction', backref='shoe', lazy=True)
    recommendations = db.relationship('ShoeRecomendationForUsers', backref='shoe', lazy=True)

    def __repr__(self):
        return f'<ShoeDetail {self.shoe_name}>'


class Order(db.Model):
    order_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    shoe_detail_id = db.Column(db.Integer, db.ForeignKey('shoe_detail.shoe_detail_id'), nullable=False)
    order_date = db.Column(db.Date, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    selected_size = db.Column(db.String(10), nullable=True, default="")
    selected_color = db.Column(db.String(50), nullable=True, default="")
    order_status = db.Column(db.String(50), nullable=False)
    shipping_address = db.Column(db.Text, nullable=True, default="")
    tracking_number = db.Column(db.String(100), nullable=True, default="")
    last_updated = db.Column(db.DateTime, default=get_current_time_wita, onupdate=get_current_time_wita)

    def __repr__(self):
        return f'<Order {self.order_id}>'


class Payment(db.Model):
    payment_id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.order_id'), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    payment_status = db.Column(db.String(50), nullable=False)
    payment_date = db.Column(db.Date, nullable=False)

    # Relationship
    order = db.relationship('Order', backref='payment', lazy=True)

    def __repr__(self):
        return f'<Payment {self.payment_id}>'


class Cart(db.Model):
    id_cart = db.Column(db.Integer, primary_key=True)
    shoe_detail_id = db.Column(db.Integer, db.ForeignKey('shoe_detail.shoe_detail_id'), nullable=False)
    id_user = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    selected_size = db.Column(db.String(10), nullable=True, default="")
    selected_color = db.Column(db.String(50), nullable=True, default="")
    quantity = db.Column(db.Integer, nullable=False, default=1)
    date_added = db.Column(db.DateTime, default=get_current_time_wita)
    last_updated = db.Column(db.DateTime, default=get_current_time_wita, onupdate=get_current_time_wita)

    def __repr__(self):
        return f'<Cart {self.id_cart}>'


class Wishlist(db.Model):
    id_wishlist = db.Column(db.Integer, primary_key=True)
    shoe_detail_id = db.Column(db.Integer, db.ForeignKey('shoe_detail.shoe_detail_id'), nullable=False)
    id_user = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    date_added = db.Column(db.DateTime, default=get_current_time_wita)

    def __repr__(self):
        return f'<Wishlist {self.id_wishlist}>'


# Enum untuk jenis interaksi
class InteractionType(enum.Enum):
    view = "view"
    wishlist = "wishlist"
    cart = "cart"
    order = "order"


class UserInteraction(db.Model):
    interaction_id = db.Column(db.Integer, primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    shoe_detail_id = db.Column(db.Integer, db.ForeignKey('shoe_detail.shoe_detail_id'), nullable=False)
    interaction_type = db.Column(db.Enum(InteractionType), nullable=False)
    interaction_date = db.Column(db.DateTime, default=get_current_time_wita)

    def __repr__(self):
        return f'<UserInteraction {self.interaction_id}>'


class ShoeRecomendationForUsers(db.Model):
    id_shoe_recomendation = db.Column(db.Integer, primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    shoe_detail_id = db.Column(db.Integer, db.ForeignKey('shoe_detail.shoe_detail_id'), nullable=False)

    def __repr__(self):
        return f'<ShoeRecomendation {self.id_shoe_recomendation}>'