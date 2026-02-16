/**
 * Logger Utility
 * 统一的日志记录工具
 */

const os = require('os');
const path = require('path');

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Color codes for console
const COLORS = {
  ERROR: '\x1b[31m',    // Red
  WARN: '\x1b[33m',     // Yellow
  INFO: '\x1b[36m',     // Cyan
  DEBUG: '\x1b[90m',    // Gray
  RESET: '\x1b[0m'
};

class Logger {
  constructor(service = 'App') {
    this.service = service;
    this.level = process.env.LOG_LEVEL || 'INFO';
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] [${this.service}] ${message}${metaStr}`;
  }

  colorize(level, message) {
    const color = COLORS[level] || COLORS.RESET;
    return `${color}${message}${COLORS.RESET}`;
  }

  log(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);
    const colorizedMessage = this.colorize(level, formattedMessage);

    // Console output
    console.log(colorizedMessage);

    // In production, you might want to write to file
    // This could be added with winston or similar
  }

  error(message, meta = {}) {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    if (this.level === 'DEBUG') {
      this.log(LOG_LEVELS.DEBUG, message, meta);
    }
  }

  // Log HTTP request
  logRequest(req, res, duration) {
    this.info(`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  }

  // Log Socket.IO event
  logSocketEvent(event, socketId, meta = {}) {
    this.debug(`Socket.IO: ${event}`, {
      socketId,
      ...meta
    });
  }

  // Log file system operation
  logFileOperation(operation, filePath, meta = {}) {
    this.info(`File ${operation}: ${path.basename(filePath)}`, {
      path: filePath,
      ...meta
    });
  }
}

module.exports = Logger;
