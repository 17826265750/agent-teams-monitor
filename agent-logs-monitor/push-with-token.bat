@echo off
echo ========================================
echo 使用 Token 推送到 GitHub
echo ========================================
echo.
set /p TOKEN="请粘贴你的 GitHub Personal Access Token: "

cd /d "%~dp0"

echo.
echo 正在配置 Git 凭据...
git remote set-url origin https://%TOKEN%@github.com/17826265750/agent-teams-monitor.git

echo.
echo 正在推送代码...
git push -u origin main

echo.
echo ========================================
echo 推送完成！
echo ========================================
echo.
echo 访问你的仓库：https://github.com/17826265750/agent-teams-monitor
echo.
pause
