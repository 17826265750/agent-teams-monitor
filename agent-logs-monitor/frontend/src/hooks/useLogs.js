import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useLogs = (socketUrl = 'http://localhost:3001') => {
  const [logs, setLogs] = useState([]);
  const [messages, setMessages] = useState([]); // Chat messages for inbox files
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isInboxFile, setIsInboxFile] = useState(false); // Detect if current file is inbox
  const socketRef = useRef(null);
  const logContainerRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(socketUrl);

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket] Connected to server');
      // Request logs list on connect
      socketRef.current.emit('request:logs');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('[Socket] Disconnected from server');
    });

    socketRef.current.on('connected', (data) => {
      console.log('[Socket] Server message:', data.message);
    });

    socketRef.current.on('logs:list', (files) => {
      console.log('[Socket] Received files list:', files);
      setAvailableFiles(files);
      if (files.length > 0 && !selectedFile) {
        setSelectedFile(files[0].filename);
        // Load initial logs for first file
        loadInitialLogs(files[0].filename);
      }
    });

    socketRef.current.on('log:update', (data) => {
      // Check if this is an inbox file update
      const isInbox = data.filename.includes('inbox') || data.filename.includes('inboxes');

      if (isInbox && selectedFile && selectedFile.includes('inbox')) {
        // Parse inbox content directly from Socket.IO event (faster than refetching)
        try {
          const messageArray = JSON.parse(data.content);
          setMessages(messageArray);
        } catch (e) {
          console.error('[Socket] Error parsing inbox JSON:', e);
          // Fallback: reload entire file
          loadInitialLogs(selectedFile);
        }
      } else {
        // Regular log file - parse lines
        const lines = data.content.split('\n').filter(line => line.trim());
        const timestamp = data.timestamp || new Date().toISOString();

        setLogs(prev => {
          const newLogs = [...prev];
          lines.forEach(line => {
            newLogs.push({
              message: line,
              timestamp,
              filename: data.filename
            });
          });
          // Keep only last 1000 logs to prevent memory issues
          if (newLogs.length > 1000) {
            return newLogs.slice(-1000);
          }
          return newLogs;
        });
      }
    });

    socketRef.current.on('log:new', (data) => {
      console.log('[Socket] New file detected:', data);
      // Refresh file list
      socketRef.current.emit('request:logs');
    });

    socketRef.current.on('log:delete', (data) => {
      console.log('[Socket] File deleted:', data);
      // Refresh file list
      socketRef.current.emit('request:logs');
    });

    socketRef.current.on('error', (error) => {
      console.error('[Socket] Error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [socketUrl]);

  // Function to load initial logs for a file
  const loadInitialLogs = async (filename) => {
    try {
      const response = await fetch(`${socketUrl}/api/logs/${filename}`);
      const data = await response.json();
      if (data.success) {
        // Check if this is an inbox file (contains 'inbox' in path)
        const isInbox = filename.includes('inbox') || filename.includes('inboxes');
        setIsInboxFile(isInbox);

        if (isInbox) {
          // Parse JSON array for chat messages
          try {
            const messageArray = JSON.parse(data.content);
            setMessages(messageArray);
            setLogs([]); // Clear regular logs
          } catch (e) {
            console.error('Error parsing inbox JSON:', e);
            // Fallback to regular log display
            const lines = data.content.split('\n').filter(line => line.trim());
            const logs = lines.map(line => ({
              message: line,
              timestamp: new Date().toISOString(),
              filename
            }));
            setLogs(logs);
            setMessages([]);
          }
        } else {
          // Regular log file
          const lines = data.content.split('\n').filter(line => line.trim());
          const logs = lines.map(line => ({
            message: line,
            timestamp: new Date().toISOString(),
            filename
          }));
          setLogs(logs);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('[Socket] Error loading initial logs:', error);
    }
  };

  // Auto-scroll to bottom when new logs or messages arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      // Use setTimeout to ensure DOM has updated before scrolling
      setTimeout(() => {
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
      }, 10);
    }
  }, [logs, messages, autoScroll]);

  const selectFile = (fileName) => {
    setSelectedFile(fileName);
    setLogs([]); // Clear logs when switching files
    setMessages([]); // Clear messages when switching files
    loadInitialLogs(fileName);
  };

  const clearLogs = () => {
    setLogs([]);
    setMessages([]);
  };

  // Filter logs and messages
  const filteredLogs = filter
    ? logs.filter(log =>
        log.message && log.message.toLowerCase().includes(filter.toLowerCase())
      )
    : logs;

  // Filter messages for inbox files
  const filteredMessages = filter
    ? messages.filter(m =>
        m.text && m.text.toLowerCase().includes(filter.toLowerCase())
      )
    : messages;

  // Calculate stats based on file type
  const stats = isInboxFile ? {
    total: messages.length,
    errors: 0,
    warnings: 0,
    info: messages.length
  } : {
    total: logs.length,
    errors: logs.filter(l => l.message && (
      l.message.toLowerCase().includes('error') ||
      l.message.toLowerCase().includes('失败') ||
      l.message.toLowerCase().includes('异常')
    )).length,
    warnings: logs.filter(l => l.message && (
      l.message.toLowerCase().includes('warn') ||
      l.message.toLowerCase().includes('警告')
    )).length,
    info: logs.filter(l => l.message && (
      l.message.toLowerCase().includes('info') ||
      l.message.toLowerCase().includes('信息')
    )).length,
  };

  return {
    logs: filteredLogs,
    allLogs: logs,
    messages: filteredMessages,
    allMessages: messages,
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
  };
};
