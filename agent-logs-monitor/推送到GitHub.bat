@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 推送 Agent-teams Monitor 到 GitHub
echo ========================================
echo.
echo 仓库地址：https://github.com/17826265750/agent-teams-monitor
echo.
echo ⚠️  请准备好你的 GitHub Personal Access Token
echo    获取地址：https://github.com/settings/tokens/new
echo.
set /p TOKEN="请粘贴你的 Token (ghp_xxxx): "

if "%TOKEN%"=="" (
    echo.
    echo ❌ Token 不能为空！
    pause
    exit /b 1
)

cd /d "%~dp0"

echo.
echo 📡 正在配置 Git 远程仓库...
git remote set-url origin https://%TOKEN%@github.com/17826265750/agent-teams-monitor.git

if errorlevel 1 (
    echo.
    echo ❌ 配置远程仓库失败！
    pause
    exit /b 1
)

echo.
echo ⬆️  正在推送代码到 GitHub...
echo 这可能需要几分钟，请稍候...
echo.

git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ 推送失败！
    echo.
    echo 可能的原因：
    echo 1. Token 无效或过期
    echo 2. 网络连接问题
    echo 3. 仓库名称错误
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 推送成功！
echo ========================================
echo.
echo 🎉 你的代码已成功上传到 GitHub！
echo.
echo 📍 仓库地址：https://github.com/17826265750/agent-teams-monitor
echo.
echo 接下来你可以：
echo - 在 GitHub 上查看代码
echo - 添加仓库描述和 Topics
echo - 分享给其他人
echo.
pause
