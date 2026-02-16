# Backend API Documentation

## Base URL
```
http://localhost:3001
```

## REST API Endpoints

### 1. Get All Log Files
**GET** `/api/logs`

Returns a list of all log files in the monitored directories.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "filename": "task-20250115-123456.log",
      "path": "C:\\Users\\User\\.claude\\tasks\\task-20250115-123456.log",
      "size": 2048,
      "modified": "2025-01-15T10:30:00.000Z",
      "directory": "~/.claude/tasks/"
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3001/api/logs
```

---

### 2. Read Log File Content
**GET** `/api/logs/:filename`

Reads the content of a specific log file.

**Query Parameters:**
- `lines` (optional): Number of lines to read from the end of the file. If omitted, reads entire file.

**Response:**
```json
{
  "success": true,
  "filename": "task-20250115-123456.log",
  "content": "[2025-01-15 10:30:00] Starting task...\n[2025-01-15 10:30:05] Task completed",
  "lines": "all"
}
```

**Examples:**
```bash
# Read entire file
curl http://localhost:3001/api/logs/task-20250115-123456.log

# Read last 100 lines
curl http://localhost:3001/api/logs/task-20250115-123456.log?lines=100
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "File not found: task-20250115-123456.log"
}
```

---

### 3. Health Check
**GET** `/api/health`

Check if the server is running.

**Response:**
```json
{
  "success": true,
  "service": "Agent Logs Monitor",
  "status": "running",
  "uptime": 123.456,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## WebSocket Events

### Connection
Connect to the Socket.IO server at:
```
http://localhost:3001
```

### Client → Server Events

#### `register:file`
Register a file for size tracking (to detect new content).

```javascript
socket.emit('register:file', {
  filename: 'task-20250115-123456.log',
  size: 2048
});
```

#### `request:logs`
Request the current list of log files.

```javascript
socket.emit('request:logs');
```

---

### Server → Client Events

#### `connected`
Sent when a client successfully connects.

```json
{
  "message": "Connected to Agent Logs Monitor",
  "socketId": "abc123",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

#### `logs:list`
Sent in response to `request:logs` event.

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "filename": "task-20250115-123456.log",
      "path": "C:\\Users\\User\\.claude\\tasks\\task-20250115-123456.log",
      "size": 2048,
      "modified": "2025-01-15T10:30:00.000Z",
      "directory": "~/.claude/tasks/"
    }
  ]
}
```

#### `log:update`
Broadcasted when a log file is modified with new content.

```json
{
  "filename": "task-20250115-123456.log",
  "content": "[2025-01-15 10:30:10] New log entry",
  "timestamp": "2025-01-15T10:30:10.000Z",
  "size": 2089
}
```

#### `log:new`
Broadcasted when a new log file is created.

```json
{
  "filename": "task-20250115-789012.log",
  "path": "C:\\Users\\User\\.claude\\tasks\\task-20250115-789012.log",
  "timestamp": "2025-01-15T10:35:00.000Z"
}
```

#### `log:delete`
Broadcasted when a log file is deleted.

```json
{
  "filename": "task-20250115-123456.log",
  "timestamp": "2025-01-15T10:40:00.000Z"
}
```

---

## Error Handling

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `404` - Resource not found
- `500` - Internal server error

---

## Usage Examples

### JavaScript/Node.js Client

```javascript
const io = require('socket.io-client');

// Connect to server
const socket = io('http://localhost:3001');

// Listen for log updates
socket.on('log:update', (data) => {
  console.log(`New content in ${data.filename}:`);
  console.log(data.content);
});

// Listen for new files
socket.on('log:new', (data) => {
  console.log(`New file created: ${data.filename}`);
});

// Listen for deleted files
socket.on('log:delete', (data) => {
  console.log(`File deleted: ${data.filename}`);
});

// Request initial log list
socket.on('connected', () => {
  socket.emit('request:logs');
  socket.on('logs:list', (data) => {
    console.log(`Found ${data.count} log files`);
  });
});
```

### Browser Client

```html
<!DOCTYPE html>
<html>
<head>
  <title>Agent Logs Monitor</title>
  <script src="/socket.io/socket.io.js"></script>
</head>
<body>
  <h1>Agent Logs Monitor</h1>
  <div id="logs"></div>

  <script>
    const socket = io('http://localhost:3001');
    const logsDiv = document.getElementById('logs');

    socket.on('log:update', (data) => {
      const logEntry = document.createElement('div');
      logEntry.innerHTML = `<strong>${data.filename}:</strong><pre>${data.content}</pre>`;
      logsDiv.appendChild(logEntry);
    });

    socket.on('log:new', (data) => {
      const entry = document.createElement('div');
      entry.textContent = `New file: ${data.filename}`;
      logsDiv.appendChild(entry);
    });
  </script>
</body>
</html>
```

---

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001                                    # Server port
NODE_ENV=development                          # Environment (development/production)
LOGS_TASKS_DIR=~/.claude/tasks/             # Tasks log directory
LOGS_TEAMS_DIR=~/.claude/teams/             # Teams log directory
CORS_ORIGIN=*                                # CORS origin (default: all)
```
