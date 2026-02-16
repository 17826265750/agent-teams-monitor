import React from 'react';
import LogSelector from './components/LogSelector';
import LogViewer from './components/LogViewer';
import ChatViewer from './components/ChatViewer';
import LogFilter from './components/LogFilter';
import StatusBar from './components/StatusBar';
import { useLogs } from './hooks/useLogs';

function App() {
  const {
    logs,
    messages,
    isInboxFile,
    availableFiles,
    selectedFile,
    isConnected,
    filter,
    setFilter,
    autoScroll,
    setAutoScroll,
    selectFile,
    clearLogs,
    logContainerRef,
    stats,
  } = useLogs();

  // Get last update timestamp based on file type
  const lastUpdate = isInboxFile
    ? (messages.length > 0 ? messages[messages.length - 1].timestamp : null)
    : (logs.length > 0 ? logs[logs.length - 1].timestamp : null);

  // Get count based on file type
  const itemCount = isInboxFile ? messages.length : logs.length;

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h1 className="text-xl font-bold text-gray-100">
              Agent 日志监控面板
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            实时监控系统日志
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Log Selector */}
        <LogSelector
          availableFiles={availableFiles}
          selectedFile={selectedFile}
          onSelectFile={selectFile}
          isConnected={isConnected}
        />

        {/* Main Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filter Bar */}
          <LogFilter
            filter={filter}
            onFilterChange={setFilter}
            autoScroll={autoScroll}
            onAutoScrollChange={setAutoScroll}
            onClearLogs={clearLogs}
            logCount={itemCount}
            stats={stats}
            isInboxFile={isInboxFile}
          />

          {/* Viewer - Chat or Logs based on file type */}
          {isInboxFile ? (
            <ChatViewer
              ref={logContainerRef}
              messages={messages}
              autoScroll={autoScroll}
            />
          ) : (
            <LogViewer
              ref={logContainerRef}
              logs={logs}
              autoScroll={autoScroll}
            />
          )}

          {/* Status Bar */}
          <StatusBar
            isConnected={isConnected}
            selectedFile={selectedFile}
            logCount={itemCount}
            lastUpdate={lastUpdate}
            isInboxFile={isInboxFile}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
