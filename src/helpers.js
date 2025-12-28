const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// --- JSON Message Storage ---
const MESSAGES_FILE = path.join(__dirname, '..', 'data', 'messages.json');

/**
 * Reads messages from the messages.json file.
 * @returns {Array} An array of messages.
 */
function readMessages() {
    try {
        if (fs.existsSync(MESSAGES_FILE)) {
            const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading messages file:', error);
    }
    return [];
}

/**
 * Writes messages to the messages.json file.
 * @param {Array} messages - An array of messages to write.
 */
function writeMessages(messages) {
    try {
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing messages file:', error);
    }
}

// --- SQLite Database Storage ---
const DB_FILE = path.join(__dirname, '..', 'data', 'node_demo.db');
let db;

/**
 * Initializes the SQLite database.
 * Creates the 'users' table if it doesn't exist and seeds it with data.
 */
function initDb() {
    db = new sqlite3.Database(DB_FILE, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the SQLite database.');
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                password TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    console.error('Error creating table:', err.message);
                } else {
                    // Check if table is empty before seeding
                    db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
                        if (err) {
                            console.error('Error checking user count:', err.message);
                        } else if (row.count === 0) {
                            console.log('Seeding users table...');
                            db.run("INSERT INTO users (name, password) VALUES (?, ?)", ["admin", "adminpass"]);
                            db.run("INSERT INTO users (name, password) VALUES (?, ?)", ["user1", "pass123"]);
                            db.run("INSERT INTO users (name, password) VALUES (?, ?)", ["user2", "securepass"]);
                        }
                    });
                }
            });
        }
    });
}

/**
 * Performs a vulnerable SQL query to find a user by name.
 * Uses string concatenation directly from user input.
 * @param {string} name - The user's name from request query.
 * @param {function} callback - Callback function (err, row).
 */
function getUserVulnerable(name, callback) {
    // WARNING: Intentionally vulnerable SQL query.
    // User input is directly concatenated into the SQL string.
    const sql = `SELECT id, name FROM users WHERE name = '${name}'`;
    console.log('Vulnerable SQL:', sql);
    db.get(sql, [], callback);
}

/**
 * Performs a safe SQL query to find a user by name.
 * Uses parameterized queries to prevent SQL injection.
 * @param {string} name - The user's name from request query.
 * @param {function} callback - Callback function (err, row).
 */
function getUserSafe(name, callback) {
    // Safe SQL query using parameterized statements.
    const sql = `SELECT id, name FROM users WHERE name = ?`;
    console.log('Safe SQL:', sql);
    db.get(sql, [name], callback);
}


module.exports = {
    readMessages,
    writeMessages,
    initDb,
    getUserVulnerable,
    getUserSafe
};
