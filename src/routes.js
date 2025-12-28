const express = require('express');
const router = express.Router();
const path = require('path');

// Assuming the logger is exported from app.js as 'logger'
// For simplicity in this example, we'll re-require winston and create a logger instance here,
// or ideally, the logger would be passed into the routes module from app.js.
// Given the current structure, let's pass the logger from app.js to routes.js if possible,
// or create a new logger instance here that mimics the app's logger.
// For now, let's assume `app.js` handles all logging of routes via its middleware,
// but for specific route logging, we'll need a logger instance.

// Let's modify app.js to export the logger, then import it here.
// For this step, I will only modify the routes.

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Basic Node.js Server for Cybersecurity Education', message: 'Welcome!' });
});

// --- Reflected XSS Demos ---

/**
 * GET /vuln_reflected
 * Intentionally vulnerable reflected XSS endpoint.
 * Renders the 'q' query parameter directly into the HTML without sanitization.
 */
router.get('/vuln_reflected', (req, res) => {
    const query = req.query.q || 'Enter something in the "q" parameter!';
    // WARNING: Intentionally vulnerable code for demonstration.
    // This directly embeds user input into the HTML.
    res.render('reflected_vuln', { title: 'Reflected XSS (Vulnerable)', input: query });
});

/**
 * GET /safe_reflected
 * Safe reflected XSS endpoint.
 * Renders the 'q' query parameter using EJS escaping to prevent XSS.
 */
router.get('/safe_reflected', (req, res) => {
    const query = req.query.q || 'Enter something in the "q" parameter!';
    // This uses EJS's default escaping (<%= ... %>) to safely render user input.
    res.render('reflected_safe', { title: 'Reflected XSS (Safe)', input: query });
});

module.exports = router;
