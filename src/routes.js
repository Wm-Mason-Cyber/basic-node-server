const express = require('express');
const router = express.Router();
const path = require('path');
const { readMessages, writeMessages } = require('./helpers'); // Import helper functions

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

// --- Stored XSS Demos ---

/**
 * GET /stored_vuln
 * Displays stored messages unsafely.
 */
router.get('/stored_vuln', (req, res) => {
    const messages = readMessages();
    res.render('stored_vuln', { title: 'Stored XSS (Vulnerable)', messages: messages });
});

/**
 * POST /stored_vuln
 * Stores new messages unsafely.
 */
router.post('/stored_vuln', (req, res) => {
    const newMessage = req.body.message;
    if (newMessage) {
        const messages = readMessages();
        // WARNING: Intentionally vulnerable code. Storing user input directly.
        messages.push({ text: newMessage, timestamp: new Date().toISOString() });
        writeMessages(messages);
    }
    res.redirect('/stored_vuln');
});

/**
 * GET /stored_safe
 * Displays stored messages safely.
 */
router.get('/stored_safe', (req, res) => {
    const messages = readMessages();
    res.render('stored_safe', { title: 'Stored XSS (Safe)', messages: messages });
});

/**
 * POST /stored_safe
 * Stores new messages safely.
 */
router.post('/stored_safe', (req, res) => {
    const newMessage = req.body.message;
    if (newMessage) {
        const messages = readMessages();
        // Store raw message, but it will be escaped when displayed by EJS.
        messages.push({ text: newMessage, timestamp: new Date().toISOString() });
        writeMessages(messages);
    }
    res.redirect('/stored_safe');
});

module.exports = router;
