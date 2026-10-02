const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const { db, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database
initDb();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// Helper: Parse tags & mentions from text
function parseAndSaveTags(postId, content) {
  if (!content) return;
  const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
  const mentions = content.match(/@[a-zA-Z0-9_]+/g) || [];

  const deleteExisting = db.prepare('DELETE FROM post_tags WHERE post_id = ?');
  deleteExisting.run(postId);

  const insertTag = db.prepare('INSERT INTO post_tags (post_id, tag_name, tag_type) VALUES (?, ?, ?)');
  hashtags.forEach(h => {
    insertTag.run(postId, h.replace('#', '').toLowerCase(), 'hashtag');
  });

  const findUserByUsername = db.prepare('SELECT id FROM users WHERE LOWER(username) = ?');
  const insertNotif = db.prepare('INSERT INTO notifications (user_id, actor_id, type, post_id) VALUES (?, ?, ?, ?)');

  mentions.forEach(m => {
    const usernameClean = m.replace('@', '').toLowerCase();
    insertTag.run(postId, usernameClean, 'mention');

    // Notify mentioned user
    const user = findUserByUsername.get(usernameClean);
    if (user) {
      const actorId = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(postId)?.user_id;
      if (actorId && actorId !== user.id) {
        insertNotif.run(user.id, actorId, 'mention', postId);
      }
    }
  });
}

// -------------------------------------------------------------
// USER API ENDPOINTS
// -------------------------------------------------------------

// Get all users
app.get('/api/users', (req, res) => {
  try {
    const currentUserId = req.query.current_user_id || 1;
    const users = db.prepare(`
      SELECT u.*,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as posts_count,
        (SELECT COUNT(*) > 0 FROM follows WHERE follower_id = ? AND following_id = u.id) as is_following
      FROM users u
      ORDER BY u.id ASC
    `).all(currentUserId);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user profile by username or id
app.get('/api/users/:identifier', (req, res) => {
  try {
    const { identifier } = req.params;
    const currentUserId = req.query.current_user_id || 1;

    let user;
    if (!isNaN(identifier)) {
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(identifier);
    } else {
      user = db.prepare('SELECT * FROM users WHERE LOWER(username) = ?').get(identifier.toLowerCase());
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM follows WHERE follower_id = ?) as following_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = ?) as followers_count,
        (SELECT COUNT(*) FROM posts WHERE user_id = ?) as posts_count,
        (SELECT COUNT(*) > 0 FROM follows WHERE follower_id = ? AND following_id = ?) as is_following
    `).get(user.id, user.id, user.id, currentUserId, user.id);

    res.json({ ...user, ...stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
app.put('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { display_name, bio, location, website, avatar, cover_image } = req.body;

    const stmt = db.prepare(`
      UPDATE users 
      SET display_name = COALESCE(?, display_name),
          bio = COALESCE(?, bio),
          location = COALESCE(?, location),
          website = COALESCE(?, website),
          avatar = COALESCE(?, avatar),
          cover_image = COALESCE(?, cover_image)
      WHERE id = ?
    `);

    stmt.run(display_name, bio, location, website, avatar, cover_image, id);
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload user avatar / cover image
app.post('/api/users/:id/media', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover_image', maxCount: 1 }]), (req, res) => {
  try {
    const { id } = req.params;
    let avatarUrl = null;
    let coverUrl = null;

    if (req.files.avatar && req.files.avatar[0]) {
      avatarUrl = '/uploads/' + req.files.avatar[0].filename;
      db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatarUrl, id);
    }

    if (req.files.cover_image && req.files.cover_image[0]) {
      coverUrl = '/uploads/' + req.files.cover_image[0].filename;
      db.prepare('UPDATE users SET cover_image = ? WHERE id = ?').run(coverUrl, id);
    }

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    res.json({ message: 'Media uploaded successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// FOLLOW / UNFOLLOW API ENDPOINTS
// -------------------------------------------------------------

app.post('/api/users/:id/follow', (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const followerId = parseInt(req.body.current_user_id || 1);

    if (targetUserId === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const check = db.prepare('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?').get(followerId, targetUserId);

    if (!check) {
      db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(followerId, targetUserId);
      
      // Notification
      db.prepare('INSERT INTO notifications (user_id, actor_id, type) VALUES (?, ?, ?)').run(targetUserId, followerId, 'follow');
    }

    res.json({ success: true, is_following: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id/follow', (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const followerId = parseInt(req.body.current_user_id || req.query.current_user_id || 1);

    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(followerId, targetUserId);
    res.json({ success: true, is_following: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id/followers', (req, res) => {
  try {
    const { id } = req.params;
    const followers = db.prepare(`
      SELECT u.* FROM users u
      JOIN follows f ON u.id = f.follower_id
      WHERE f.following_id = ?
    `).all(id);
    res.json(followers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id/following', (req, res) => {
  try {
    const { id } = req.params;
    const following = db.prepare(`
      SELECT u.* FROM users u
      JOIN follows f ON u.id = f.following_id
      WHERE f.follower_id = ?
    `).all(id);
    res.json(following);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// POSTS API ENDPOINTS
// -------------------------------------------------------------

// Get feed posts (with filters: type='all'|'following'|'trending'|'tag'|'user'|'saved', tag, user_id, query)
app.get('/api/posts', (req, res) => {
  try {
    const currentUserId = req.query.current_user_id || 1;
    const feedType = req.query.type || 'all';
    const tag = req.query.tag ? req.query.tag.toLowerCase().replace('#', '').replace('@', '') : null;
    const userId = req.query.user_id;
    const search = req.query.search ? `%${req.query.search.toLowerCase()}%` : null;

    let query = `
      SELECT p.*, 
        u.username, u.display_name, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
        (SELECT COUNT(*) > 0 FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked,
        (SELECT COUNT(*) > 0 FROM bookmarks WHERE post_id = p.id AND user_id = ?) as is_bookmarked
      FROM posts p
      JOIN users u ON p.user_id = u.id
    `;

    const whereClauses = [];
    const params = [currentUserId, currentUserId];

    if (feedType === 'following') {
      whereClauses.push(`p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)`);
      params.push(currentUserId);
    } else if (feedType === 'saved') {
      whereClauses.push(`p.id IN (SELECT post_id FROM bookmarks WHERE user_id = ?)`);
      params.push(currentUserId);
    } else if (feedType === 'user' && userId) {
      whereClauses.push(`p.user_id = ?`);
      params.push(userId);
    } else if (feedType === 'liked' && userId) {
      whereClauses.push(`p.id IN (SELECT post_id FROM likes WHERE user_id = ?)`);
      params.push(userId);
    } else if (feedType === 'media' && userId) {
      whereClauses.push(`p.user_id = ? AND p.media_type != 'none'`);
      params.push(userId);
    }

    if (tag) {
      whereClauses.push(`p.id IN (SELECT post_id FROM post_tags WHERE tag_name = ?)`);
      params.push(tag);
    }

    if (search) {
      whereClauses.push(`(LOWER(p.content) LIKE ? OR LOWER(u.username) LIKE ? OR LOWER(u.display_name) LIKE ?)`);
      params.push(search, search, search);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    if (feedType === 'trending') {
      query += ` ORDER BY (likes_count + comments_count * 2) DESC, p.created_at DESC`;
    } else {
      query += ` ORDER BY p.created_at DESC`;
    }

    const posts = db.prepare(query).all(...params);

    // Fetch tags & tagged users for each post
    const getTagsStmt = db.prepare('SELECT tag_name, tag_type FROM post_tags WHERE post_id = ?');
    const postsWithTags = posts.map(post => {
      const tags = getTagsStmt.all(post.id);
      return {
        ...post,
        hashtags: tags.filter(t => t.tag_type === 'hashtag').map(t => t.tag_name),
        mentions: tags.filter(t => t.tag_type === 'mention').map(t => t.tag_name)
      };
    });

    res.json(postsWithTags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new post (supports multipart file upload or json body)
app.post('/api/posts', upload.single('media_file'), (req, res) => {
  try {
    const userId = req.body.user_id || 1;
    const content = req.body.content || '';
    let mediaUrl = req.body.media_url || null;
    let mediaType = req.body.media_type || 'none';

    if (req.file) {
      mediaUrl = '/uploads/' + req.file.filename;
      if (req.file.mimetype.startsWith('video/')) {
        mediaType = 'video';
      } else {
        mediaType = 'image';
      }
    }

    if (!content && !mediaUrl) {
      return res.status(400).json({ error: 'Post must contain text or media' });
    }

    const stmt = db.prepare(`
      INSERT INTO posts (user_id, content, media_url, media_type)
      VALUES (?, ?, ?, ?)
    `);

    const info = stmt.run(userId, content, mediaUrl, mediaType);
    const postId = info.lastInsertRowid;

    // Save extra tagged users if passed
    let fullContent = content;
    if (req.body.tagged_users) {
      const tagged = Array.isArray(req.body.tagged_users) 
        ? req.body.tagged_users 
        : req.body.tagged_users.split(',').map(t => t.trim());
      
      const tagMentions = tagged.map(t => t.startsWith('@') ? t : `@${t}`).join(' ');
      fullContent += ` ${tagMentions}`;
    }

    parseAndSaveTags(postId, fullContent);

    const newPost = db.prepare(`
      SELECT p.*, u.username, u.display_name, u.avatar,
        0 as likes_count, 0 as comments_count, 0 as is_liked, 0 as is_bookmarked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(postId);

    const tags = db.prepare('SELECT tag_name, tag_type FROM post_tags WHERE post_id = ?').all(postId);

    res.status(201).json({
      ...newPost,
      hashtags: tags.filter(t => t.tag_type === 'hashtag').map(t => t.tag_name),
      mentions: tags.filter(t => t.tag_type === 'mention').map(t => t.tag_name)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete post
app.delete('/api/posts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.user_id || req.query.user_id || 1;

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user_id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// LIKES, COMMENTS, BOOKMARKS API ENDPOINTS
// -------------------------------------------------------------

// Toggle Like
app.post('/api/posts/:id/like', (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.body.user_id || 1;

    const existing = db.prepare('SELECT * FROM likes WHERE user_id = ? AND post_id = ?').get(userId, postId);

    let isLiked = false;
    if (existing) {
      db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(userId, postId);
    } else {
      db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(userId, postId);
      isLiked = true;

      // Notification
      const postOwner = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(postId)?.user_id;
      if (postOwner && postOwner !== parseInt(userId)) {
        db.prepare('INSERT INTO notifications (user_id, actor_id, type, post_id) VALUES (?, ?, ?, ?)').run(postOwner, userId, 'like', postId);
      }
    }

    const likesCount = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId).count;

    res.json({ success: true, is_liked: isLiked, likes_count: likesCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments for a post
app.get('/api/posts/:id/comments', (req, res) => {
  try {
    const postId = req.params.id;
    const comments = db.prepare(`
      SELECT c.*, u.username, u.display_name, u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(postId);

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment
app.post('/api/posts/:id/comments', (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.body.user_id || 1;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const stmt = db.prepare('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)');
    const info = stmt.run(postId, userId, content.trim());
    const commentId = info.lastInsertRowid;

    // Notification
    const postOwner = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(postId)?.user_id;
    if (postOwner && postOwner !== parseInt(userId)) {
      db.prepare('INSERT INTO notifications (user_id, actor_id, type, post_id) VALUES (?, ?, ?, ?)').run(postOwner, userId, 'comment', postId);
    }

    const newComment = db.prepare(`
      SELECT c.*, u.username, u.display_name, u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(commentId);

    const commentsCount = db.prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ?').get(postId).count;

    res.status(201).json({ comment: newComment, comments_count: commentsCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Bookmark
app.post('/api/posts/:id/bookmark', (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.body.user_id || 1;

    const existing = db.prepare('SELECT * FROM bookmarks WHERE user_id = ? AND post_id = ?').get(userId, postId);

    let isBookmarked = false;
    if (existing) {
      db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?').run(userId, postId);
    } else {
      db.prepare('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)').run(userId, postId);
      isBookmarked = true;
    }

    res.json({ success: true, is_bookmarked: isBookmarked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// NOTIFICATIONS API ENDPOINTS
// -------------------------------------------------------------

app.get('/api/notifications', (req, res) => {
  try {
    const userId = req.query.current_user_id || 1;

    const notifs = db.prepare(`
      SELECT n.*, 
        u.username as actor_username, u.display_name as actor_name, u.avatar as actor_avatar,
        p.content as post_snippet
      FROM notifications n
      JOIN users u ON n.actor_id = u.id
      LEFT JOIN posts p ON n.post_id = p.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `).all(userId);

    const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(userId).count;

    res.json({ notifications: notifs, unread_count: unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/read-all', (req, res) => {
  try {
    const userId = req.body.current_user_id || 1;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// EXPLORE & TRENDING ENDPOINTS
// -------------------------------------------------------------

// Trending Hashtags
app.get('/api/trending/tags', (req, res) => {
  try {
    const tags = db.prepare(`
      SELECT tag_name, COUNT(*) as count
      FROM post_tags
      WHERE tag_type = 'hashtag'
      GROUP BY tag_name
      ORDER BY count DESC
      LIMIT 10
    `).all();

    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recommended Users to Follow
app.get('/api/users/recommended', (req, res) => {
  try {
    const currentUserId = req.query.current_user_id || 1;

    const recommended = db.prepare(`
      SELECT u.*,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count
      FROM users u
      WHERE u.id != ? AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = ?)
      ORDER BY followers_count DESC
      LIMIT 5
    `).all(currentUserId, currentUserId);

    res.json(recommended);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Social Media Platform running on http://localhost:${PORT}`);
  console.log(`=================================================`);
});
