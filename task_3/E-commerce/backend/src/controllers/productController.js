const db = require('../config/db');

// GET /api/products (supports category filter, search, price range, stock filter, sorting)
exports.getProducts = (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, inStock, sort } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      query += ' AND price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }

    if (inStock === 'true') {
      query += ' AND stock > 0';
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY price DESC';
        break;
      case 'rating_desc':
        query += ' ORDER BY rating DESC';
        break;
      case 'newest':
        query += ' ORDER BY created_at DESC';
        break;
      default:
        query += ' ORDER BY is_featured DESC, id ASC';
    }

    const products = db.prepare(query).all(...params);

    // Fetch unique categories for filter options
    const categoriesRows = db.prepare('SELECT DISTINCT category FROM products').all();
    const categories = ['All', ...categoriesRows.map(c => c.category)];

    res.json({ success: true, count: products.length, categories, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// GET /api/products/:id
exports.getProductById = (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC').all(req.params.id);

    res.json({ success: true, product: { ...product, reviews } });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product details' });
  }
};

// POST /api/products (Admin)
exports.createProduct = (req, res) => {
  try {
    const { name, category, price, original_price, stock, unit, description, image_url, badge } = req.body;

    if (!name || !category || !price || !description) {
      return res.status(400).json({ success: false, message: 'Missing required product fields' });
    }

    const stmt = db.prepare(`
      INSERT INTO products (name, category, price, original_price, stock, unit, description, image_url, badge)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      category,
      parseFloat(price),
      original_price ? parseFloat(original_price) : null,
      stock ? parseInt(stock) : 10,
      unit || 'item',
      description,
      image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      badge || null
    );

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

// PUT /api/products/:id (Admin update price/stock)
exports.updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const { price, stock, badge } = req.body;

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updatedPrice = price !== undefined ? parseFloat(price) : existing.price;
    const updatedStock = stock !== undefined ? parseInt(stock) : existing.stock;
    const updatedBadge = badge !== undefined ? badge : existing.badge;

    db.prepare('UPDATE products SET price = ?, stock = ?, badge = ? WHERE id = ?')
      .run(updatedPrice, updatedStock, updatedBadge, id);

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json({ success: true, message: 'Product updated successfully', product: updated });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};
