#!/bin/bash

# Agent Logs Monitor - 停止脚本 / Stop Script
# Linux/Mac 版本

echo "=================================================="
echo "  Agent Logs Monitor - 停止服务 / Stopping..."
echo "=================================================="
echo ""

# 查找并停止后端进程
echo "🛑 停止后端服务..."
BACKEND_PIDS=$(lsof -ti:3001)
if [ -n "$BACKEND_PIDS" ]; then
    kill -9 $BACKEND_PIDS 2>/dev/null
    echo "✓ 后端服务已停止"
else
    echo "ℹ️  后端服务未运行"
fi

# 查找并停止前端进程 (Vite 默认端口 5173)
echo "🛑 停止前端服务..."
FRONTEND_PIDS=$(lsof -ti:5173)
if [ -n "$FRONTEND_PIDS" ]; then
    kill -9 $FRONTEND_PIDS 2>/dev/null
    echo "✓ 前端服务已停止"
else
    echo "ℹ️  前端服务未运行"
fi

# 同时也尝试停止 npm 进程
pkill -f "npm run dev" 2>/dev/null

echo ""
echo "=================================================="
echo "✅ 所有服务已停止"
echo "=================================================="
