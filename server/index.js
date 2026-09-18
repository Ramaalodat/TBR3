require('dotenv').config();
console.log("JWT Secret loaded:", process.env.JWT_SECRET);
const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
  origin: ['https://tbr3.org','http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'jwt_token'],
  credentials: true
};
app.use(cors(corsOptions));
const pool = require("./db");
const fileUpload = require("express-fileupload");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const authorize = require("./middleware/authorize");
const sendemail = require("./middleware/mailer"); //gimme mailer
const { checkImageSafety } = require("./utils/moderation"); 
const jwtSecret = process.env.JWT_SECRET; // Use environment variable
const crypto = require('crypto');
const NodeCache = require('node-cache');
const verifyRoutes = require('./routes/phoneverifyroutes');
const cache = new NodeCache();
// const sharp = require('sharp');
const feedbackRouter = require("./routes/feedback");
const donationsRoutes = require("./routes/donations");
const statsRoutes = require('./routes/stats');

const path = require('path'); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Middleware

app.options('*', cors(corsOptions));

app.use(express.json());
app.use(fileUpload());

// ROUTES
app.use("/events", require("./routes/eventroutes"));
app.use("/api/users", require("./routes/users")); // Mounts /api/users/:userId
app.use("/api/feedback", require("./routes/feedback")); // Mounts /api/feedback endpoints
app.use("/admin", require("./routes/adminroutes"));
app.use("/authentication", require("./routes/jwtAuth"));
app.use("/Posting", require("./routes/itemPost"));
app.use('/messages', require('./routes/messages'));
app.use('/api/verify', verifyRoutes);
app.use("/api/donations", donationsRoutes);
app.use('/api/stats', statsRoutes);

// app.use("/images", require("./routes/imageRoutes"));
// Backend Route to Fetch Images by postId
app.get('/images/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
   
    // Query the database to retrieve the image data for the given postId
    const result = await pool.query('SELECT attached_photo FROM posts WHERE post_id = $1', [postId]);

    // Check if an image was found for the given postId
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Extract the image data from the database result
    const imageData = result.rows[0].attached_photo;
    const base64ImageData = imageData.toString('base64');
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Embedded Image</title>
      </head>
      <body>
        <h1>Embedded Image</h1>
        <img src="data:image/;base64,${base64ImageData}" alt="Embedded Image">
      </body>
      </html>
    `;


    // Serve the image data as a response with the appropriate content type
    res.writeHead(200, {
      'Content-Type': 'text/html', // Adjust content type based on your image format
      'Worked': 'yes'
    });
    res.end(htmlContent);
 

  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// Function to generate JWT token
function generateJWTToken(userId) {
    return jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });
  }


app.put("/update-credentials", authorize, async (req, res) => {
  try {
    const user_id = req.user.id;
    const {
      username,
      email,
      phone_number,
      newPassword
    } = req.body;

    const fields = [];
    const values = [];
    let index = 1;

    if (username) {
      fields.push(`username = $${index++}`);
      values.push(username);
    }

    if (email) {
      fields.push(`email = $${index++}`);
      values.push(email);
    }

    if (phone_number) {
      fields.push(`phone_number = $${index++}`);
      values.push(phone_number);
    }

    if (newPassword && newPassword.length >= 6) {
      const hashed = await bcrypt.hash(newPassword, 10);
      fields.push(`password = $${index++}`);
      values.push(hashed);
    } else if (newPassword && newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No valid fields provided to update." });
    }

    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${index}
      RETURNING username, email, phone_number
    `;
    values.push(user_id);

    const updated = await pool.query(query, values);

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.error("Error updating user credentials:", err.message);
    res.status(500).send("Server Error");
  }
});


app.get("/banner", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM banners WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1"
    );
    res.json({ banner: result.rows[0] || null });
  } catch (err) {
    console.error("Public banner fetch error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// Registration
// Registration Route
app.post("/authentication/registration", async (req, res) => {
  try {
    const { username, password, email, phone_number } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      "INSERT INTO users (username, password, email, phone_number) VALUES ($1, $2, $3, $4) RETURNING id",
      [username, hashedPassword, email, phone_number]
    );

    const userId = rows[0].id;

    const jwtToken = generateJWTToken(userId);

    res.json({ jwtToken });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.post("/forgot-password", async (req, res) => {
try{
const {email} = req.body;
//find user from his email
const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
if(user.rows.length === 0){ //checks if the length 0
  return res.status(404).json({message: "User not found"});
}
const userId = user.rows[0].id;

//we are generating random token as the reset token and make it 15mins only
const token = crypto.randomBytes(32).toString('hex');
const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
await pool.query('DELETE FROM password_resets WHERE user_id = $1', [userId]);
//now we store token in database
await pool.query(
  'INSERT INTO password_resets (user_id, token, expires) VALUES ($1, $2, $3)',
  [userId, token, expires]
)
const resetLink = `http://localhost:3000/reset-password?token=${token}`; 
//send email to user
await sendemail(email, resetLink); 
res.json({message: "pass reset link sent to email."});
}catch (err) { //if theres error
  console.error("error in password forgot",err);
  res.status(500).send("Server Error");
}

});
//password reset here
app.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;

//I NEED TO ADD CHECK PASSWORD LENGTH HERE 

    const tokenRes = await pool.query(
      'SELECT user_id, expires FROM password_resets WHERE token = $1',
      [token]
    );
//check token valid or no
    if (tokenRes.rows.length === 0 || new Date() > tokenRes.rows[0].expires) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const userId = tokenRes.rows[0].user_id;
    const hashedPassword = await bcrypt.hash(new_password, 10); //hash the new password
    // //debug
    console.log(" raw password:", new_password);
    console.log(" hashed password:", hashedPassword);

//update password in database
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );
//remove the tokenn
    await pool.query('DELETE FROM password_resets WHERE token = $1', [token]);

    res.json({ message: 'pass reset successful yay!!' });

  } catch (err) {
    console.error('error in reset pass:', err.message);
    res.status(500).send('Server Error');
  }
});


const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

app.post("/create_post", async (req, res) => {
  try {
    const token = req.header("jwt_token");
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId;

    if (!req.files || !req.files.images || !req.body.title || !req.body.description) {
      return res.status(400).send("Title, description, and at least one image are required.");
    }

    const { title, description, features, email, phone, location } = req.body;

    const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    const primaryFile = imageFiles[0];
    const extraImages = imageFiles.slice(1);

    let parsedFeatures = [];
    try {
      parsedFeatures = features ? JSON.parse(features) : [];
    } catch (err) {
      console.warn("Failed to parse features:", err.message);
    }

    // ✅ Create post with default status = 'active'
    const postInsert = await pool.query(
      `INSERT INTO posts (title, description, user_id, email, phone, features, location, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
       RETURNING post_id`,
      [title, description, userId, email || null, phone || null, parsedFeatures.length ? parsedFeatures : null, location || null]
    );

    const postId = postInsert.rows[0].post_id;

    const uploadPath = path.join('/var/www/tbr3/uploads/posts');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const saveImage = async (file) => {
      const ext = path.extname(file.name).toLowerCase();
      const fileName = `${uuidv4()}${ext}`;
      const filePath = path.join(uploadPath, fileName);
      await file.mv(filePath);

      const imageUrl = `${process.env.BASE_URL}/uploads/posts/${fileName}`;
      await pool.query(
        `INSERT INTO post_images (post_id, image_url) VALUES ($1, $2)`,
        [postId, imageUrl]
      );
    };

    await saveImage(primaryFile);
    for (const file of extraImages) {
      await saveImage(file);
    }

    cache.keys().forEach(key => {
      if (key.startsWith('posts_') || key === 'total_posts_count') {
        cache.del(key);
      }
    });

    // ✅ Respond to frontend right away
    res.json({ message: "Post created successfully", post_id: postId });

    // ✅ Run moderation in background
    setTimeout(async () => {
      try {
        const imageBuffer = primaryFile.data;
        const { label, probability } = await checkImageSafety(imageBuffer);
        console.log(`Background moderation for post ${postId}: ${label} (${probability})`);

        if (label === 'unseemly') {
          await pool.query(`UPDATE posts SET status = 'flagged' WHERE post_id = $1`, [postId]);
          console.log(`Post ${postId} flagged as unseemly.`);
        }
      } catch (modErr) {
        console.error(`Moderation failed for post ${postId}:`, modErr);
      }
    }, 0);

  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});




app.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const cacheKey = `posts_${page}_${limit}`;
    const countCacheKey = 'total_posts_count';

    // ✅ Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // ✅ Get total count (cached)
    let totalPosts = cache.get(countCacheKey);
    if (!totalPosts) {
    const countResult = await pool.query("SELECT COUNT(*) FROM posts WHERE status = 'active'");
      totalPosts = parseInt(countResult.rows[0].count);
      cache.set(countCacheKey, totalPosts, 60);
    }

    // ✅ Fetch posts with first image (by id)
const result = await pool.query(`
  SELECT 
    p.post_id, 
    p.title, 
    p.user_id,
    p.features,
    p.created_at,
    p.availability,
    p.location AS post_location,
    u.email,
    p.description,
    (
      SELECT image_url 
      FROM post_images 
      WHERE post_id = p.post_id
      ORDER BY id ASC
      LIMIT 1
    ) AS attached_photo_url
  FROM posts p
  LEFT JOIN users u ON p.user_id = u.id
  WHERE p.status = 'active'
  ORDER BY p.created_at DESC
  LIMIT $1 OFFSET $2
`, [limit, offset]);


    const postsWithURLs = result.rows.map(post => ({
      post_id: post.post_id,
      title: post.title,
      email: post.email,
      description: post.description,
      userId: post.user_id,
      features: post.features || ["Other"],
      attached_photo_url: post.attached_photo_url || null,
      created_at: post.created_at,
      location: post.post_location || "Unknown",
      availability: post.availability || 'available'
    }));

    const response = {
      posts: postsWithURLs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasMore: offset + limit < totalPosts
      }
    };

    cache.set(cacheKey, response, 60);
    res.json(response);
  } catch (error) {
    console.error('Error in /posts endpoint:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});



app.get("/profile", authorize, async (req, res) => {
  try {
    const userId = req.user.id;

    const profileResult = await pool.query(
      `SELECT username, email, phone_number FROM users WHERE id = $1`,
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = profileResult.rows[0];

    // ✅ Only get the number of posts — no images
    const postsCountResult = await pool.query(
      `SELECT COUNT(*) FROM posts WHERE user_id = $1`,
      [userId]
    );
    user.active_posts = parseInt(postsCountResult.rows[0].count, 10);

    // ✅ Average rating
    const ratingResult = await pool.query(
      `SELECT ROUND(AVG(rating)::numeric, 1) AS rating FROM feedback WHERE receiver_id = $1`,
      [userId]
    );
user.rating = ratingResult.rows[0].rating !== null
  ? parseFloat(ratingResult.rows[0].rating)
  : null;

    // ✅ Feedbacks
    const feedbackResult = await pool.query(
      `SELECT f.giver_id, f.rating, f.comment, f.created_at, u.username AS giver_username
       FROM feedback f
       JOIN users u ON f.giver_id = u.id
       WHERE f.receiver_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );
    user.feedbacks = feedbackResult.rows;

    res.json([user]);
  } catch (err) {
    console.error("Error in /profile:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});



// Backend Route to Fetch Posts for a Specific User
app.get('/posts/user', authorize, async (req, res) => {
  try {
    // Extracting the user ID from the JWT token added to the req by the 'authorize' middleware
    const user_id = req.user.id; // Adjust this according to how your token payload is structured
    
    // Query the database to retrieve posts only for the logged-in user
    const result = await pool.query('SELECT * FROM posts WHERE user_id = $1', [user_id]);

    // Check if any posts were found
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No posts found for this user' });
    }

    // Send the posts as the response
    res.json(result.rows.map(post => ({
      ...post,
      attached_photo: post.attached_photo.toString('base64') // Convert BYTEA to base64 string
    })));
  } catch (error) {
    console.error('Error fetching posts for user:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});
// DELETE route to delete a post
app.delete('/posts/:postId', authorize, async (req, res) => {
  try {
    const { postId } = req.params;
    const user_id = req.user.id;

    // Delete the post if it belongs to the user
    const deleteQuery = 'DELETE FROM posts WHERE post_id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(deleteQuery, [postId, user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found or not authorized to delete this post' });
    }

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Replace the optimizeImage function with a simpler version
async function optimizeImage(imageBuffer) {
  try {
    // Just return the original buffer for now
    return imageBuffer;
  } catch (error) {
    console.error('Error processing image:', error);
    return imageBuffer;
  }
}

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Add process error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Perform cleanup if needed
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Perform cleanup if needed
});

setInterval(() => {
  pool.query('SELECT 1').catch(() => {});
}, 300000);
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['https://tbr3.org', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

require("./utils/socket")(io); // your socket logic

server.listen(5000, '0.0.0.0', () => {
  console.log("🚀 Server running on port 5000");
});
