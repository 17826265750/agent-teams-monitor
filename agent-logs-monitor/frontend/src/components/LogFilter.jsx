import React from 'react';

const LogFilter = ({
  filter,
  onFilterChange,
  autoScroll,
  onAutoScrollChange,
  onClearLogs,
  logCount,
  stats,
  isInboxFile = false,
}) => {
  const placeholder = isInboxFile ? "搜索消息内容..." : "搜索日志内容...";
  const countLabel = isInboxFile ? "消息" : "总计";

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 pl-10 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Auto Scroll Toggle */}
        <button
          onClick={() => onAutoScrollChange(!autoScroll)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            autoScroll
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          自动滚动
        </button>

        {/* Clear Logs Button */}
        <button
          onClick={onClearLogs}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          清空日志
        </button>

        {/* Stats Display */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{countLabel}:</span>
            <span className="font-mono text-gray-100">{stats.total}</span>
          </div>
          {!isInboxFile && (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-gray-400">错误:</span>
                <span className="font-mono text-red-400">{stats.errors}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-gray-400">警告:</span>
                <span className="font-mono text-yellow-400">{stats.warnings}</span>
              </div>
            </>
          )}
          {isInboxFile && stats.total > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-gray-400">实时通讯</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogFilter;
