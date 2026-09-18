const express = require("express");
const router = express.Router();
const pool = require("../db");
const authorize = require("../middleware/authorize");
const path = require("path");
// ✅ Public route: Get ALL events with base64 images
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY event_date ASC");
    const events = result.rows;

    const withImages = await Promise.all(events.map(async (event) => {
      const imagesRes = await pool.query(
        "SELECT image_url FROM event_images WHERE event_id = $1",
        [event.id]
      );
      const images = imagesRes.rows.map(row => row.image_url);
      return { ...event, images };
    }));

    res.json(withImages);
  } catch (err) {
    console.error("❌ Error fetching events:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Public route: Get SINGLE event by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // ✅ Validate that the id is a number
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ message: "Invalid event ID" });
  }

  try {
    // Fetch the event
    const eventRes = await pool.query("SELECT * FROM events WHERE id = $1", [id]);
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Fetch image URLs from event_images table
    const imageRes = await pool.query(
      "SELECT image_url FROM event_images WHERE event_id = $1",
      [id]
    );

    const imageUrls = imageRes.rows.map(row => row.image_url);

    // Construct full response
    const event = {
      ...eventRes.rows[0],
      images: imageUrls
    };

    return res.json(event);
  } catch (err) {
    console.error("❌ Error fetching event:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});


// ✅ Admin-only routes below
router.use(authorize);
router.use((req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Only admins can access this route." });
  }
  next();
});

// ✅ Ping test (admin only)
router.get("/ping", (req, res) => {
  res.send("events router is working ✅");
});

const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

router.post("/", async (req, res) => {
  try {
    console.log("⚡ Event creation request received");
    console.log("req.user =", req.user);
    console.log("REQ BODY:", req.body);
    console.log("REQ FILES:", req.files);

    const {
      title,
      description,
      owner_name,
      location,
      event_date,
      start_time,
      end_time
    } = req.body;

    if (!title || !description || !owner_name || !location || !event_date || !start_time || !end_time) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const result = await pool.query(
      `INSERT INTO events (title, description, owner_name, location, event_date, start_time, end_time, admin_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [title, description, owner_name, location, event_date, start_time, end_time, req.user.id]
    );

    const eventId = result.rows[0].id;

    if (req.files?.images) {
      const uploadPath = path.join("/var/www/tbr3/uploads/events");

      // Ensure the folder exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

      for (const image of images) {
        const ext = path.extname(image.name).toLowerCase();
        const fileName = `${uuidv4()}${ext}`;
        const fullPath = path.join(uploadPath, fileName);

        // Save image to disk
        await image.mv(fullPath);

        // Construct URL
        const imageUrl = `${process.env.BASE_URL}/uploads/events/${fileName}`;

        // Save URL in DB
        await pool.query(
          `INSERT INTO event_images (event_id, image_url) VALUES ($1, $2)`,
          [eventId, imageUrl]
        );
      }
    }

    return res.status(201).json({ message: "Event created successfully", event_id: eventId });

  } catch (err) {
    console.error("❌ Error creating event:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /events/:id - Admin only
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Delete images first (due to FK constraint)
    await pool.query("DELETE FROM event_images WHERE event_id = $1", [id]);

    // Then delete the event
    const result = await pool.query("DELETE FROM events WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting event:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
