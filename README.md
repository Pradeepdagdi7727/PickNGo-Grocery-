# 🛒 PickNGO – Grocery App

A full-stack grocery shopping application with separate Admin and Customer portals.

🔗 **[Live Demo](https://pickngo-frontend.onrender.com/)**

---

## ✨ Features

### 👤 Customer
- Register/Login with JWT authentication
- Browse and search products
- Add to cart, update quantity, remove items
- Place orders and view order history
- Profile management

### 🔧 Admin
- Secure admin dashboard
- Add, update, delete products
- Manage and update order status
- View all customer orders

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) |
| Authentication | JWT, Bcrypt |
| Frontend | React, Vite, Tailwind CSS |
| Deployment | Render |

---

## 🚀 Run Locally

```bash
git clone https://github.com/Pradeepdagdi7727/PickNGo-Grocery-.git
cd PickNGo-Grocery-
npm install
```

Create a `.env` file:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
PORT=4000
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

```bash
node server.js
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```
PickNGo-Grocery-/
├── Routers/
│   ├── Admin_router/       # Admin APIs
│   └── customer_router/    # Customer APIs
├── middleware/             # Auth middleware
├── models/                 # MongoDB models
├── frontend/               # React + Vite app
└── server.js
```
---

## 👨‍💻 Author

**Pradeep Dagdi** — [GitHub](https://github.com/Pradeepdagdi7727) | [LinkedIn](https://www.linkedin.com/in/pradeep-dagdi-58a769297/)
