const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');

// Start backend server in test mode
let serverProcess;
const PORT = 5001;

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

test('API Health Check', async () => {
  const res = await makeRequest('/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'OK');
});

test('GET /api/products returns products list', async () => {
  const res = await makeRequest('/api/products');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.products));
  assert.ok(res.body.products.length > 0);
});

test('GET /api/products with Category Filter', async () => {
  const res = await makeRequest('/api/products?category=Bakery');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.products.every(p => p.category === 'Bakery'));
});

test('POST /api/orders places a new order and returns tracking ID', async () => {
  const orderData = {
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    phone: '+1 (555) 999-0000',
    address: '123 Test Street',
    city: 'Test City',
    postal_code: '12345',
    payment_method: 'Credit Card',
    items: [{ id: 1, qty: 1 }]
  };

  const res = await makeRequest('/api/orders', 'POST', orderData);
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.tracking_id.startsWith('ORD-'));
});

test('GET /api/orders/:tracking_id tracks order status', async () => {
  const res = await makeRequest('/api/orders/ORD-98421');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.order.tracking_id, 'ORD-98421');
});
