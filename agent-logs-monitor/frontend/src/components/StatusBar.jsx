import React from 'react';

const StatusBar = ({ isConnected, selectedFile, logCount, lastUpdate, isInboxFile = false }) => {
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return '从未';
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - date.getTime();

    if (diff < 1000) return '刚刚';
    if (diff < 60000) return `${Math.floor(diff / 1000)}秒前`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    return date.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const countLabel = isInboxFile ? '消息数' : '日志行数';

  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-gray-400">
              {isConnected ? '已连接到服务器' : '连接断开'}
            </span>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">当前文件:</span>
              <span className="text-gray-200 font-medium">{selectedFile}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{countLabel}:</span>
            <span className="text-gray-200 font-mono">{logCount}</span>
          </div>

          {lastUpdate && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">最后更新:</span>
              <span className="text-gray-200">{formatLastUpdate(lastUpdate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
