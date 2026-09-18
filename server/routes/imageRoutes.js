const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route to fetch images by postId
router.get('/:postId', async (req, res) => {
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

    // Log the image data to inspect its contents
    console.log('Image Data:', imageData);

    // Serve the image data as a response with the appropriate content type
    res.writeHead(200, {
      'Content-Type': 'image/*', // Adjust content type based on your image format
      'Content-Length': imageData.length
    });
    res.end(imageData, 'binary');

  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
