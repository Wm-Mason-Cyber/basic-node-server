const express = require('express');
const router = express.Router();

// Import the logger from app.js (assuming it's exported or available globally in a more complex setup)
// For this example, we'll keep it simple and assume logging happens in app.js or we'd pass logger
// If a logger was passed: const logger = require('./app').logger;

/* GET home page. */
router.get('/', function(req, res, next) {
  // In a real app, you might log here as well
  res.render('index', { title: 'Basic Node.js Server for Cybersecurity Education', message: 'Welcome!' });
});

module.exports = router;
