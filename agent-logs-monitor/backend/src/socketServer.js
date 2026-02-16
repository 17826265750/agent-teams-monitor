const { Server } = require('socket.io');

/**
 * Initialize Socket.IO server
 * @param {Object} httpServer - HTTP server instance
 * @param {Object} options - Configuration options
 * @returns {Server} Socket.IO server instance
 */
function initializeSocketServer(httpServer, options = {}) {
  const io = new Server(httpServer, {
    cors: {
      origin: options.corsOrigin || '*',
      methods: ['GET', 'POST']
    }
  });

  // Store file sizes to track changes
  const fileSizes = new Map();

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to Agent Logs Monitor',
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });

    // Handle file size tracking
    socket.on('register:file', (data) => {
      if (data.filename && data.size !== undefined) {
        fileSizes.set(data.filename, data.size);
        console.log(`[Socket.IO] Registered file: ${data.filename} (${data.size} bytes)`);
      }
    });

    // Handle request for file list
    socket.on('request:logs', async () => {
      if (options.onLogsRequest) {
        const logs = await options.onLogsRequest();
        socket.emit('logs:list', logs);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`[Socket.IO] Socket error for ${socket.id}:`, error);
    });
  });

  // Store file sizes getter/setter for use by file watcher
  io.fileSizes = fileSizes;

  return io;
}

/**
 * Broadcast log update to all connected clients
 * @param {Server} io - Socket.IO server instance
 * @param {Object} data - Update data
 */
function broadcastLogUpdate(io, data) {
  io.emit('log:update', {
    filename: data.filename,
    content: data.content,
    timestamp: new Date().toISOString(),
    size: data.size
  });
  console.log(`[Socket.IO] Broadcasted log update for: ${data.filename}`);
}

/**
 * Broadcast new file creation to all connected clients
 * @param {Server} io - Socket.IO server instance
 * @param {Object} data - File data
 */
function broadcastNewFile(io, data) {
  io.emit('log:new', {
    filename: data.filename,
    path: data.path,
    timestamp: new Date().toISOString()
  });
  console.log(`[Socket.IO] Broadcasted new file: ${data.filename}`);
}

/**
 * Broadcast file deletion to all connected clients
 * @param {Server} io - Socket.IO server instance
 * @param {Object} data - File data
 */
function broadcastDeletedFile(io, data) {
  io.emit('log:delete', {
    filename: data.filename,
    timestamp: new Date().toISOString()
  });
  console.log(`[Socket.IO] Broadcasted deleted file: ${data.filename}`);
}

module.exports = {
  initializeSocketServer,
  broadcastLogUpdate,
  broadcastNewFile,
  broadcastDeletedFile
};
