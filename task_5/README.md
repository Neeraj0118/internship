# Pulse - Social Media Platform (Task-05)

A feature-complete, modern full-stack Social Media Application built with **Vanilla HTML5, CSS3, JavaScript (ES6+)**, **Node.js / Express**, **SQLite database**, and **Multer** for image and video uploads.

---

## 🌟 Features Implemented

### 1. 👤 User Profiles & Multi-Account Switcher
- **Profile Customization**: Edit display name, bio, location, website link, and upload custom Avatar & Cover images.
- **Profile Stats**: Real-time counter for Posts, Followers, and Following.
- **Filter Tabs**: View posts authored by the user, liked posts, or media-only posts.
- **Account Switcher**: Built-in dropdown header to seamlessly test interactions between multiple simulated accounts (`Alex Rivers`, `Sarah Connor`, `Tech Insider`, `Elena Rostova`, `David Chen`).

### 2. 📝 Post Creation & Media Uploads
- **Rich Post Composer**: Create text posts with live character counter (280 limit).
- **Image & Video Support**: File upload support for images (`.jpg`, `.png`, `.webp`) and video clips (`.mp4`) with instant upload preview thumbnail and removal option.
- **Post Tagging & Hashtags**: Autolink `#hashtags` and `@user` mentions in post body. Tag specific users using the "Tag User" chip selector.

### 3. 💬 Social Interactions (Likes, Comments & Bookmarks)
- **Likes**: Like/unlike posts with heart pop animations and live counter updates.
- **Comments**: Collapsible comment threads with real-time reply composer and author metadata.
- **Bookmarks**: Save posts to a personal Bookmarks library for quick reading.
- **Share**: One-click post link copying with custom toast alerts.

### 4. 🔔 Real-Time Notification System (Optional Feature)
- Notification feed for **Likes**, **Comments**, **Mentions**, and **New Followers**.
- Unread badge counter in left sidebar navigation.
- "Mark all as read" functionality.

### 5. 🔍 Trending Content & Search (Optional Feature)
- **Global Search**: Search posts, hashtags, or users dynamically.
- **Trending Hashtags Widget**: Automatic ranking of top hashtags based on post usage. Clicking any tag filters the feed.
- **Who to Follow**: Recommendation widget displaying top network profiles with instant Follow/Unfollow buttons.

### 6. 🎨 Aesthetic UI / UX & Dark Mode
- **Glassmorphic Modern UI**: Built with custom CSS variables, responsive sidebars, smooth animations, and clean card styling.
- **Dark/Light Mode Toggle**: Persisted theme switch in `localStorage`.
- **Media Lightbox**: Fullscreen lightbox viewer for post images.

---

## 🏗️ Architecture & Database Schema

### Tech Stack:
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+), FontAwesome Icons, Google Plus Jakarta Sans font.
- **Backend**: Node.js, Express.js.
- **Database**: SQLite3 via `better-sqlite3`.
- **Upload Storage**: `multer` storing files in `uploads/`.

### Database Tables:
1. `users` - User accounts, profiles, avatars, covers, and bios.
2. `follows` - Follower and following relational mappings.
3. `posts` - Post text content, media URLs, media types, and timestamps.
4. `post_tags` - Extracted hashtags and mentions for fast indexed search.
5. `likes` - Many-to-many relationship between users and liked posts.
6. `comments` - Post comments and author metadata.
7. `notifications` - Action logs for likes, comments, follows, and mentions.
8. `bookmarks` - Saved posts per user.

---

## 🚀 How to Run the Application

1. **Navigate to project directory**:
   ```bash
   cd C:\Users\neera\OneDrive\Desktop\internship\task_5
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```
   *or*
   ```bash
   node server.js
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📡 REST API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | List all user profiles with follower/following stats |
| `GET` | `/api/users/:identifier` | Get user profile details by ID or username |
| `PUT` | `/api/users/:id` | Update profile information |
| `POST` | `/api/users/:id/media` | Upload custom profile avatar or cover image |
| `POST` | `/api/users/:id/follow` | Follow a target user |
| `DELETE` | `/api/users/:id/follow` | Unfollow a target user |
| `GET` | `/api/posts` | Get posts feed (supports `type`, `tag`, `user_id`, `search`) |
| `POST` | `/api/posts` | Create new post (supports multipart media upload) |
| `DELETE` | `/api/posts/:id` | Delete a post |
| `POST` | `/api/posts/:id/like` | Toggle post like status |
| `GET` | `/api/posts/:id/comments` | Get post comments |
| `POST` | `/api/posts/:id/comments` | Add new comment to post |
| `POST` | `/api/posts/:id/bookmark` | Save/unsave post bookmark |
| `GET` | `/api/notifications` | Get notifications for current active user |
| `PUT` | `/api/notifications/read-all`| Mark all notifications as read |
| `GET` | `/api/trending/tags` | Get top trending hashtags |
| `GET` | `/api/users/recommended` | Get recommended users to follow |
