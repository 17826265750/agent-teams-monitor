import React, { useRef, useEffect } from 'react';

const ChatViewer = ({ messages, autoScroll, logContainerRef }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getAgentColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      cyan: 'bg-cyan-500',
      pink: 'bg-pink-500',
    };
    return colors[color] || colors.blue;
  };

  const getAgentAvatar = (from, color) => {
    const initials = from.split('-').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    return (
      <div className={`w-10 h-10 rounded-full ${getAgentColor(color)} flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-md`}>
        {initials}
      </div>
    );
  };

  const parseMessage = (text) => {
    try {
      const parsed = JSON.parse(text);
      if (parsed.type === 'idle_notification') {
        return {
          type: 'idle',
          from: parsed.from,
          idleReason: parsed.idleReason
        };
      }
      return { type: 'text', content: text };
    } catch {
      return { type: 'text', content: text };
    }
  };

  const renderMessage = (msg, index) => {
    const parsed = parseMessage(msg.text);

    // 空闲通知 - 系统消息样式
    if (parsed.type === 'idle') {
      return (
        <div key={index} className="flex justify-center my-3">
          <div className="bg-gray-700/50 text-gray-400 text-xs px-4 py-1.5 rounded-full">
            {parsed.from} • {parsed.idleReason}
          </div>
        </div>
      );
    }

    // 普通消息 - 聊天气泡样式
    return (
      <div key={index} className="flex gap-3 mb-4 hover:bg-gray-800/30 p-2 rounded-lg transition-colors">
        {/* 头像 */}
        {getAgentAvatar(msg.from, msg.color)}

        {/* 消息内容 */}
        <div className="flex-1 min-w-0">
          {/* 发送者和时间 */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`font-semibold text-sm ${getAgentColor(msg.color).replace('bg-', 'text-')}`}>
              {msg.from}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(msg.timestamp)}
            </span>
          </div>

          {/* 消息气泡 */}
          <div className="bg-gray-700/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <div className="text-sm text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
              {parsed.content}
            </div>
          </div>
        </div>

        {/* 状态指示 */}
        {msg.read !== undefined && (
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${msg.read ? 'bg-green-500' : 'bg-gray-600'}`} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={logContainerRef}
      className="flex-1 overflow-auto custom-scrollbar bg-gradient-to-b from-gray-900 to-gray-950 p-4"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <svg
              className="mx-auto h-16 w-16 mb-4 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-lg mb-1">暂无消息</p>
            <p className="text-sm">等待 agent 通讯...</p>
          </div>
        </div>
      ) : (
        <>
          {/* 日期分组标题 */}
          {messages.length > 0 && (
            <div className="flex justify-center mb-4">
              <div className="bg-gray-800/80 text-gray-400 text-xs px-3 py-1 rounded-full shadow-sm">
                {new Date(messages[0].timestamp).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          )}

          {/* 消息列表 */}
          <div className="space-y-1 max-w-4xl mx-auto">
            {messages.map((msg, index) => renderMessage(msg, index))}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatViewer;
