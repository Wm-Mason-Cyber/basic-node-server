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
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'node_demo.db');
let db;

/**
 * Initializes the SQLite database.
 * Creates the 'users' table if it doesn't exist and seeds it with data.
 * @returns {Promise<sqlite3.Database>} A promise that resolves with the database instance.
 */
function initDb() {
    return new Promise((resolve, reject) => {
        // Ensure data directory exists
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR);
        }

        if (db && db.open) { // If DB is already open, resolve with existing instance
            console.log('Database already open.');
            return resolve(db);
        }

        db = new sqlite3.Database(DB_FILE, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                return reject(err);
            }
            console.log('Connected to the SQLite database.');
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                password TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    console.error('Error creating table:', err.message);
                    return reject(err);
                }
                // Check if table is empty before seeding
                db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
                    if (err) {
                        console.error('Error checking user count:', err.message);
                        return reject(err);
                    } else if (row.count === 0) {
                        console.log('Seeding users table...');
                        db.run("INSERT INTO users (name, password) VALUES (?, ?)", ["admin", "adminpass"]);
                        db.run("INSERT INTO users (name, password) VALUES (?, ?)", ["user1", "pass123"]);
                        db.run("INSERT INTO users (name, password) VALUES (?, ?)", ["user2", "securepass"]);
                    }
                    resolve(db);
                });
            });
        });
    });
}

/**
 * Closes the SQLite database connection.
 * @returns {Promise<void>} A promise that resolves when the database is closed.
 */
function closeDb() {
    return new Promise((resolve, reject) => {
        if (db && db.open) {
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                    return reject(err);
                }
                console.log('Database connection closed.');
                db = null; // Clear the db instance
                resolve();
            });
        } else {
            console.log('No active database connection to close.');
            resolve();
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
    db.all(sql, [], callback); // Changed from db.get() to db.all()
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
    closeDb, // Export closeDb
    getUserVulnerable,
    getUserSafe,
    getDb: () => db // Export db instance for direct management in tests if needed
};
