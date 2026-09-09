const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../store.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

function initDB() {
  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      rating REAL DEFAULT 4.5,
      reviews_count INTEGER DEFAULT 0,
      stock INTEGER DEFAULT 20,
      unit TEXT DEFAULT 'item',
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      badge TEXT,
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_id TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      tax REAL NOT NULL,
      delivery_fee REAL DEFAULT 0,
      total REAL NOT NULL,
      status TEXT DEFAULT 'Processing',
      estimated_delivery TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Support Tickets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'Open',
      reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed Initial Products if empty
  const count = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
  if (count === 0) {
    console.log('Seeding initial product inventory...');

    const insertProduct = db.prepare(`
      INSERT INTO products (name, category, price, original_price, rating, reviews_count, stock, unit, description, image_url, badge, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedProducts = [
      {
        name: 'Organic Farm Fresh Milk',
        category: 'Dairy & Eggs',
        price: 3.49,
        original_price: 4.29,
        rating: 4.8,
        reviews_count: 34,
        stock: 45,
        unit: '1 Gallon',
        description: 'Pure, pasteurized whole milk sourced directly from local heritage farms with no added hormones.',
        image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80',
        badge: 'Best Seller',
        is_featured: 1
      },
      {
        name: 'Artisanal Sourdough Bread',
        category: 'Bakery',
        price: 5.99,
        original_price: 6.99,
        rating: 4.9,
        reviews_count: 52,
        stock: 18,
        unit: '1 Loaf',
        description: 'Freshly baked sourdough loaf crafted with natural wild yeast culture, crispy crust, and soft interior.',
        image_url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600&auto=format&fit=crop&q=80',
        badge: 'Fresh Daily',
        is_featured: 1
      },
      {
        name: 'Fresh Honeycrisp Apples',
        category: 'Fruits & Veggies',
        price: 2.99,
        original_price: 3.49,
        rating: 4.7,
        reviews_count: 28,
        stock: 80,
        unit: 'per lb',
        description: 'Sweet, extra crunchy local orchard apples packed with juice and natural flavor.',
        image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
        badge: 'Local Farm',
        is_featured: 1
      },
      {
        name: 'Organic Free-Range Eggs',
        category: 'Dairy & Eggs',
        price: 4.79,
        original_price: 5.49,
        rating: 4.9,
        reviews_count: 41,
        stock: 30,
        unit: 'Dozen (12 pcs)',
        description: 'Large brown eggs from cage-free hens raised on certified organic pastures.',
        image_url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&auto=format&fit=crop&q=80',
        badge: 'Organic',
        is_featured: 0
      },
      {
        name: 'Cold Pressed Raw Honey',
        category: 'Pantry',
        price: 9.99,
        original_price: 11.99,
        rating: 5.0,
        reviews_count: 67,
        stock: 22,
        unit: '16 oz Jar',
        description: '100% pure unfiltered raw wildflower honey harvested by local beekeepers in the valley.',
        image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
        badge: 'Artisanal',
        is_featured: 1
      },
      {
        name: 'Handcrafted Cheddar Cheese',
        category: 'Dairy & Eggs',
        price: 6.49,
        original_price: 7.99,
        rating: 4.6,
        reviews_count: 19,
        stock: 15,
        unit: '8 oz Block',
        description: 'Aged 12 months for a sharp, rich flavor profile. Made in small batches.',
        image_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&auto=format&fit=crop&q=80',
        badge: 'Aged 12Mo',
        is_featured: 0
      },
      {
        name: 'Fresh Italian Basil Bunch',
        category: 'Fruits & Veggies',
        price: 1.99,
        original_price: 2.49,
        rating: 4.5,
        reviews_count: 14,
        stock: 40,
        unit: '1 Bunch',
        description: 'Aromatic green sweet basil leaves picked daily for pesto, pasta, and salads.',
        image_url: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&auto=format&fit=crop&q=80',
        badge: 'Fresh',
        is_featured: 0
      },
      {
        name: 'Roasted Ethiopian Coffee Beans',
        category: 'Beverages',
        price: 12.99,
        original_price: 14.99,
        rating: 4.9,
        reviews_count: 88,
        stock: 25,
        unit: '12 oz Bag',
        description: 'Single-origin Arabica beans roasted locally with floral notes, jasmine aroma, and smooth body.',
        image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80',
        badge: 'Fresh Roast',
        is_featured: 1
      },
      {
        name: 'Handmade Almond Butter',
        category: 'Pantry',
        price: 8.49,
        original_price: 9.99,
        rating: 4.7,
        reviews_count: 23,
        stock: 12,
        unit: '12 oz Jar',
        description: 'Dry roasted almonds lightly salted with pink Himalayan salt. No palm oil or added sugar.',
        image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
        badge: 'Zero Sugar',
        is_featured: 0
      },
      {
        name: 'Sparkling Citrus Botanical Soda',
        category: 'Beverages',
        price: 2.49,
        original_price: 2.99,
        rating: 4.4,
        reviews_count: 16,
        stock: 60,
        unit: '12 oz Can',
        description: 'Refreshing craft sparkling beverage infused with real blood orange, grapefruit, and botanical herbs.',
        image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
        badge: 'Craft Beverage',
        is_featured: 0
      },
      {
        name: 'Organic Avocados',
        category: 'Fruits & Veggies',
        price: 4.49,
        original_price: 5.49,
        rating: 4.8,
        reviews_count: 45,
        stock: 35,
        unit: 'Bag of 4',
        description: 'Ripe and creamy Hass avocados, rich in healthy omega fats and fiber.',
        image_url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80',
        badge: 'Organic',
        is_featured: 1
      },
      {
        name: 'Dark Chocolate Sea Salt Slab',
        category: 'Snacks',
        price: 4.99,
        original_price: 5.99,
        rating: 4.9,
        reviews_count: 59,
        stock: 20,
        unit: '3.5 oz Bar',
        description: '72% Fair-trade Dominican dark chocolate sprinkled with hand-harvested sea salt flakes.',
        image_url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80',
        badge: 'Fair Trade',
        is_featured: 0
      }
    ];

    const insertMany = db.transaction((products) => {
      for (const p of products) {
        insertProduct.run(
          p.name, p.category, p.price, p.original_price, p.rating,
          p.reviews_count, p.stock, p.unit, p.description, p.image_url,
          p.badge, p.is_featured
        );
      }
    });

    insertMany(seedProducts);

    // Seed initial reviews for Product 1 & Product 2
    const insertReview = db.prepare(`
      INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertReview.run(1, 'Sarah Jenkins', 5, 'The freshest milk I have tasted in years! Reminds me of farm visits as a child.', '2026-09-01 10:30:00');
    insertReview.run(1, 'Marcus Vance', 4, 'Great quality milk, nice cream top. Will definitely reorder.', '2026-09-03 14:15:00');
    insertReview.run(2, 'Elena Rostova', 5, 'Incredible crust and aroma! Sourdough at its finest.', '2026-09-02 09:00:00');
    insertReview.run(5, 'David Kim', 5, 'Raw honey flavor is rich and complex. Perfect for morning tea.', '2026-09-04 16:45:00');

    // Seed a sample order for instant order tracking demonstration
    const insertOrder = db.prepare(`
      INSERT INTO orders (tracking_id, customer_name, customer_email, phone, address, city, postal_code, payment_method, items_json, subtotal, discount, tax, delivery_fee, total, status, estimated_delivery, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleItems = JSON.stringify([
      { id: 1, name: 'Organic Farm Fresh Milk', price: 3.49, qty: 2 },
      { id: 2, name: 'Artisanal Sourdough Bread', price: 5.99, qty: 1 }
    ]);

    insertOrder.run(
      'ORD-98421',
      'Jane Doe',
      'jane.doe@example.com',
      '+1 (555) 234-5678',
      '742 Evergreen Terrace',
      'Springfield',
      '97477',
      'Credit Card',
      sampleItems,
      12.97,
      1.30,
      0.58,
      0.00,
      12.25,
      'Out for Delivery',
      'Today by 5:00 PM',
      '2026-09-08 09:15:00'
    );

    console.log('Seeding completed successfully!');
  }
}

initDB();

module.exports = db;
