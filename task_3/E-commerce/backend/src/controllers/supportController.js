const db = require('../config/db');

// POST /api/support (Customer support ticket / assistant message)
exports.createSupportTicket = (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }

    const ticketId = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;

    // Automated smart assistant response based on message keywords
    let autoReply = "Thank you for reaching out to MetroMart Support! Our local store team has received your ticket and will follow up within 2 hours.";
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('hours') || lowerMsg.includes('open') || lowerMsg.includes('timing')) {
      autoReply = "MetroMart local store hours: Monday to Saturday: 8:00 AM - 9:00 PM, Sunday: 9:00 AM - 6:00 PM.";
    } else if (lowerMsg.includes('delivery') || lowerMsg.includes('shipping') || lowerMsg.includes('free')) {
      autoReply = "We offer same-day local delivery for orders placed before 3:00 PM! Free delivery on orders over $35 or using coupon FREESHIP.";
    } else if (lowerMsg.includes('return') || lowerMsg.includes('refund')) {
      autoReply = "We have a 100% Satisfaction Guarantee! Fresh produce and groceries can be returned within 48 hours for an instant store credit or full refund.";
    } else if (lowerMsg.includes('track') || lowerMsg.includes('order')) {
      autoReply = "You can track any order live using your Order Tracking ID on our Track Order page!";
    }

    const stmt = db.prepare(`
      INSERT INTO support_tickets (ticket_id, name, email, subject, message, reply)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(ticketId, name, email, subject || 'General Inquiry', message, autoReply);

    const ticket = db.prepare('SELECT * FROM support_tickets WHERE ticket_id = ?').get(ticketId);

    res.status(201).json({
      success: true,
      message: 'Support request received',
      ticket_id: ticketId,
      reply: autoReply,
      ticket
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to process support query' });
  }
};

// GET /api/support (Admin list tickets)
exports.getSupportTickets = (req, res) => {
  try {
    const tickets = db.prepare('SELECT * FROM support_tickets ORDER BY created_at DESC').all();
    res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch support tickets' });
  }
};
