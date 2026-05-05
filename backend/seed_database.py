#!/usr/bin/env python3
"""
Seed Database Script for Roots & Routes Webstore
Creates all tables and seeds with initial data.
Run: python seed_database.py
"""
import os
import sys
import random
import json
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

# Add parent dir to path
sys.path.insert(0, os.path.dirname(__file__))

from app import app
from models import db, User, ShoeCategory, ShoeDetail, Order, Payment, Cart, Wishlist, UserInteraction, InteractionType, ShoeRecomendationForUsers
import pytz

def get_wita_now():
    return datetime.now(pytz.timezone('Asia/Makassar'))

def seed():
    with app.app_context():
        # Drop and recreate all tables
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()

        # === 1. CATEGORIES ===
        print("Seeding categories...")
        categories = [
            ShoeCategory(category_name="Sport", date_added=get_wita_now(), last_updated=get_wita_now()),
            ShoeCategory(category_name="Casual", date_added=get_wita_now(), last_updated=get_wita_now()),
            ShoeCategory(category_name="Boots", date_added=get_wita_now(), last_updated=get_wita_now()),
            ShoeCategory(category_name="Heels", date_added=get_wita_now(), last_updated=get_wita_now()),
            ShoeCategory(category_name="Formal", date_added=get_wita_now(), last_updated=get_wita_now()),
        ]
        db.session.add_all(categories)
        db.session.commit()

        # === 2. SHOES (matching image files in public/images/) ===
        print("Seeding shoes...")
        shoes_data = [
            # Sport (category_id=1)
            {"name": "Ardiles Nfinity Burst", "price": 450000, "size": "42", "stock": 25, "cat": 1},
            {"name": "Asics Gel Sonoma SE", "price": 1850000, "size": "43", "stock": 15, "cat": 1},
            {"name": "Asics Magic Speed 4 Digital Aqua Original", "price": 2750000, "size": "42", "stock": 10, "cat": 1},
            {"name": "Asics Novablast 4 Tr Nature Bathing Original", "price": 2200000, "size": "41", "stock": 12, "cat": 1},
            {"name": "Eagle Run Breaker", "price": 380000, "size": "43", "stock": 30, "cat": 1},
            {"name": "Mizuno Wave Rebellion Flash 2 River Blue Original", "price": 2100000, "size": "42", "stock": 8, "cat": 1},
            {"name": "New Balance Fuelcell Rebel V4 Off White Lime Original", "price": 2400000, "size": "43", "stock": 10, "cat": 1},
            {"name": "Nike Air Zoom Pegasus 41 Blueprint White Original", "price": 1950000, "size": "42", "stock": 15, "cat": 1},
            {"name": "NovaBlast 4 Platinum", "price": 2100000, "size": "41", "stock": 10, "cat": 1},
            {"name": "ORTUSEIGHT HYPERBLAST 1.3", "price": 550000, "size": "42", "stock": 20, "cat": 1},
            {"name": "Ortuseight Running Hyperfuse 1.4 Black Cyan", "price": 620000, "size": "43", "stock": 18, "cat": 1},
            {"name": "Parabellum COBRA", "price": 750000, "size": "42", "stock": 15, "cat": 1},
            # Casual (category_id=2)
            {"name": "BYWALK Cms45 Casual Moccasin", "price": 320000, "size": "41", "stock": 20, "cat": 2},
            {"name": "Brick Mansions Slip On Mission", "price": 280000, "size": "42", "stock": 25, "cat": 2},
            {"name": "Cardinal M0839E01A", "price": 450000, "size": "42", "stock": 15, "cat": 2},
            {"name": "Casual Kulit Asli Docmart", "price": 650000, "size": "43", "stock": 12, "cat": 2},
            {"name": "Converse 70S OX Black White Egret Low Original", "price": 950000, "size": "42", "stock": 20, "cat": 2},
            {"name": "Nike Air Jordan 1 Low Red Bred Toe", "price": 1650000, "size": "42", "stock": 10, "cat": 2},
            {"name": "Nike Air Jordan 1 Low White Wolf Grey", "price": 1550000, "size": "43", "stock": 12, "cat": 2},
            {"name": "Nike Dunk Panda", "price": 1450000, "size": "42", "stock": 15, "cat": 2},
            {"name": "New Balance Black Dark Grey", "price": 1200000, "size": "42", "stock": 10, "cat": 2},
            {"name": "Slip On Mission Black White", "price": 350000, "size": "41", "stock": 25, "cat": 2},
            {"name": "XternalStepSure Miterns Storm Low Black White", "price": 480000, "size": "42", "stock": 18, "cat": 2},
            {"name": "PHOENIX VOYAGE ORIGINAL", "price": 550000, "size": "43", "stock": 15, "cat": 2},
            # Boots (category_id=3)
            {"name": "AP Boots Terra Eco", "price": 185000, "size": "42", "stock": 30, "cat": 3},
            {"name": "AXEL BROWN Chelsea High Boots", "price": 750000, "size": "42", "stock": 12, "cat": 3},
            {"name": "Azcost Allison Original", "price": 450000, "size": "43", "stock": 15, "cat": 3},
            {"name": "FromZero Aransa Black", "price": 520000, "size": "42", "stock": 10, "cat": 3},
            {"name": "Lennox Oliv Moc Toe Boots Rugged Style Crazy Horse", "price": 850000, "size": "42", "stock": 8, "cat": 3},
            {"name": "MANCOW High Boots", "price": 680000, "size": "43", "stock": 10, "cat": 3},
            {"name": "Nokha Boots Harlow Black", "price": 950000, "size": "39", "stock": 8, "cat": 3},
            {"name": "Snow boots men winter", "price": 420000, "size": "43", "stock": 15, "cat": 3},
            {"name": "uthor Aztec Tan Rugged Adventure Koku Footwear", "price": 580000, "size": "42", "stock": 12, "cat": 3},
            # Heels (category_id=4)
            {"name": "Celline Heels", "price": 350000, "size": "37", "stock": 15, "cat": 4},
            {"name": "Glossy Beige Italian Sole", "price": 1250000, "size": "38", "stock": 8, "cat": 4},
            {"name": "Glossy Black Slingback Italian Sole", "price": 1350000, "size": "37", "stock": 10, "cat": 4},
            {"name": "Glossy Italian Sole Pink", "price": 1200000, "size": "38", "stock": 8, "cat": 4},
            {"name": "Glossy Suina France Sole", "price": 1450000, "size": "37", "stock": 6, "cat": 4},
            {"name": "Jasmine Mules Heels", "price": 280000, "size": "38", "stock": 20, "cat": 4},
            {"name": "Metallic Silver Slingback Italian Sole", "price": 1380000, "size": "37", "stock": 8, "cat": 4},
            {"name": "Pennay Callista Mules Heels", "price": 250000, "size": "38", "stock": 25, "cat": 4},
            {"name": "Satin Crystal Italian Sole Heels", "price": 1500000, "size": "37", "stock": 6, "cat": 4},
            {"name": "Satin Crystal Italian Sole", "price": 1420000, "size": "38", "stock": 8, "cat": 4},
            # Formal (category_id=5)
            {"name": "Casual leather pantofel", "price": 550000, "size": "42", "stock": 15, "cat": 5},
            {"name": "Francis Pantofel", "price": 780000, "size": "42", "stock": 10, "cat": 5},
            {"name": "Kenzios Hatta Black Series", "price": 420000, "size": "42", "stock": 18, "cat": 5},
            {"name": "leather pantofel d2a", "price": 480000, "size": "43", "stock": 15, "cat": 5},
            {"name": "oxford quarter cap toe", "price": 850000, "size": "42", "stock": 8, "cat": 5},
            {"name": "Pantofel Premium Tie 4449", "price": 650000, "size": "42", "stock": 12, "cat": 5},
            {"name": "Wirken Oxford", "price": 720000, "size": "43", "stock": 10, "cat": 5},
        ]

        for s in shoes_data:
            sizes = ["38", "39", "40", "41", "42", "43", "44"]
            colors = ["Black", "White", "Red", "Blue", "Grey"]
            
            # Generate random sizes stock dictionary
            sizes_stock = {}
            for size in sizes:
                # 20% chance of being out of stock (0)
                sizes_stock[size] = 0 if random.random() < 0.2 else random.randint(1, 10)
            
            # Generate random available colors
            available_colors = ", ".join(random.sample(colors, random.randint(1, 3)))
            
            # Calculate total stock
            total_stock = sum(sizes_stock.values())

            shoe = ShoeDetail(
                category_id=s["cat"], shoe_name=s["name"], shoe_price=s["price"],
                sizes_stock=json.dumps(sizes_stock), colors=available_colors, stock=total_stock,
                description=f"Premium quality {s['name']}. Comfortable and stylish for your everyday needs.",
                image_url=f"/images/{s['name']}.jpg",
                date_added=get_wita_now(), last_updated=get_wita_now()
            )
            db.session.add(shoe)
        db.session.commit()
        total_shoes = len(shoes_data)
        print(f"  {total_shoes} shoes seeded.")

        # === 3. USERS ===
        print("Seeding users...")
        admin = User(username='admin', password=generate_password_hash('admin123', method='pbkdf2:sha256'), email='admin@rootsroutes.com', address='Makassar, Indonesia', phone='081234567890', first_name='Admin', last_name='RnR', role='Admin')
        db.session.add(admin)
        demo_users = []
        for i in range(1, 26):
            u = User(username=f'user{i}', password=generate_password_hash(f'password{i}', method='pbkdf2:sha256'), email=f'user{i}@example.com', first_name=f'User', last_name=f'{i}', role='User')
            db.session.add(u)
            demo_users.append(u)
        db.session.commit()
        print("  1 admin + 25 users seeded.")

        # === 4. USER INTERACTIONS ===
        print("Seeding user interactions...")
        interaction_types = list(InteractionType)
        for _ in range(5000):
            uid = random.randint(2, 26)
            sid = random.randint(1, total_shoes)
            itype = random.choice(interaction_types)
            days_ago = random.randint(0, 90)
            idate = get_wita_now() - timedelta(days=days_ago)
            interaction = UserInteraction(id_user=uid, shoe_detail_id=sid, interaction_type=itype, interaction_date=idate)
            db.session.add(interaction)
        db.session.commit()
        print("  5000 interactions seeded.")

        # === 5. SAMPLE ORDERS ===
        print("Seeding sample orders...")
        statuses = ['Pending', 'Processing', 'Shipped', 'Delivered']
        for _ in range(200):
            uid = random.randint(2, 26)
            sid = random.randint(1, total_shoes)
            shoe = ShoeDetail.query.get(sid)
            if shoe:
                # Select random size and color from available ones
                sizes_stock = json.loads(shoe.sizes_stock)
                available_sizes = [size for size, st in sizes_stock.items() if st > 0]
                sel_size = random.choice(available_sizes) if available_sizes else "40"
                sel_color = random.choice(shoe.colors.split(", ")) if shoe.colors else "Black"
                
                days_ago = random.randint(0, 60)
                status = random.choice(statuses)
                tracking = f"RR-{random.randint(1000000, 9999999)}" if status in ['Shipped', 'Delivered'] else ""
                o = Order(user_id=uid, shoe_detail_id=sid, order_date=(get_wita_now() - timedelta(days=days_ago)).date(), amount=shoe.shoe_price * random.randint(1, 3), selected_size=sel_size, selected_color=sel_color, order_status=status, shipping_address=f"Jalan Contoh No. {random.randint(1,100)}, Makassar", tracking_number=tracking, last_updated=get_wita_now())
                db.session.add(o)
        db.session.commit()
        print("  200 orders seeded.")

        print("\n✅ Database seeded successfully!")
        print(f"   Admin login: admin / admin123")
        print(f"   User login:  user1 / password1")

if __name__ == '__main__':
    seed()
