const db = require('../config/db');

// Helper to generate readable tracking ID
function generateTrackingId() {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${randomNum}`;
}

// POST /api/orders (Checkout)
exports.createOrder = (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      phone,
      address,
      city,
      postal_code,
      payment_method,
      items,
      coupon_code
    } = req.body;

    if (!customer_name || !customer_email || !phone || !address || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Invalid order details provided' });
    }

    // Calculate subtotal from database prices to prevent client tampering
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.id);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ID ${item.id} not found` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.qty;
      subtotal += itemTotal;
      validatedItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image_url: product.image_url,
        qty: item.qty
      });
    }

    // Apply Coupon logic
    let discount = 0;
    if (coupon_code && coupon_code.toUpperCase() === 'LOCAL10') {
      discount = parseFloat((subtotal * 0.10).toFixed(2));
    } else if (coupon_code && coupon_code.toUpperCase() === 'FREESHIP') {
      discount = 0; // Handled in delivery fee
    }

    const tax = parseFloat(((subtotal - discount) * 0.05).toFixed(2)); // 5% local tax
    const delivery_fee = (subtotal >= 35 || coupon_code?.toUpperCase() === 'FREESHIP') ? 0 : 4.99;
    const total = parseFloat((subtotal - discount + tax + delivery_fee).toFixed(2));

    const trackingId = generateTrackingId();
    const estimatedDelivery = 'Tomorrow by 4:00 PM';

    // Transaction to insert order & decrement product stock
    const createTransaction = db.transaction(() => {
      const stmt = db.prepare(`
        INSERT INTO orders (
          tracking_id, customer_name, customer_email, phone, address, city, postal_code,
          payment_method, items_json, subtotal, discount, tax, delivery_fee, total,
          status, estimated_delivery
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Processing', ?)
      `);

      stmt.run(
        trackingId, customer_name, customer_email, phone, address, city || 'Local Area',
        postal_code || '00000', payment_method || 'Credit Card',
        JSON.stringify(validatedItems), subtotal, discount, tax, delivery_fee, total,
        estimatedDelivery
      );

      // Decrement stock
      const decrementStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
      for (const item of validatedItems) {
        decrementStock.run(item.qty, item.id);
      }
    });

    createTransaction();

    const createdOrder = db.prepare('SELECT * FROM orders WHERE tracking_id = ?').get(trackingId);
    createdOrder.items = JSON.parse(createdOrder.items_json);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      tracking_id: trackingId,
      order: createdOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to process order' });
  }
};

// GET /api/orders/:id (Lookup order status)
exports.getOrderStatus = (req, res) => {
  try {
    const { id } = req.params;
    const order = db.prepare('SELECT * FROM orders WHERE tracking_id = ? OR id = ?').get(id, id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found with provided tracking ID' });
    }

    order.items = JSON.parse(order.items_json);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve order status' });
  }
};

// GET /api/orders (Admin list)
exports.getAllOrders = (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    orders.forEach(o => {
      o.items = JSON.parse(o.items_json);
    });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// PUT /api/orders/:id/status (Admin update status)
exports.updateOrderStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Processing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const result = db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR tracking_id = ?')
      .run(status, id, id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ? OR tracking_id = ?').get(id, id);
    updatedOrder.items = JSON.parse(updatedOrder.items_json);

    res.json({ success: true, message: `Order status updated to ${status}`, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};
