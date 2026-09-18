const express = require('express');
const router = express.Router();
const pool = require('../db');
//mavis added currentevents and total events hosted
router.get('/counts', async (req, res) => {
  try {
    const postsResult = await pool.query('SELECT COUNT(*) FROM posts');
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    const currentEventsResult = await pool.query('SELECT COUNT(*) FROM events');
    const totalHostedEventsResult = await pool.query('SELECT last_value FROM events_id_seq');

    res.json({
      posts: parseInt(postsResult.rows[0].count, 10),
      users: parseInt(usersResult.rows[0].count, 10),
      currentEvents: parseInt(currentEventsResult.rows[0].count, 10),
      totalEventsHosted: parseInt(totalHostedEventsResult.rows[0].last_value || 0, 10),
    });

  } catch (err) {
    console.error('Error fetching counts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
