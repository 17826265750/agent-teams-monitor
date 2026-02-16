const fs = require('fs');
const path = require('path');

/**
 * Get list of log files from monitored directories
 * @param {Array<string>} directories - Array of directory paths to scan
 * @returns {Promise<Array<{filename: string, path: string, size: number, modified: string}>>}
 */
/**
 * Recursively scan directory for files
 * @param {string} dirPath - Directory path to scan
 * @param {string} baseDir - Base directory for relative path
 * @param {Array} files - Array to collect files
 */
function scanDirectory(dirPath, baseDir, files = []) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      // Recursively scan subdirectories
      scanDirectory(fullPath, baseDir, files);
    } else if (stats.isFile()) {
      // Add file to list
      const relativePath = path.relative(baseDir, fullPath);
      files.push({
        filename: relativePath,
        path: fullPath,
        size: stats.size,
        modified: stats.mtime,
        directory: baseDir
      });
    }
  }

  return files;
}

async function getLogFiles(directories) {
  const logFiles = [];

  for (const dir of directories) {
    try {
      // Expand ~ to user home directory
      const expandedDir = dir.replace(/^~/, require('os').homedir());

      if (!fs.existsSync(expandedDir)) {
        console.warn(`Directory not found: ${expandedDir}`);
        continue;
      }

      // Recursively scan directory
      const files = scanDirectory(expandedDir, expandedDir, []);
      logFiles.push(...files);
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
  }

  // Sort by modification time, newest first
  return logFiles.sort((a, b) => b.modified - a.modified);
}

/**
 * Read content from a log file
 * @param {string} filename - Name or relative path of the log file
 * @param {Array<string>} directories - Array of directory paths to search
 * @param {Object} options - Reading options
 * @param {number} options.lines - Number of lines to read from end (default: all)
 * @returns {Promise<string>} File content
 */
async function readLogFile(filename, directories, options = {}) {
  for (const dir of directories) {
    try {
      const expandedDir = dir.replace(/^~/, require('os').homedir());
      // Handle both relative paths (with subdirectories) and simple filenames
      const filePath = path.join(expandedDir, filename);

      if (fs.existsSync(filePath)) {
        if (options.lines) {
          // Read last N lines
          return readLastLines(filePath, options.lines);
        } else {
          // Read entire file
          return fs.readFileSync(filePath, 'utf-8');
        }
      }
    } catch (error) {
      console.error(`Error reading file ${filename}:`, error.message);
    }
  }

  throw new Error(`File not found: ${filename}`);
}

/**
 * Read last N lines from a file efficiently
 * @param {string} filePath - Path to the file
 * @param {number} lineCount - Number of lines to read
 * @returns {Promise<string>} Last N lines
 */
function readLastLines(filePath, lineCount) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    const lines = [];
    let buffer = '';

    stream.on('data', (chunk) => {
      buffer += chunk;
      const split = buffer.split('\n');

      // Keep all but the last incomplete line in buffer
      buffer = split.pop();

      // Add lines to our collection
      lines.push(...split);

      // Keep only the last lineCount lines
      if (lines.length > lineCount) {
        lines.splice(0, lines.length - lineCount);
      }
    });

    stream.on('end', () => {
      if (buffer) {
        lines.push(buffer);
      }
      resolve(lines.join('\n'));
    });

    stream.on('error', reject);
  });
}

/**
 * Watch a file for changes and return read stream
 * @param {string} filePath - Path to the file
 * @returns {fs.ReadStream} Readable stream
 */
function createFileStream(filePath) {
  return fs.createReadStream(filePath, { encoding: 'utf-8' });
}

module.exports = {
  getLogFiles,
  readLogFile,
  readLastLines,
  createFileStream
};
