#!/bin/bash

# Agent Logs Monitor - 启动脚本 / Startup Script
# Linux/Mac 版本

echo "=================================================="
echo "  Agent Logs Monitor - 启动中 / Starting..."
echo "=================================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    echo "   Error: Node.js is not installed"
    echo "   请访问: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js 版本: $(node --version)"
echo "✓ npm 版本: $(npm --version)"
echo ""

# 检查依赖
echo "检查依赖 / Checking dependencies..."

if [ ! -d "backend/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd frontend
    npm install
    cd ..
fi

echo "✓ 所有依赖已安装 / All dependencies installed"
echo ""

# 启动服务
echo "=================================================="
echo "启动服务 / Starting services..."
echo "=================================================="
echo ""

# 启动后端
echo "▶️  启动后端服务器 / Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 启动前端
echo "▶️  启动前端服务器 / Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "=================================================="
echo "✅ 服务已启动 / Services started successfully!"
echo "=================================================="
echo ""
echo "📝 后端服务 / Backend Service:"
echo "   URL: http://localhost:3001"
echo "   API 文档: http://localhost:3001/api/health"
echo ""
echo "🎨 前端服务 / Frontend Service:"
echo "   URL: http://localhost:5173"
echo ""
echo "📖 使用说明 / Usage:"
echo "   1. 打开浏览器访问 http://localhost:5173"
echo "   2. 开始监控日志文件"
echo ""
echo "⛔ 停止服务 / Stop services:"
echo "   按 Ctrl+C 或运行: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "=================================================="
echo ""

# 保持脚本运行
wait $BACKEND_PID $FRONTEND_PID
