const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorize = require('../middleware/authorize');

// Send a message
router.post('/', authorize, async (req, res) => {
  const { receiver_id, content } = req.body;
  const sender_id = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content, is_read, updated_at, status)
       VALUES ($1, $2, $3, FALSE, NOW(), 'sent')
       RETURNING *`,
      [sender_id, receiver_id, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark messages as read (batch)
router.patch('/:userId/read', authorize, async (req, res) => {
  const receiver_id = req.user.id;
  const sender_id = req.params.userId;

  try {
    const result = await pool.query(
      `UPDATE messages
       SET is_read = TRUE,
           status = 'read'
       WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
       RETURNING id`,
      [sender_id, receiver_id]
    );

    const readIds = result.rows.map(row => row.id);
    res.json({ success: true, readMessageIds: readIds });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get chat contacts
router.get('/contacts', authorize, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT 
        u.id, 
        u.username,
        m2.content AS last_message,
        m2.updated_at AS last_timestamp,
        m2.sender_id AS last_sender_id,
        m2.status AS last_status,
        COALESCE(unread.count, 0) AS unread_count
      FROM (
        SELECT DISTINCT
          CASE
            WHEN sender_id = $1 THEN receiver_id
            ELSE sender_id
          END AS contact_id
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
      ) contacts
      JOIN users u ON u.id = contacts.contact_id
      LEFT JOIN LATERAL (
        SELECT content, updated_at, sender_id, status
        FROM messages
        WHERE (sender_id = u.id AND receiver_id = $1)
           OR (sender_id = $1 AND receiver_id = u.id)
        ORDER BY updated_at DESC
        LIMIT 1
      ) m2 ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS count
        FROM messages
        WHERE sender_id = u.id AND receiver_id = $1 AND is_read = FALSE
      ) unread ON true
      ORDER BY m2.updated_at DESC NULLS LAST
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET chat messages with pagination
router.get('/:userId', authorize, async (req, res) => {
  const sender_id = req.user.id;
  const receiver_id = req.params.userId;
  const { before } = req.query;
  const limit = 20;

  try {
    const values = [sender_id, receiver_id, receiver_id, sender_id];
    let query = `
      SELECT *
      FROM messages
      WHERE ((sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $3 AND receiver_id = $4))
    `;

    if (before) {
      values.push(before);
      query += ` AND timestamp < $5`;
    }

    query += ` ORDER BY timestamp DESC LIMIT ${limit}`;

    const result = await pool.query(query, values);
    res.json(result.rows.reverse());
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Server error' });
  }
});




// Mark a single message as delivered
router.patch('/:messageId/delivered', authorize, async (req, res) => {
  const { messageId } = req.params;

  try {
    await pool.query(
      `UPDATE messages
       SET status = 'delivered'
       WHERE id = $1 AND status = 'sent'`,
      [messageId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking message as delivered:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Get total unread messages for current user
router.get('/unread/count', authorize, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT COUNT(DISTINCT sender_id) AS chat_count
       FROM messages
       WHERE receiver_id = $1 AND is_read = FALSE`,
      [userId]
    );

    res.json({ unreadCount: parseInt(result.rows[0].chat_count) });
  } catch (err) {
    console.error('Error getting unread chat count:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
