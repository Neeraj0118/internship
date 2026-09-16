process.env.NODE_ENV = 'test';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

const app = require('../server');

let server;
let baseUrl = '';
let userToken = '';
let adminToken = '';

// Helper to make HTTP JSON requests against test server
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    if (!baseUrl) {
      return reject(new Error('Server base URL is not set yet.'));
    }

    const url = new URL(path, baseUrl);
    const options = {
      method: method.toUpperCase(),
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

describe('Task-01 Authentication & RBAC Test Suite', () => {
  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  test('GET /api/health - Server health check endpoint', async () => {
    const res = await request('GET', '/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'OK');
  });

  describe('1. User Registration Functionality', () => {
    test('POST /api/auth/register - Successfully register standard user', async () => {
      const payload = {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'user'
      };

      const res = await request('POST', '/api/auth/register', payload);
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.token);
      assert.equal(res.body.user.role, 'user');
      userToken = res.body.token;
    });

    test('POST /api/auth/register - Reject registration with duplicate email', async () => {
      const payload = {
        username: 'john_clone',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'user'
      };

      const res = await request('POST', '/api/auth/register', payload);
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /already exists/i);
    });

    test('POST /api/auth/register - Successfully register admin user', async () => {
      const payload = {
        username: 'admin_boss',
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        role: 'admin'
      };

      const res = await request('POST', '/api/auth/register', payload);
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.token);
      assert.equal(res.body.user.role, 'admin');
      adminToken = res.body.token;
    });
  });

  describe('2. User Login & Password Hashing Verification', () => {
    test('POST /api/auth/login - Fail login with invalid password', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: 'john@example.com',
        password: 'WrongPassword'
      });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    test('POST /api/auth/login - Successful login returns valid JWT token', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: 'john@example.com',
        password: 'Password123!'
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.token);
      assert.equal(res.body.user.username, 'john_doe');
    });
  });

  describe('3. Protected Route Authentication', () => {
    test('GET /api/user/dashboard - Reject unauthenticated access (No Token)', async () => {
      const res = await request('GET', '/api/user/dashboard');
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    test('GET /api/user/dashboard - Allow access with valid User token', async () => {
      const res = await request('GET', '/api/user/dashboard', null, userToken);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.match(res.body.message, /john_doe/i);
    });
  });

  describe('4. Role-Based Access Control (RBAC)', () => {
    test('GET /api/admin/users - Reject standard USER access (403 Forbidden)', async () => {
      const res = await request('GET', '/api/admin/users', null, userToken);
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /lacks sufficient privileges/i);
    });

    test('GET /api/admin/users - Grant ADMIN access to user list', async () => {
      const res = await request('GET', '/api/admin/users', null, adminToken);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.users));
      assert.equal(res.body.count, 2);
    });
  });
});
