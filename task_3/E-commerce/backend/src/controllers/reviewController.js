const db = require('../config/db');

// POST /api/reviews
exports.addReview = (req, res) => {
  try {
    const { product_id, user_name, rating, comment } = req.body;

    if (!product_id || !user_name || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'All review fields are required' });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const stmt = db.prepare(`
      INSERT INTO reviews (product_id, user_name, rating, comment)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(product_id, user_name, parseInt(rating), comment);

    // Recalculate average rating for product
    const stats = db.prepare(`
      SELECT AVG(rating) AS avg_rating, COUNT(*) AS count
      FROM reviews
      WHERE product_id = ?
    `).get(product_id);

    const newRating = parseFloat((stats.avg_rating || rating).toFixed(1));
    const newCount = stats.count;

    db.prepare('UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?')
      .run(newRating, newCount, product_id);

    const reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC').all(product_id);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      rating: newRating,
      reviews_count: newCount,
      reviews
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
};
