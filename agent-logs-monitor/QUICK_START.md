# 快速参考指南 / Quick Reference Guide

## Agent Logs Monitor v1.0.0

---

## 🚀 一键启动

### Windows
```bash
start.bat
```

### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

### 手动启动
```bash
# 终端 1 - 后端
cd backend
npm run dev

# 终端 2 - 前端
cd frontend
npm run dev
```

---

## 📍 访问地址

| 服务 | URL | 说明 |
|------|-----|------|
| 前端应用 | http://localhost:5173 | React Web 界面 |
| 后端 API | http://localhost:3001 | REST API 端点 |
| 健康检查 | http://localhost:3001/api/health | 服务状态检查 |
| Socket.IO | http://localhost:3001 | WebSocket 服务器 |

---

## 🔧 常用命令

### 安装依赖
```bash
npm run install:all      # 安装所有依赖
cd backend && npm install # 仅后端
cd frontend && npm install # 仅前端
```

### 启动服务
```bash
npm start               # 启动完整系统
npm run start:backend   # 仅启动后端
npm run start:frontend  # 仅启动前端
```

### 停止服务
```bash
# Linux/Mac
./stop.sh

# Windows
stop.bat

# 或手动
Ctrl+C 或关闭终端窗口
```

### 测试
```bash
npm test                # 集成测试
npm run test:backend    # 后端 API 测试
```

### 构建
```bash
npm run build:frontend  # 构建前端生产版本
```

---

## 📡 API 快速参考

### REST API

#### 健康检查
```bash
curl http://localhost:3001/api/health
```

#### 获取所有日志
```bash
curl http://localhost:3001/api/logs
```

#### 读取日志内容
```bash
# 完整文件
curl http://localhost:3001/api/logs/example.log

# 最后 100 行
curl "http://localhost:3001/api/logs/example.log?lines=100"
```

### WebSocket 事件

#### 监听事件
```javascript
// 连接
socket.on('connected', (data) => {
  console.log('Connected:', data.socketId);
});

// 日志更新
socket.on('log:update', (data) => {
  console.log('New content:', data.content);
});

// 新文件
socket.on('log:new', (data) => {
  console.log('New file:', data.filename);
});

// 文件删除
socket.on('log:delete', (data) => {
  console.log('Deleted:', data.filename);
});

// 日志列表
socket.on('logs:list', (data) => {
  console.log('Files:', data.data);
});
```

#### 发送事件
```javascript
// 请求日志列表
socket.emit('request:logs');

// 注册文件
socket.emit('register:file', {
  filename: 'example.log',
  size: 1024
});
```

---

## ⚙️ 配置文件

### backend/.env
```env
PORT=3001                                    # 后端端口
NODE_ENV=development                          # 环境
LOGS_TASKS_DIR=~/.claude/tasks/             # 任务日志目录
LOGS_TEAMS_DIR=~/.claude/teams/             # 团队日志目录
CORS_ORIGIN=*                                # CORS 配置
```

### 修改端口
```bash
# 编辑 backend/.env
PORT=3002

# 重启服务
./stop.sh && ./start.sh
```

---

## 🐛 故障排除

### 端口被占用
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### 清除所有依赖重新安装
```bash
npm run clean
npm run install:all
```

### 查看后端日志
```bash
cd backend
npm run dev
# 查看控制台输出
```

### 测试 API
```bash
npm test
```

---

## 📊 性能指标

| 指标 | 值 |
|------|-----|
| API 响应时间 | < 100ms |
| WebSocket 延迟 | < 50ms |
| 文件监听延迟 | < 200ms |
| 内存使用 (空闲) | < 100MB |
| 并发连接支持 | 100+ |

---

## 🔒 安全检查

### 生产环境必做
- [ ] 修改 `CORS_ORIGIN` 为具体域名
- [ ] 启用 HTTPS（使用 Nginx 反向代理）
- [ ] 添加 API 认证
- [ ] 启用速率限制
- [ ] 配置防火墙规则

---

## 📚 文档导航

| 文档 | 用途 |
|------|------|
| README.md | 项目概述和快速开始 |
| DEPLOYMENT.md | 详细部署指南 |
| API_DOCUMENTATION.md | API 完整参考 |
| PROJECT_SUMMARY.md | 项目总结 |
| ACCEPTANCE.md | 验收清单 |
| CHANGELOG.md | 版本更新 |
| FILE_MANIFEST.md | 文件清单 |

---

## 💡 提示

1. **首次运行**: 确保已执行 `npm run install:all`
2. **开发模式**: 使用 `npm run dev` 启动（支持热重载）
3. **查看日志**: 所有日志输出到控制台
4. **浏览器**: 推荐使用 Chrome/Firefox 最新版
5. **网络**: 确保防火墙允许 localhost 访问

---

## 🆘 获取帮助

1. 查看文档：`README.md` 或 `DEPLOYMENT.md`
2. 运行测试：`npm test`
3. 检查日志：查看控制台输出
4. 提交 Issue：项目 GitHub 页面

---

**版本:** 1.0.0
**更新:** 2025-01-15
**维护:** Backend Developer
