# Task-04: Real-Time Chat Application (PulseChat)

A modern, high-performance, real-time chat application built using **WebSocket technology (Socket.IO)**, **Node.js/Express**, **SQLite/JSON Database**, and **React + Tailwind CSS**.

---

## 🌟 Key Features

### 🔐 1. User Accounts & Authentication
- Full user registration and login with email, password hashing (`bcryptjs`), and avatar selection.
- JWT-based authentication with persistent user sessions.

### ⚡ 2. Real-Time WebSockets Messaging
- Instant sub-second message delivery powered by Socket.IO.
- Real-time online/offline presence indicators.
- Live "... is typing" status indicators across rooms and direct messages.

### 💬 3. Chat Rooms & Private Direct Messages
- **Public & Private Rooms**: Create and join channels (e.g. General, Tech & Dev, Random).
- **1-on-1 Direct Messaging**: Private conversations with individual users on the platform.

### 📜 4. Chat History & Message Search
- Persistent message store with automatic history loading upon switching rooms or DMs.
- Search messages across conversations.

### 📁 5. Multimedia File Sharing Capabilities
- Share images, audio clips, and documents directly in chat.
- Live image previews and file download options inside chat bubbles.

### 🔔 6. Notifications & Extra Delights
- Web Audio API sound alert synthesizer for instant incoming message notifications.
- Emoji picker support (`😊 👍 🎉 ❤️ 🔥 🚀 💻 💡 📁 ⚡`).
- Responsive dark-themed UI built with Tailwind CSS.

---

## 🚀 How to Run

### 1. Start Backend Server
```bash
cd server
npm install
npm start
```
The server will start on **`http://localhost:5000`**.

### 2. Start Frontend App
```bash
cd client
npm install
npm run dev
```
The client app will open on **`http://localhost:3000`** (or `http://localhost:5173`).

---

## 📁 Repository Structure

```
task_4/
├── server/
│   ├── index.js              # Express app & HTTP server entry point
│   ├── socket.js             # Socket.IO WebSocket handlers
│   ├── db.js                 # Database storage & queries
│   ├── middleware/auth.js    # JWT verification
│   ├── routes/               # API endpoints (Auth, Rooms, Messages, Uploads)
│   └── uploads/              # Static storage for shared media
└── client/
    ├── src/
    │   ├── App.jsx           # Root container
    │   ├── context/          # AuthContext & SocketContext
    │   └── components/       # UI Components (Auth, Sidebar, ChatWindow, MessageInput)
    ├── vite.config.js
    └── package.json
```
