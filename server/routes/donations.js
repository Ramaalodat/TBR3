const express = require("express");
const router = express.Router();
const pool = require("../db");
const authorize = require("../middleware/authorize");

router.post("/claims", authorize, async (req, res) => {
  const { post_id, message } = req.body;
  const receiver_id = req.user.id;

  try {
    // Check post exists and is available
    const post = await pool.query(
      "SELECT user_id, availability FROM posts WHERE post_id = $1",
      [post_id]
    );
    if (post.rows.length === 0 || post.rows[0].availability !== 'available') {
      return res.status(400).json({ message: "Post not available" });
    }

    // Check if a pending claim already exists
    const existing = await pool.query(
      "SELECT * FROM donation_claims WHERE post_id = $1 AND receiver_id = $2 AND status = 'pending'",
      [post_id, receiver_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Claim already exists" });
    }
    // Count how many active (pending) claims the user has
const claimCount = await pool.query(
  `SELECT COUNT(*) FROM donation_claims 
   WHERE receiver_id = $1 AND status = 'pending'`,
  [receiver_id]
);

if (parseInt(claimCount.rows[0].count) >= 2) {
  return res.status(400).json({ message: "You already have 2 pending claims." });
}

    // Insert claim
    await pool.query(
      `INSERT INTO donation_claims (post_id, receiver_id, message)
       VALUES ($1, $2, $3)`,
      [post_id, receiver_id, message || null]
    );

    res.json({ message: "Claim submitted" });
  } catch (err) {
    console.error("Error creating claim:", err.message);
    res.status(500).send("Server error");
  }
});
router.get("/claims/:donatorId", authorize, async (req, res) => {
  const { donatorId } = req.params;
  const userId = req.user.id;

  // Only allow donator to fetch their own claims
  if (String(donatorId) !== String(userId)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const result = await pool.query(`
SELECT dc.id, dc.status, dc.created_at, dc.message,
       p.title, p.post_id,
       u.username as receiver_username,
       u.id as receiver_id
FROM donation_claims dc
JOIN posts p ON dc.post_id = p.post_id
JOIN users u ON dc.receiver_id = u.id
WHERE p.user_id = $1 AND dc.status = 'pending'
ORDER BY dc.created_at DESC

    `, [donatorId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching claims:", err.message);
    res.status(500).send("Server error");
  }
});
router.put("/claims/:id/confirm", authorize, async (req, res) => {
  const { id } = req.params;

  try {
    // Get claim and post
    const result = await pool.query(`
      SELECT dc.post_id, dc.receiver_id, p.user_id
      FROM donation_claims dc
      JOIN posts p ON dc.post_id = p.post_id
      WHERE dc.id = $1 AND dc.status = 'pending'
    `, [id]);

    if (result.rows.length === 0) return res.status(404).json({ message: "Claim not found" });

    const { post_id, receiver_id, user_id: donator_id } = result.rows[0];

    if (req.user.id !== donator_id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update claim + stats + post
    await pool.query("BEGIN");
    await pool.query("UPDATE donation_claims SET status = 'confirmed' WHERE id = $1", [id]);
    await pool.query("UPDATE users SET items_donated = items_donated + 1 WHERE id = $1", [donator_id]);
    await pool.query("UPDATE users SET items_received = items_received + 1 WHERE id = $1", [receiver_id]);
    await pool.query("UPDATE posts SET availability = 'donated' WHERE post_id = $1", [post_id]);
    await pool.query("COMMIT");

    res.json({ message: "Claim confirmed" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error confirming claim:", err.message);
    res.status(500).send("Server error");
  }
});
router.put("/claims/:id/decline", authorize, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT dc.post_id, p.user_id
      FROM donation_claims dc
      JOIN posts p ON dc.post_id = p.post_id
      WHERE dc.id = $1 AND dc.status = 'pending'
    `, [id]);

    if (result.rows.length === 0) return res.status(404).json({ message: "Claim not found" });

    const { user_id: donator_id } = result.rows[0];

    if (req.user.id !== donator_id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await pool.query("UPDATE donation_claims SET status = 'declined' WHERE id = $1", [id]);

    res.json({ message: "Claim declined" });
  } catch (err) {
    console.error("Error declining claim:", err.message);
    res.status(500).send("Server error");
  }
});
router.get("/claims/count/:donatorId", authorize, async (req, res) => {
  const { donatorId } = req.params;

  if (String(donatorId) !== String(req.user.id)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const result = await pool.query(`
      SELECT COUNT(*) FROM donation_claims dc
      JOIN posts p ON dc.post_id = p.post_id
      WHERE p.user_id = $1 AND dc.status = 'pending'
    `, [donatorId]);

    res.json({ pendingClaims: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error("Error counting claims:", err.message);
    res.status(500).send("Server error");
  }
});
module.exports = router;
