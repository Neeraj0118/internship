const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Wrap db run/all/get into Promise helpers for clean async/await usage
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const initDb = async () => {
  try {
    // 1. Users Table (for Admin Auth)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Employees Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        department TEXT NOT NULL,
        designation TEXT NOT NULL,
        joining_date TEXT NOT NULL,
        salary REAL NOT NULL,
        status TEXT DEFAULT 'Active',
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default admin if none exists
    const adminExists = await dbGet(`SELECT * FROM users WHERE email = ?`, ['admin@company.com']);
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await dbRun(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        ['System Administrator', 'admin@company.com', hashedPassword, 'admin']
      );
      console.log('✅ Pre-seeded admin user created: admin@company.com / admin123');
    }

    // Seed sample employee records if table is empty
    const employeeCount = await dbGet(`SELECT COUNT(*) as count FROM employees`);
    if (employeeCount.count === 0) {
      const sampleEmployees = [
        ['Sarah', 'Connor', 'sarah.connor@company.com', '+1 555-0192', 'Engineering', 'Senior Software Engineer', '2022-03-15', 95000, 'Active', '104 Tech Boulevard, San Francisco, CA'],
        ['Michael', 'Scott', 'michael.scott@company.com', '+1 555-0144', 'Management', 'Regional Manager', '2020-01-10', 85000, 'Active', '1725 Slough Avenue, Scranton, PA'],
        ['Dwight', 'Schrute', 'dwight.schrute@company.com', '+1 555-0177', 'Sales', 'Assistant to Regional Manager', '2020-02-01', 72000, 'Active', 'Schrute Farms, Scranton, PA'],
        ['Pam', 'Beesly', 'pam.beesly@company.com', '+1 555-0123', 'Human Resources', 'HR Specialist', '2021-06-20', 62000, 'Active', '42 Elm Street, Scranton, PA'],
        ['Jim', 'Halpert', 'jim.halpert@company.com', '+1 555-0188', 'Sales', 'Lead Sales Representative', '2020-03-12', 78000, 'Active', '88 Maple Lane, Scranton, PA'],
        ['Alex', 'Morgan', 'alex.morgan@company.com', '+1 555-0155', 'Marketing', 'Marketing Director', '2023-08-01', 91000, 'On Leave', '742 Evergreen Terrace, Austin, TX'],
        ['David', 'Wallace', 'david.wallace@company.com', '+1 555-0111', 'Executive', 'Chief Financial Officer', '2019-11-05', 150000, 'Active', '12 Wall Street, New York, NY']
      ];

      for (const emp of sampleEmployees) {
        await dbRun(
          `INSERT INTO employees (first_name, last_name, email, phone, department, designation, joining_date, salary, status, address)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          emp
        );
      }
      console.log('✅ Pre-seeded sample employees created.');
    }
  } catch (err) {
    console.error('Error initializing database tables:', err.message);
  }
};

initDb();

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet
};
