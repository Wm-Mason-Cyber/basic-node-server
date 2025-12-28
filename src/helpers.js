const fs = require('fs');
const path = require('path');

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

module.exports = {
    readMessages,
    writeMessages
};
