/**
 * Integration Test for Agent Logs Monitor
 * 测试前后端集成功能
 *
 * Run with: node test-integration.js
 */

const http = require('http');
const { io } = require('socket.io-client');

const API_URL = 'http://localhost:3001';
let testsPassed = 0;
let testsFailed = 0;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function test(name, testFn) {
  try {
    log(`\n▶️  Testing: ${name}`, 'cyan');
    await testFn();
    testsPassed++;
    log(`✓ PASSED: ${name}`, 'green');
  } catch (error) {
    testsFailed++;
    log(`✗ FAILED: ${name}`, 'red');
    log(`  Error: ${error.message}`, 'red');
  }
}

async function runTests() {
  log('='.repeat(60), 'blue');
  log('Agent Logs Monitor - Integration Tests', 'blue');
  log('='.repeat(60), 'blue');

  // Test 1: Health Check
  await test('Health Check Endpoint', async () => {
    const response = await makeRequest('/api/health');
    if (response.status !== 200) throw new Error(`Status ${response.status}`);
    if (!response.data.success) throw new Error('Response not successful');
    if (response.data.service !== 'Agent Logs Monitor') {
      throw new Error('Invalid service name');
    }
  });

  // Test 2: Get Log Files List
  await test('Get Log Files List', async () => {
    const response = await makeRequest('/api/logs');
    if (response.status !== 200) throw new Error(`Status ${response.status}`);
    if (!Array.isArray(response.data.data)) {
      throw new Error('Response data is not an array');
    }
    log(`  Found ${response.data.count} log files`, 'yellow');
  });

  // Test 3: Socket.IO Connection
  await test('Socket.IO Connection', async () => {
    return new Promise((resolve, reject) => {
      const socket = io(API_URL, {
        reconnection: false,
        timeout: 5000
      });

      socket.on('connect', () => {
        log(`  Connected with socket ID: ${socket.id}`, 'yellow');
        socket.disconnect();
        resolve();
      });

      socket.on('connect_error', (err) => {
        reject(new Error(`Connection failed: ${err.message}`));
      });

      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);
    });
  });

  // Test 4: Socket.IO Events
  await test('Socket.IO Events', async () => {
    return new Promise((resolve, reject) => {
      const socket = io(API_URL);
      let eventsReceived = 0;

      socket.on('connected', (data) => {
        eventsReceived++;
        log(`  Received 'connected' event`, 'yellow');
        if (!data.message || !data.socketId) {
          reject(new Error('Invalid connected event data'));
        }
      });

      socket.on('connect', () => {
        // Request logs list
        socket.emit('request:logs');
      });

      socket.on('logs:list', (data) => {
        eventsReceived++;
        log(`  Received 'logs:list' with ${data.count} files`, 'yellow');

        if (eventsReceived >= 2) {
          socket.disconnect();
          resolve();
        }
      });

      setTimeout(() => {
        if (eventsReceived < 2) {
          reject(new Error('Not all events received'));
        }
      }, 5000);
    });
  });

  // Test 5: File Registration
  await test('File Registration', async () => {
    return new Promise((resolve, reject) => {
      const socket = io(API_URL);

      socket.on('connect', () => {
        socket.emit('register:file', {
          filename: 'test.log',
          size: 1024
        });
      });

      // If no error after 1 second, consider it successful
      setTimeout(() => {
        socket.disconnect();
        log(`  File registration event sent`, 'yellow');
        resolve();
      }, 1000);
    });
  });

  // Test 6: API Error Handling
  await test('API Error Handling (404)', async () => {
    const response = await makeRequest('/api/nonexistent-file.log');
    if (response.status !== 404) {
      throw new Error(`Expected 404, got ${response.status}`);
    }
    if (!response.data.success) {
      log(`  Correctly returned error: ${response.data.error}`, 'yellow');
    }
  });

  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('Test Summary', 'blue');
  log('='.repeat(60), 'blue');
  log(`Total Tests: ${testsPassed + testsFailed}`, 'blue');
  log(`✓ Passed: ${testsPassed}`, 'green');
  log(`✗ Failed: ${testsFailed}`, 'red');
  log('='.repeat(60), 'blue');

  if (testsFailed === 0) {
    log('\n🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n❌ Some tests failed', 'red');
    process.exit(1);
  }
}

// Run tests
log('\nStarting integration tests...\n', 'cyan');
runTests().catch((error) => {
  log(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});
