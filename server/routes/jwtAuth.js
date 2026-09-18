const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const authorize = require("../middleware/authorize");
const jwtGenerator = require("../utils/jwtGenerator"); // ✅ IMPORT it
require('dotenv').config();

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(401).json("Invalid Credentials");
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json("Invalid Credentials");
    }

    const jwtToken = jwtGenerator(user.rows[0].id, user.rows[0].is_admin);

    res.json({ jwtToken });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// Verify route
router.post("/verify", authorize, (req, res) => {
  console.log("Received a /verify request!");
  try {
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
