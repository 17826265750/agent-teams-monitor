require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { createFileWatcher, getNewContent } = require('./fileWatcher');
const { getLogFiles, readLogFile } = require('./logReader');
const { initializeSocketServer, broadcastLogUpdate, broadcastNewFile, broadcastDeletedFile } = require('./socketServer');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration
const PORT = process.env.PORT || 3001;
const LOGS_DIRECTORIES = [
  process.env.LOGS_TASKS_DIR || '~/.claude/tasks/',
  process.env.LOGS_TEAMS_DIR || '~/.claude/teams/'
];

// Initialize Socket.IO
const io = initializeSocketServer(server, {
  corsOrigin: process.env.CORS_ORIGIN || '*',
  onLogsRequest: async () => {
    return await getLogFiles(LOGS_DIRECTORIES);
  }
});

// REST API Routes

/**
 * GET /api/logs
 * Get list of all log files
 */
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await getLogFiles(LOGS_DIRECTORIES);
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('[API] Error fetching logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/logs/*
 * Read specific log file content (supports subdirectories)
 * Query params:
 * - lines: number of lines to read from end (optional)
 */
app.get('/api/logs/*', async (req, res) => {
  try {
    // Extract filename from the full path (remove /api/logs/ prefix)
    const filename = req.params[0];
    const lines = req.query.lines ? parseInt(req.query.lines) : undefined;

    const content = await readLogFile(filename, LOGS_DIRECTORIES, { lines });

    res.json({
      success: true,
      filename,
      content,
      lines: lines || 'all'
    });
  } catch (error) {
    console.error('[API] Error reading log file:', error);
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'Agent Logs Monitor',
    status: 'running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// Initialize File Watcher
const watcher = createFileWatcher(LOGS_DIRECTORIES, {
  onAdd: async (filename, filePath) => {
    try {
      // Broadcast new file event
      broadcastNewFile(io, { filename, path: filePath });

      // Read initial content and broadcast
      const content = await readLogFile(filename, LOGS_DIRECTORIES);
      const fs = require('fs');
      const stats = fs.statSync(filePath);

      io.fileSizes.set(filename, stats.size);
      broadcastLogUpdate(io, { filename, content, size: stats.size });
    } catch (error) {
      console.error(`[FileWatcher] Error processing new file ${filename}:`, error);
    }
  },

  onChange: async (filename, filePath) => {
    try {
      const fs = require('fs');
      const stats = fs.statSync(filePath);

      // Check if this is an inbox file (JSON array)
      const isInboxFile = filename.includes('inbox') || filename.includes('inboxes');

      if (isInboxFile) {
        // For inbox files, read complete file (JSON array)
        const content = fs.readFileSync(filePath, 'utf-8');
        broadcastLogUpdate(io, {
          filename,
          content,
          size: stats.size
        });
      } else {
        // For regular log files, read only the new content
        const previousSize = io.fileSizes.get(filename) || 0;
        const newContent = await getNewContent(filePath, previousSize);

        if (newContent && newContent.length > 0) {
          broadcastLogUpdate(io, {
            filename,
            content: newContent,
            size: stats.size
          });
        }
      }

      // Update stored size
      io.fileSizes.set(filename, stats.size);
    } catch (error) {
      console.error(`[FileWatcher] Error processing change for ${filename}:`, error);
    }
  },

  onDelete: (filename, filePath) => {
    try {
      // Remove from size tracking
      io.fileSizes.delete(filename);

      // Broadcast deletion event
      broadcastDeletedFile(io, { filename, path: filePath });
    } catch (error) {
      console.error(`[FileWatcher] Error processing deletion of ${filename}:`, error);
    }
  }
});

// Start server
server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('Agent Logs Monitor Backend Server');
  console.log('='.repeat(50));
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Monitoring directories:`);
  LOGS_DIRECTORIES.forEach(dir => {
    const expandedDir = dir.replace(/^~/, require('os').homedir());
    console.log(`  - ${expandedDir}`);
  });
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down gracefully...');
  watcher.close();
  server.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n[Server] Received SIGTERM, shutting down...');
  watcher.close();
  server.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };

