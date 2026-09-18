const router = require("express").Router();
const pool = require("../db");

// GET /:userId - Get user data by userId
// GET /:userId - Get user data by userId
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userQuery = await pool.query(
      `SELECT id as user_id, username, email, items_donated, items_received, is_admin FROM users WHERE id = $1`,
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userQuery.rows[0];

    res.json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      items_donated: user.items_donated || 0,
      items_received: user.items_received || 0,
      is_admin: user.is_admin || false,
    });

  } catch (err) {
    console.error("Error fetching user:", err.message);
    res.status(500).send("Server error");
  }
});



// POST /api/users/check-phone
router.post('/check-phone', async (req, res) => {
  const { phone } = req.body;

  // Normalize to Jordanian format
  const normalized = phone.startsWith('07') ? '+962' + phone.slice(1) : phone;

  // 📌 Step 1: Check for exclusion
  const exclusionList = ['+962780963097', '0780963097', '0798649308', '+962798649308']; // <- your dev/test number(s)
if (exclusionList.includes(normalized)) {
  console.log(`Bypassed phone duplicate check for: ${normalized}`);
  return res.json({ success: true, bypassed: true });
}


  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE phone_number = $1',
      [normalized]
    );

    if (user.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Phone number already registered' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});


module.exports = router;
