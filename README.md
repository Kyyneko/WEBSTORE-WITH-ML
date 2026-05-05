# 👟 R&R Webstore (E-Commerce with AI Recommendation)

Welcome to **R&R Webstore**, a modern, full-stack E-Commerce platform built with a cutting-edge technology stack and integrated Machine Learning for personalized product recommendations.

![R&R Webstore Preview](/images/sneakers_nike.png)

## 🚀 Public Demo & Testing
If you would like to test this application locally, we have pre-configured dummy accounts for you to explore the features immediately without needing to register.

**Regular User Account (For exploring products, cart, and AI recommendations):**
- **Username:** `user1` (You can also try `user2`, `user3`, up to `user20`)
- **Password:** `user123`

**Admin Account (For managing products, orders, and users):**
- **Username:** `admin`
- **Password:** `admin123`

---

## 🛠️ Technology Stack & Architecture Rationale

This project was built with performance, maintainability, and modern aesthetics in mind. Here is a complete breakdown of the tech stack chosen and the reasoning behind it:

### 1. Frontend: React.js
- **Why React?** We chose React for its component-based architecture, which allows us to build highly reusable UI elements (like product cards, navigation bars, and modals). React's Virtual DOM ensures lightning-fast rendering, providing users with a seamless, SPA (Single Page Application) experience crucial for modern E-Commerce without constant page reloads.

### 2. Styling & UI Components: Tailwind CSS, SweetAlert2, & Leaflet
- **Why Tailwind CSS?** Tailwind is a utility-first CSS framework that enables rapid UI development. Instead of jumping between CSS files and HTML, we styled the application directly within React components. This allowed us to easily implement complex modern designs like **Glassmorphism**, dark themes, and responsive layouts while keeping the final CSS bundle incredibly small.
- **Why SweetAlert2?** For elegant, non-blocking user feedback (like "Added to Cart" toasts and deletion confirmations) without the hassle of building custom popup systems from scratch.
- **Why Leaflet & OpenStreetMap?** To provide a premium Checkout experience, we integrated an interactive map for shipping address selection. Leaflet combined with the Nominatim reverse-geocoding API offers a Google Maps-like draggable pin and search functionality, entirely Open-Source and free of API key requirements.

### 3. Backend: Python & Flask
- **Why Flask?** Flask is a lightweight, flexible Python micro-framework. Unlike Django, Flask gives us total control over the architecture without unnecessary bloat.
- **Why Python?** The primary reason for choosing Python on the backend is **Machine Learning**. By keeping the API and the ML models in the same language and ecosystem, we eliminated the need to build complex microservices just to serve AI recommendations.

### 4. Database: SQLite & SQLAlchemy (ORM)
- **Why SQLite?** For rapid development and public demonstration, SQLite provides a zero-configuration, serverless database that lives directly in a local file (`webstore.db`). This makes the project extremely easy to clone and run.
- **Why SQLAlchemy?** As an Object Relational Mapper (ORM), SQLAlchemy abstracts raw SQL queries into Python objects. This not only speeds up development and prevents SQL injection attacks but also ensures that the application can easily be migrated to a production-grade database like **PostgreSQL** or **MySQL** in the future simply by changing a single connection string.

### 5. Security & Authentication: JWT (JSON Web Tokens)
- **Why JWT?** JWT allows for stateless authentication. The server doesn't need to store session data. Once a user logs in, they receive a signed token used to securely authorize API requests. This decoupling is perfect for a separated React (Client) and Flask (API) architecture.

### 6. Artificial Intelligence: Scikit-Learn
- **Why Scikit-Learn?** This robust Python library powers the "Recommended For You" section. By analyzing user interaction data (what they view, add to cart, and buy), the backend trains a recommendation model to serve personalized product suggestions dynamically.

---

## 💻 How to Run Locally

### Prerequisites
- Node.js (v14+)
- Python (3.8+)

### 1. Start the Backend (Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
python seed_database.py   # To generate dummy users, products, and variants
python app.py
```
*The API will run on `http://localhost:5000`*

### 2. Start the Frontend (React)
```bash
# Open a new terminal instance in the root directory
npm install
npm start
```
*The web app will run on `http://localhost:3000`*

---

**Developed with ❤️ for a modern E-Commerce experience.**
