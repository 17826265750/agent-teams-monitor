@echo off
REM Agent Logs Monitor - 启动脚本 / Startup Script
REM Windows 版本

chcp 65001 >nul
cls

echo ==================================================
echo   Agent Logs Monitor - 启动中 / Starting...
echo ==================================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未安装 Node.js
    echo    Error: Node.js is not installed
    echo    请访问: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js 版本:
node --version
echo ✓ npm 版本:
npm --version
echo.

REM 检查依赖
echo 检查依赖 / Checking dependencies...
echo.

if not exist "backend\node_modules" (
    echo 📦 安装后端依赖...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo 📦 安装前端依赖...
    cd frontend
    call npm install
    cd ..
)

echo ✓ 所有依赖已安装 / All dependencies installed
echo.

echo ==================================================
echo 启动服务 / Starting services...
echo ==================================================
echo.

REM 启动后端
echo ▶️  启动后端服务器 / Starting backend server...
start "Agent Logs Monitor - Backend" cmd /k "cd backend && npm run dev"

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 启动前端
echo ▶️  启动前端服务器 / Starting frontend server...
start "Agent Logs Monitor - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==================================================
echo ✅ 服务已启动 / Services started successfully!
echo ==================================================
echo.
echo 📝 后端服务 / Backend Service:
echo    URL: http://localhost:3001
echo    API 文档: http://localhost:3001/api/health
echo.
echo 🎨 前端服务 / Frontend Service:
echo    URL: http://localhost:5173
echo.
echo 📖 使用说明 / Usage:
echo    1. 打开浏览器访问 http://localhost:5173
echo    2. 开始监控日志文件
echo.
echo ⛔ 停止服务 / Stop services:
echo    关闭打开的命令行窗口
echo.
echo ==================================================
echo.

REM 自动打开浏览器
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo 按任意键关闭此窗口...
pause >nul
