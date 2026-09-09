# 🛒 MetroMart Local Store - Full-Stack E-Commerce Platform

> **Prodigy InfoTech Internship Submission — Task-03**  
> A full-stack, production-grade e-commerce platform built for a local neighborhood store, enabling customers to browse inventory, filter/sort products, manage shopping carts, complete checkout, track orders live, leave product reviews, and interact with a smart customer support desk. Includes a store manager admin portal.

---

## 🌟 Key Highlights & Features

### Core Task Requirements
- **Local Store Catalog**: High-resolution product showcase featuring organic produce, artisanal bakery goods, dairy & farm eggs, pantry items, and beverages.
- **Product Details & Stock Badges**: Real-time stock status ("In Stock", "Low Stock", "Out of Stock"), price per unit, original price strike-throughs, and rating scores.
- **Shopping Cart Drawer**: Slide-out cart with real-time quantity controls, item removal, free shipping progress bar ($35 threshold), tax calculation, and coupon discount validation (`LOCAL10` for 10% off, `FREESHIP` for free delivery).
- **Checkout & Order Fulfillment**: 2-step checkout workflow with customer shipping details, payment gateway simulation (Credit Card, UPI, Cash on Delivery), and instant Order Tracking ID generation.

### Resume-Enhancing Optional Features
- **🔍 Advanced Sorting & Filtering**: Filter by category, price range, stock availability; sort by price (low/high), popularity, rating, or arrival date.
- **🚚 Live Order Tracking**: Visual step-by-step order progress timeline (`Processing` -> `Packed` -> `Out for Delivery` -> `Delivered`) with tracking ID lookup (e.g. `ORD-98421`).
- **⭐ Customer Ratings & Verified Reviews**: Interactive star rating breakdown and review submission form updating average product ratings in real-time.
- **🤖 Smart Customer Support Assistant & FAQs**: Live chat widget with automated responses for store hours, delivery policies, returns, and ticket submission.
- **🛡️ Store Manager Admin Dashboard**: Portal to add new products, adjust inventory stock levels and prices in real-time, view total revenue/sales stats, and update customer order fulfillment statuses.
- **💾 Database Persistence**: SQLite database (`better-sqlite3`) with WAL mode for fast, robust persistence of products, orders, reviews, and support tickets.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React (Vite 6) | Component-driven UI framework |
| **Styling** | Tailwind CSS v4 + Lucide Icons | Responsive, modern design & iconography |
| **State Management** | React Context API | Global cart, modal, filter, and notification state |
| **Backend API** | Node.js + Express | RESTful API backend with CORS & middleware |
| **Database** | SQLite (`better-sqlite3`) | Persistent relational database with seed data |
| **Testing** | Node.js Native Test Runner | Automated API endpoint tests |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### 1. Installation
Clone the repository and install dependencies:
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Running the Application
Start both the Express backend API (Port 5000) and Vite React frontend (Port 3000) concurrently:
```bash
npm start
```
- **Frontend App**: Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Backend REST API**: Accessible at [http://localhost:5000/api](http://localhost:5000/api).

### 3. Running Automated API Tests
To execute the automated API test suite:
```bash
npm run start:backend
# In a separate terminal or after starting backend:
cd backend && node --test tests/api.test.js
```

---

## 📡 REST API Documentation

### Products API
- `GET /api/products` — List all products (Query params: `category`, `search`, `minPrice`, `maxPrice`, `inStock`, `sort`)
- `GET /api/products/:id` — Get detailed product info with customer reviews
- `POST /api/products` — Create a new product (Admin)
- `PUT /api/products/:id` — Update product price or stock levels (Admin)

### Orders API
- `POST /api/orders` — Place order and receive unique tracking ID (`ORD-XXXXX`)
- `GET /api/orders/:trackingId` — Retrieve live order status and shipping timeline
- `GET /api/orders` — List all customer orders (Admin)
- `PUT /api/orders/:id/status` — Update order tracking status (`Processing`, `Packed`, `Out for Delivery`, `Delivered`)

### Reviews & Support API
- `POST /api/reviews` — Submit a verified product star rating & comment
- `POST /api/support` — Send support ticket / interact with AI assistant

---

## 🧪 Sample Test Credentials & Demo Codes
- **Demo Order Tracking ID**: `ORD-98421` (Try typing this in the **Track Order** tab!)
- **Discount Coupons**:
  - `LOCAL10` — 10% Discount on cart total
  - `FREESHIP` — Free Local Delivery

---

## 👤 Author & Internship Details
- **Project**: Task-03 Local Store E-Commerce Platform
- **Organization**: Prodigy InfoTech Internship Program
