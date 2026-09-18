// utils/moderation.js

async function checkImageSafety(imageBuffer) {
  // Moderation is disabled temporarily for local testing
  return {
    label: 'normal',
    probability: 0
  };
}

module.exports = { checkImageSafety };
