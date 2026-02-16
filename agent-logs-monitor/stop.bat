@echo off
REM Agent Logs Monitor - 停止脚本 / Stop Script
REM Windows 版本

chcp 65001 >nul
cls

echo ==================================================
echo   Agent Logs Monitor - 停止服务 / Stopping...
echo ==================================================
echo.

REM 查找并停止后端进程 (端口 3001)
echo 🛑 停止后端服务...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /PID %%a /F >nul 2>nul
)
echo ✓ 后端服务已停止

echo.

REM 查找并停止前端进程 (端口 5173)
echo 🛑 停止前端服务...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /PID %%a /F >nul 2>nul
)
echo ✓ 前端服务已停止

echo.
echo ==================================================
echo ✅ 所有服务已停止
echo ==================================================
echo.

pause
