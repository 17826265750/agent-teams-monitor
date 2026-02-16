@echo off
echo ========================================
echo 推送代码到 GitHub
echo ========================================
echo.
echo 正在推送代码到 https://github.com/17826265750/agent-teams-monitor
echo.
echo 请确保你已经在 GitHub 上创建了名为 'agent-teams-monitor' 的仓库
echo.
pause

cd /d "%~dp0"

echo.
echo 步骤 1: 检查 Git 状态...
git status

echo.
echo 步骤 2: 推送到 GitHub...
git push -u origin main

echo.
echo ========================================
echo 推送完成！
echo ========================================
echo.
echo 访问你的仓库：https://github.com/17826265750/agent-teams-monitor
echo.
pause
