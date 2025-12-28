const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// --- Logging Setup ---
// Ensure logs directory exists
const fs = require('fs');
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        // Console transport for Docker logs and development
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
            )
        }),
        // File transport for verbose logging with daily rotation
        new DailyRotateFile({
            filename: path.join(logDir, 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        })
    ],
    exceptionHandlers: [
        new winston.transports.Console(),
        new DailyRotateFile({ filename: path.join(logDir, 'exceptions-%DATE%.log') })
    ],
    rejectionHandlers: [
        new winston.transports.Console(),
        new DailyRotateFile({ filename: path.join(logDir, 'rejections-%DATE%.log') })
    ]
});

// Middleware to log all requests
app.use((req, res, next) => {
    logger.info(`Request: ${req.method} ${req.url} from ${req.ip}`);
    next();
});

// View engine setup
app.set('views', path.join(__dirname, '..', 'node_views'));
app.set('view engine', 'ejs');

// Static files setup
app.use(express.static(path.join(__dirname, '..', 'node_static')));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
const mainRoutes = require('./routes');
app.use('/', mainRoutes);

// Export the app for testing
module.exports = app;

// Start the server only if this file is run directly (not imported)
if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(`Server running on http://localhost:${PORT}`);
        logger.warn('WARNING: This server contains intentionally vulnerable code for classroom use only. DO NOT deploy publicly.');
    });
}
