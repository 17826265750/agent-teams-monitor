# Deployment Guide

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Claude Agent installed (for logs to exist)
- Git (optional, for version control)

## Installation

### 1. Clone or Download Project

```bash
cd agent-logs-monitor
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment

**Backend (.env):**
```bash
cd ../backend
cp .env.example .env
# Edit .env if needed (default values work for most cases)
```

Default configuration:
```
PORT=3001
NODE_ENV=development
LOGS_TASKS_DIR=~/.claude/tasks/
LOGS_TEAMS_DIR=~/.claude/teams/
CORS_ORIGIN=*
```

## Development Mode

### Start Backend Server

```bash
cd backend
npm run dev
```

Server runs on: `http://localhost:3001`

### Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173` (or similar Vite port)

### Access the Application

Open browser: `http://localhost:5173`

## Production Deployment

### Option 1: Manual Deployment

#### 1. Build Frontend

```bash
cd frontend
npm run build
```

This creates `frontend/dist/` with static files.

#### 2. Start Backend in Production Mode

```bash
cd backend
NODE_ENV=production npm start
```

#### 3. Serve Frontend with Backend

The backend can serve the static frontend files:

**backend/src/index.js** (add this before app.listen):

```javascript
// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}
```

### Option 2: Using Process Manager (PM2)

#### Install PM2

```bash
npm install -g pm2
```

#### Start Backend with PM2

```bash
cd backend
pm2 start src/index.js --name "agent-logs-backend"
pm2 save
pm2 startup
```

#### PM2 Commands

```bash
pm2 list                 # List all processes
pm2 logs agent-logs-backend  # View logs
pm2 restart agent-logs-backend  # Restart
pm2 stop agent-logs-backend     # Stop
pm2 delete agent-logs-backend   # Remove
```

### Option 3: Docker Deployment

#### Create Dockerfile

**Dockerfile** (in project root):

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Production image
FROM node:18-alpine
WORKDIR /app

# Copy backend
COPY --from=builder /app/backend/package*.json ./
RUN npm install --production
COPY --from=builder /app/backend/src ./src

# Copy frontend build
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 3001

CMD ["node", "src/index.js"]
```

#### Build and Run Docker

```bash
docker build -t agent-logs-monitor .
docker run -p 3001:3001 -v ~/.claude:/root/.claude agent-logs-monitor
```

### Option 4: Cloud Deployment

#### Vercel (Frontend) + Railway/Render (Backend)

**Frontend (Vercel):**
```bash
cd frontend
npm install -g vercel
vercel
```

**Backend (Railway):**
```bash
npm install -g railway
railway login
railway init
railway up
railway domain
```

## Configuration Management

### Environment Variables

**Development:**
- Use `backend/.env` file
- Loaded automatically by dotenv

**Production:**
- Set environment variables directly
- Or use `.env` file (don't commit to git)

### Port Configuration

Default ports:
- Backend: 3001
- Frontend Dev: 5173 (Vite default)

Change by setting `PORT` environment variable.

## Monitoring & Logs

### Backend Logs

Backend logs to console:
```
[FileWatcher] File changed: /path/to/file.log
[Socket.IO] Client connected: abc123
[API] GET /api/logs - 200
```

### Log Rotation (Optional)

For production, use log rotation:

```bash
npm install --save winston winston-daily-rotate-file
```

## Health Checks

### Backend Health Endpoint

```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "success": true,
  "service": "Agent Logs Monitor",
  "status": "running",
  "uptime": 123.456,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Monitoring Script

```bash
#!/bin/bash
# monitor.sh - Check server health

HEALTH=$(curl -s http://localhost:3001/api/health)
STATUS=$(echo $HEALTH | jq -r '.status')

if [ "$STATUS" = "running" ]; then
  echo "✓ Server is healthy"
  exit 0
else
  echo "✗ Server is down"
  exit 1
fi
```

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Find process using port 3001
lsof -i :3001
# Kill it
kill -9 <PID>
```

**2. Cannot Connect to Backend**
- Check firewall settings
- Verify CORS_ORIGIN in .env
- Check backend logs

**3. No Logs Found**
- Ensure Claude Agent is running
- Check LOGS_TASKS_DIR and LOGS_TEAMS_DIR paths
- Verify directories exist

**4. Socket.IO Connection Failed**
- Verify backend is running
- Check CORS configuration
- Ensure WebSocket support in browser

## Performance Tuning

### Backend

- Increase Chokidar polling for network drives
- Add caching for log file list
- Implement rate limiting for API

### Frontend

- Implement virtual scrolling for large logs
- Add log filtering/search
- Debounce socket events

## Security Considerations

1. **CORS**: Restrict `CORS_ORIGIN` in production
2. **Rate Limiting**: Add express-rate-limit middleware
3. **Authentication**: Add API key authentication if needed
4. **File Access**: Restrict to specific log directories only
5. **HTTPS**: Use reverse proxy (nginx) for SSL

## Backup & Recovery

### Back Up Configuration

```bash
tar -czf backup-$(date +%Y%m%d).tar.gz \
  backend/.env \
  backend/src/ \
  frontend/src/ \
  package.json
```

### Restore

```bash
tar -xzf backup-20250115.tar.gz
npm install
```

## Updates

### Update Dependencies

```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update
```

### Check for Outdated Packages

```bash
npm outdated
```

## Support

For issues or questions:
- Check logs in console
- Review API_DOCUMENTATION.md
- Check BACKEND_SUMMARY.md
- Review frontend README.md
