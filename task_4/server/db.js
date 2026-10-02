const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'chat_data.json');

// Default Initial Structure
const defaultData = {
  users: [],
  rooms: [
    {
      id: 1,
      name: 'General',
      description: 'Welcome to General Chat! Say hello to everyone.',
      is_private: 0,
      created_by: 0,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Tech & Dev',
      description: 'Discuss programming, web development, frameworks & code.',
      is_private: 0,
      created_by: 0,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Random',
      description: 'Off-topic lounge for casual banter, memes, and fun.',
      is_private: 0,
      created_by: 0,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Design & UI',
      description: 'Share design inspiration, mockups, and UI/UX tips.',
      is_private: 0,
      created_by: 0,
      created_at: new Date().toISOString()
    }
  ],
  room_members: [],
  messages: []
};

// Load or Initialize Data
function loadData() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    // Ensure all top-level keys exist
    return {
      users: parsed.users || [],
      rooms: parsed.rooms || defaultData.rooms,
      room_members: parsed.room_members || [],
      messages: parsed.messages || []
    };
  } catch (err) {
    console.error('Error loading DB file, fallback to default:', err);
    return defaultData;
  }
}

let data = loadData();

function saveData() {
  try {
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

// Data Helper Methods
const db = {
  // Users
  createUser({ username, email, password, avatar }) {
    const newUser = {
      id: data.users.length ? Math.max(...data.users.map(u => u.id)) + 1 : 1,
      username,
      email,
      password,
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
      status: 'offline',
      created_at: new Date().toISOString()
    };
    data.users.push(newUser);
    saveData();
    return newUser;
  },

  findUserByEmail(email) {
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserByUsername(username) {
    return data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  findUserById(id) {
    return data.users.find(u => u.id === Number(id));
  },

  getAllUsers() {
    return data.users.map(({ password, ...user }) => user);
  },

  updateUserStatus(id, status) {
    const user = data.users.find(u => u.id === Number(id));
    if (user) {
      user.status = status;
      saveData();
    }
    return user;
  },

  // Rooms
  getRooms() {
    return data.rooms.map(room => {
      const memberCount = data.room_members.filter(rm => rm.room_id === room.id).length;
      return { ...room, memberCount };
    });
  },

  getRoomById(id) {
    const room = data.rooms.find(r => r.id === Number(id));
    if (!room) return null;
    const memberCount = data.room_members.filter(rm => rm.room_id === room.id).length;
    return { ...room, memberCount };
  },

  createRoom({ name, description, is_private = 0, created_by }) {
    const existing = data.rooms.find(r => r.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      throw new Error('Room name already exists');
    }
    const newRoom = {
      id: data.rooms.length ? Math.max(...data.rooms.map(r => r.id)) + 1 : 1,
      name,
      description: description || '',
      is_private: is_private ? 1 : 0,
      created_by: Number(created_by),
      created_at: new Date().toISOString()
    };
    data.rooms.push(newRoom);
    // Add creator as member automatically
    if (created_by) {
      data.room_members.push({
        room_id: newRoom.id,
        user_id: Number(created_by),
        joined_at: new Date().toISOString()
      });
    }
    saveData();
    return newRoom;
  },

  joinRoom(room_id, user_id) {
    const roomId = Number(room_id);
    const userId = Number(user_id);
    const exists = data.room_members.some(rm => rm.room_id === roomId && rm.user_id === userId);
    if (!exists) {
      data.room_members.push({
        room_id: roomId,
        user_id: userId,
        joined_at: new Date().toISOString()
      });
      saveData();
    }
    return true;
  },

  // Messages
  saveMessage({ sender_id, recipient_id = null, room_id = null, content = '', type = 'text', file_url = null, file_name = null, file_size = null }) {
    const sender = this.findUserById(sender_id);
    const newMessage = {
      id: data.messages.length ? Math.max(...data.messages.map(m => m.id)) + 1 : 1,
      sender_id: Number(sender_id),
      sender_username: sender ? sender.username : 'Unknown',
      sender_avatar: sender ? sender.avatar : '',
      recipient_id: recipient_id ? Number(recipient_id) : null,
      room_id: room_id ? Number(room_id) : null,
      content,
      type,
      file_url,
      file_name,
      file_size,
      is_read: 0,
      created_at: new Date().toISOString()
    };
    data.messages.push(newMessage);
    saveData();
    return newMessage;
  },

  getRoomMessages(room_id, limit = 100) {
    const roomId = Number(room_id);
    return data.messages
      .filter(m => m.room_id === roomId)
      .slice(-limit);
  },

  getDirectMessages(user1_id, user2_id, limit = 100) {
    const u1 = Number(user1_id);
    const u2 = Number(user2_id);
    return data.messages
      .filter(m => (m.sender_id === u1 && m.recipient_id === u2) || (m.sender_id === u2 && m.recipient_id === u1))
      .slice(-limit);
  },

  searchMessages(query, userId) {
    const q = query.toLowerCase();
    const uId = Number(userId);
    return data.messages.filter(m => {
      const isUserMsg = m.sender_id === uId || m.recipient_id === uId || m.room_id !== null;
      const matchText = m.content && m.content.toLowerCase().includes(q);
      const matchFile = m.file_name && m.file_name.toLowerCase().includes(q);
      return isUserMsg && (matchText || matchFile);
    });
  }
};

module.exports = db;
