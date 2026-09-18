const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(user_id,isAdmin) {
  const payload = {
    userId: user_id,
    isAdmin: isAdmin
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
}

module.exports = jwtGenerator;
