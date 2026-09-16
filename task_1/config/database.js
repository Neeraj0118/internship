const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const isTest = process.env.NODE_ENV === 'test';
const dbPath = isTest ? ':memory:' : path.join(__dirname, '..', 'auth.db');

const db = new DatabaseSync(dbPath);

// Create users table if not existing
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
