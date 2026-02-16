# Agent 日志监控面板 - 前端

React 实时日志监控面板，使用 Socket.IO 与后端通信。

## 技术栈

- React 18
- Vite
- Socket.IO Client
- Tailwind CSS

## 安装依赖

```bash
npm install
```

## 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

## 构建生产版本

```bash
npm run build
```

## 功能特性

- 实时日志流显示
- 多日志源切换
- 日志搜索和过滤
- 自动滚动控制
- 暗色主题界面
- 响应式布局
- 连接状态监控
- 日志统计信息

## 组件结构

```
src/
├── App.jsx                 # 主应用组件
├── components/
│   ├── LogViewer.jsx       # 日志显示组件
│   ├── LogSelector.jsx     # 日志文件选择器
│   ├── LogFilter.jsx       # 搜索和过滤栏
│   └── StatusBar.jsx       # 状态栏
├── hooks/
│   └── useLogs.js          # 日志数据管理 hook
└── styles/
    └── index.css
```

## 配置

默认连接到 `ws://localhost:3001`，可在 `useLogs.js` 中修改：

```javascript
const { ... } = useLogs('http://your-server:port');
```

## 使用说明

1. 启动后端服务（端口 3001）
2. 启动前端开发服务器
3. 在左侧选择日志文件
4. 使用顶部搜索栏过滤日志
5. 点击"自动滚动"按钮控制滚动行为
