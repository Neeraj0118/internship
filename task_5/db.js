const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

function initDb() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      email TEXT UNIQUE,
      bio TEXT,
      avatar TEXT,
      cover_image TEXT,
      location TEXT,
      website TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS follows (
      follower_id INTEGER NOT NULL,
      following_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT,
      media_url TEXT,
      media_type TEXT DEFAULT 'none',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS post_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      tag_name TEXT NOT NULL,
      tag_type TEXT NOT NULL, -- 'hashtag' or 'mention'
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS likes (
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      actor_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'like', 'comment', 'follow', 'mention'
      post_id INTEGER,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
  `);

  // Seed sample data if database is empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    seedInitialData();
  }
}

function seedInitialData() {
  console.log('Seeding initial data...');

  const insertUser = db.prepare(`
    INSERT INTO users (username, display_name, email, bio, avatar, cover_image, location, website)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Pre-populated realistic avatars & cover images from Unsplash / UI Avatars
  const users = [
    {
      username: 'alex_rivers',
      display_name: 'Alex Rivers',
      email: 'alex@example.com',
      bio: 'Full-stack software developer & open source enthusiast 🚀 | Building modern web apps & UI design systems.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      location: 'San Francisco, CA',
      website: 'https://alexrivers.dev'
    },
    {
      username: 'sarah_connor',
      display_name: 'Sarah Connor',
      email: 'sarah@example.com',
      bio: 'UI/UX Designer & Creative Director 🎨. Crafting aesthetic digital experiences & human-centered design.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      cover_image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80',
      location: 'New York, NY',
      website: 'https://sarahdesign.co'
    },
    {
      username: 'tech_insider',
      display_name: 'Tech Insider',
      email: 'contact@techinsider.com',
      bio: 'Your daily news hub for artificial intelligence, web tech, coding trends, and gadgets ⚡',
      avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
      cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      location: 'Global',
      website: 'https://techinsider.io'
    },
    {
      username: 'elena_rostova',
      display_name: 'Elena Rostova',
      email: 'elena@example.com',
      bio: 'Photography & Travel addict 📷 ✈️. Capturing cinematic landscapes and city architecture.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      cover_image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&auto=format&fit=crop&q=80',
      location: 'Vienna, Austria',
      website: 'https://elenarostova.photo'
    },
    {
      username: 'david_code',
      display_name: 'David Chen',
      email: 'david@example.com',
      bio: 'Backend Specialist | Node.js, Go & SQLite 🛠️. Building scaleable REST APIs.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      cover_image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
      location: 'Seattle, WA',
      website: 'https://davidchen.dev'
    }
  ];

  users.forEach(u => {
    insertUser.run(u.username, u.display_name, u.email, u.bio, u.avatar, u.cover_image, u.location, u.website);
  });

  // Seed Follows
  const insertFollow = db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)');
  insertFollow.run(1, 2); // Alex follows Sarah
  insertFollow.run(1, 3); // Alex follows Tech Insider
  insertFollow.run(2, 1); // Sarah follows Alex
  insertFollow.run(3, 1); // Tech Insider follows Alex
  insertFollow.run(4, 1); // Elena follows Alex
  insertFollow.run(4, 2); // Elena follows Sarah
  insertFollow.run(5, 1); // David follows Alex

  // Seed Posts
  const insertPost = db.prepare('INSERT INTO posts (user_id, content, media_url, media_type, created_at) VALUES (?, ?, ?, ?, ?)');
  
  const posts = [
    {
      user_id: 1,
      content: 'Just launched our new social platform built with #NodeJS, #Express, and SQLite! 🚀 Excited to share this with everyone. Tagging @sarah_connor for the awesome UI recommendations! #WebDev #Coding',
      media_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
      media_type: 'image',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
    },
    {
      user_id: 2,
      content: 'Working on dark mode design tokens and glassmorphism elements today 🎨✨. What do you think about clean contrast borders? #UIUX #Design #ProductDesign',
      media_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
      media_type: 'image',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
    },
    {
      user_id: 4,
      content: 'Morning walk in the Alps 🌄. Nature is the best place to recharge before a coding session! #Photography #Nature #Travel #Vibes',
      media_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop&q=80',
      media_type: 'image',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
    },
    {
      user_id: 3,
      content: 'BREAKING: Modern JavaScript runtimes are seeing unprecedented performance gains with SQLite embedded databases! Are you using SQLite in production? #TechNews #JavaScript #Database',
      media_url: null,
      media_type: 'none',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
    },
    {
      user_id: 5,
      content: 'Video demo showing smooth media streaming and upload processing in Express. Check this out! 🎥 #WebDev #Backend #Tech',
      media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      media_type: 'video',
      created_at: new Date(Date.now() - 3600000 * 30).toISOString()
    }
  ];

  const insertTag = db.prepare('INSERT INTO post_tags (post_id, tag_name, tag_type) VALUES (?, ?, ?)');

  posts.forEach((p) => {
    const info = insertPost.run(p.user_id, p.content, p.media_url, p.media_type, p.created_at);
    const postId = info.lastInsertRowid;

    // Extract hashtags & mentions
    const hashtags = p.content.match(/#[a-zA-Z0-9_]+/g) || [];
    const mentions = p.content.match(/@[a-zA-Z0-9_]+/g) || [];

    hashtags.forEach(h => insertTag.run(postId, h.replace('#', '').toLowerCase(), 'hashtag'));
    mentions.forEach(m => insertTag.run(postId, m.replace('@', '').toLowerCase(), 'mention'));
  });

  // Seed Likes
  const insertLike = db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)');
  insertLike.run(2, 1);
  insertLike.run(3, 1);
  insertLike.run(4, 1);
  insertLike.run(5, 1);
  insertLike.run(1, 2);
  insertLike.run(3, 2);
  insertLike.run(1, 3);
  insertLike.run(2, 3);

  // Seed Comments
  const insertComment = db.prepare('INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)');
  insertComment.run(1, 2, 'Looks absolutely stunning Alex! 🔥 Love the responsive UI layout.', new Date(Date.now() - 3600000 * 1.5).toISOString());
  insertComment.run(1, 3, 'Great job on the SQLite setup, super lightweight and fast!', new Date(Date.now() - 3600000 * 1).toISOString());
  insertComment.run(2, 1, 'The glassmorphism card design is crisp! 👌', new Date(Date.now() - 3600000 * 4).toISOString());

  // Seed Notifications
  const insertNotif = db.prepare('INSERT INTO notifications (user_id, actor_id, type, post_id, is_read) VALUES (?, ?, ?, ?, ?)');
  insertNotif.run(1, 2, 'like', 1, 1);
  insertNotif.run(1, 3, 'like', 1, 1);
  insertNotif.run(1, 2, 'comment', 1, 0);
  insertNotif.run(1, 2, 'mention', 1, 0);
  insertNotif.run(1, 4, 'follow', null, 0);

  console.log('Seed completed successfully!');
}

module.exports = {
  db,
  initDb
};
