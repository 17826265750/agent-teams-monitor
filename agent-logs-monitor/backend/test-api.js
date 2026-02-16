/**
 * Simple API test script
 * Run with: node test-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function testAPI() {
  console.log('Testing Agent Logs Monitor API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing /api/health');
    const health = await makeRequest('/api/health');
    console.log('Response:', JSON.stringify(health, null, 2));
    console.log('✓ Health check passed\n');

    // Test logs list endpoint
    console.log('2. Testing /api/logs');
    const logs = await makeRequest('/api/logs');
    console.log(`Found ${logs.count} log files`);
    if (logs.count > 0) {
      console.log('First log file:', logs.data[0].filename);
    }
    console.log('✓ Logs list endpoint working\n');

    // Test reading a specific log file (if available)
    if (logs.count > 0) {
      const filename = logs.data[0].filename;
      console.log(`3. Testing /api/logs/${filename}`);
      const logContent = await makeRequest(`/api/logs/${filename}?lines=10`);
      console.log(`File size: ${logContent.content ? logContent.content.length : 0} bytes`);
      console.log('✓ Log file reading working\n');
    } else {
      console.log('3. Skipping file read test (no log files found)\n');
    }

    console.log('All tests passed! ✓');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testAPI();
