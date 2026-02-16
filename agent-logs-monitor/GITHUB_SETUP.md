# GitHub 仓库创建和推送指南

## 方法一：通过 GitHub 网页创建（推荐）

### 步骤 1：创建仓库
1. 访问 https://github.com/new
2. 仓库名称填写：`Agent-teams实时监控`
3. 描述填写：`实时监控 Claude Agent Teams 的全栈可视化系统，支持 Agent 通信监控、日志查看和实时更新`
4. 选择 **Public**（公开）或 **Private**（私有）
5. **不要**勾选 "Add a README file"（我们已经有了）
6. **不要**勾选 ".gitignore" 和 "license"
7. 点击 **Create repository**

### 步骤 2：推送代码
创建仓库后，GitHub 会显示推送命令。执行以下命令：

```bash
cd "D:\项目\agent_teams\agent-logs-monitor"

# 添加远程仓库（替换 USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/USERNAME/Agent-teams实时监控.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

**如果遇到仓库名称编码问题，使用英文名称：**
```bash
git remote add origin https://github.com/USERNAME/agent-teams-monitor.git
git push -u origin main
```

## 方法二：使用 GitHub CLI（如果安装了）

```bash
# 安装 GitHub CLI
# Windows: winget install --id GitHub.cli
# Mac: brew install gh
# Linux: 参考https://github.com/cli/cli#installation

# 登录
gh auth login

# 创建仓库并推送
cd "D:\项目\agent_teams\agent-logs-monitor"
gh repo create Agent-teams实时监控 --public --source=. --remote=origin --push
```

## 推送成功后

你的仓库地址将是：
```
https://github.com/USERNAME/Agent-teams实时监控
```

## 常见问题

### 1. 仓库名称中文编码问题
如果中文名称导致问题，建议使用英文名：`agent-teams-monitor`

### 2. 推送失败
```bash
# 查看远程仓库配置
git remote -v

# 如果需要修改远程地址
git remote set-url origin https://github.com/USERNAME/agent-teams-monitor.git

# 重新推送
git push -u origin main
```

### 3. 分支名称问题
某些系统默认分支可能是 `master`，统一改为 `main`：
```bash
git branch -M main
```

## 下一步

推送成功后，你可以：
1. ✅ 在 GitHub 上查看代码
2. ✅ 添加仓库描述和 Topics
3. ✅ 设置仓库可见性
4. ✅ 分享给其他人

## 仓库信息

**项目名称：** Agent-teams实时监控
**描述：** 实时监控 Claude Agent Teams 的全栈可视化系统
**技术栈：** Node.js + Express + Socket.IO + React + Vite + Tailwind CSS
**许可证：** MIT License
