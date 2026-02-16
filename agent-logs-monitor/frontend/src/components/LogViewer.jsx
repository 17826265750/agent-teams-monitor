import React, { forwardRef } from 'react';

const LogViewer = ({ logs, autoScroll }, ref) => {
  // Detect log level from message content
  const detectLevel = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('error') || msg.includes('失败') || msg.includes('异常') || msg.includes('fatal')) {
      return 'ERROR';
    }
    if (msg.includes('warn') || msg.includes('警告') || msg.includes(' caution')) {
      return 'WARN';
    }
    if (msg.includes('info') || msg.includes('信息')) {
      return 'INFO';
    }
    if (msg.includes('debug')) {
      return 'DEBUG';
    }
    return 'DEFAULT';
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-400 bg-red-400/10';
      case 'WARN':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'INFO':
        return 'text-blue-400 bg-blue-400/10';
      case 'DEBUG':
        return 'text-gray-400 bg-gray-400/10';
      default:
        return 'text-gray-300';
    }
  };

  const getLevelBadge = (level) => {
    const colors = {
      ERROR: 'bg-red-500/20 text-red-400 border-red-500/30',
      WARN: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      INFO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      DEBUG: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      DEFAULT: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
    return colors[level] || colors.DEFAULT;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      ref={ref}
      className="flex-1 overflow-auto custom-scrollbar font-mono text-sm bg-gray-950 p-4"
    >
      {logs.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>等待日志数据...</p>
            <p className="text-xs mt-2">选择一个日志文件开始监控</p>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {logs.map((log, index) => {
            const level = log.level || detectLevel(log.message);
            return (
              <div
                key={index}
                className={`flex items-start gap-3 px-3 py-2 rounded hover:bg-gray-800/50 transition-colors ${getLevelColor(
                  level
                )}`}
              >
                <span className="text-gray-500 text-xs shrink-0 mt-0.5">
                  {formatTimestamp(log.timestamp)}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold border rounded shrink-0 ${getLevelBadge(
                  level
                )}`}
                >
                  {level}
                </span>
                <span className="flex-1 break-words">{log.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default forwardRef(LogViewer);
