const chokidar = require('chokidar');
const path = require('path');
const os = require('os');

/**
 * Create file watcher for monitored directories
 * @param {Array<string>} directories - Directories to watch
 * @param {Object} callbacks - Event callbacks
 * @param {Function} callbacks.onAdd - File added callback (receives relativePath and fullPath)
 * @param {Function} callbacks.onChange - File changed callback (receives relativePath and fullPath)
 * @param {Function} callbacks.onDelete - File deleted callback (receives relativePath and fullPath)
 * @returns {chokidar.FSWatcher} File watcher instance
 */
function createFileWatcher(directories, callbacks = {}) {
  // Expand ~ to user home directory in all paths
  const expandedDirectories = directories.map(dir =>
    dir.replace(/^~/, os.homedir())
  );

  console.log('Setting up file watcher for directories:');
  expandedDirectories.forEach(dir => console.log(`  - ${dir}`));

  // Use a single combined glob pattern for all directories
  const watchPatterns = expandedDirectories.map(dir => {
    const cleanDir = dir.replace(/\/$/, '').replace(/\\$/, '');
    return path.join(cleanDir, '**', '*.json').replace(/\\/g, '/');
  }).join('|'); // Join with pipe for multiple patterns

  console.log('Watch pattern:', watchPatterns);

  const watcher = chokidar.watch(watchPatterns, {
    persistent: true,
    ignoreInitial: false, // Emit initial add events
    usePolling: true,
    interval: 100,
  });

  // Map full paths to relative paths for each monitored directory
  const getRelativePath = (fullPath) => {
    for (const dir of expandedDirectories) {
      // Normalize both paths for comparison
      const cleanDir = path.normalize(dir).replace(/\/$/, '').replace(/\\$/, '');
      const normalizedPath = path.normalize(fullPath);

      if (normalizedPath.startsWith(cleanDir)) {
        const relative = path.relative(cleanDir, normalizedPath);
        console.log(`[FileWatcher] Path mapping: ${normalizedPath} -> ${relative}`);
        return relative;
      }
    }
    console.log(`[FileWatcher] Path mapping failed: ${fullPath} -> basename`);
    return path.basename(fullPath);
  };

  // Handle file additions
  watcher.on('add', (filePath) => {
    console.log(`[FileWatcher] File added: ${filePath}`);
    if (callbacks.onAdd) {
      const relativePath = getRelativePath(filePath);
      callbacks.onAdd(relativePath, filePath);
    }
  });

  // Handle file changes
  watcher.on('change', (filePath) => {
    console.log(`[FileWatcher] File changed: ${filePath}`);
    if (callbacks.onChange) {
      const relativePath = getRelativePath(filePath);
      callbacks.onChange(relativePath, filePath);
    }
  });

  // Handle file deletions
  watcher.on('unlink', (filePath) => {
    console.log(`[FileWatcher] File deleted: ${filePath}`);
    if (callbacks.onDelete) {
      const relativePath = getRelativePath(filePath);
      callbacks.onDelete(relativePath, filePath);
    }
  });

  // Handle errors
  watcher.on('error', (error) => {
    console.error('[FileWatcher] Error:', error);
  });

  // Handle ready event
  watcher.on('ready', () => {
    console.log('[FileWatcher] Initial scan complete. Watching for changes...');
    console.log('[FileWatcher] Watched paths:', Object.keys(watcher.getWatched()));
  });

  return watcher;
}

/**
 * Read new content from a changed file
 * @param {string} filePath - Path to the file
 * @param {number} previousSize - Previous file size to read from
 * @returns {Promise<string>} New content since last read
 */
async function getNewContent(filePath, previousSize = 0) {
  const fs = require('fs');
  const stats = fs.statSync(filePath);
  const currentSize = stats.size;

  // If file is smaller, it was truncated - read entire file
  if (currentSize <= previousSize) {
    previousSize = 0;
  }

  // Read only the new content
  const buffer = Buffer.alloc(currentSize - previousSize);
  const fd = fs.openSync(filePath, 'r');

  try {
    fs.readSync(fd, buffer, 0, buffer.length, previousSize);
    return buffer.toString('utf-8');
  } finally {
    fs.closeSync(fd);
  }
}

module.exports = {
  createFileWatcher,
  getNewContent
};
