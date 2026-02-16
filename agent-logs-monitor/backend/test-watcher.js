const chokidar = require('chokidar');
const path = require('path');
const os = require('os');

const testDir = path.join(os.homedir(), '.claude', 'teams');
console.log('Testing Chokidar on:', testDir);

const watcher = chokidar.watch(path.join(testDir, '**', '*.json'), {
  persistent: true,
  ignoreInitial: false,
  usePolling: true,
  interval: 100,
});

console.log('Watcher created');

watcher.on('add', (path) => console.log('[ADD]', path));
watcher.on('change', (path) => console.log('[CHANGE]', path));
watcher.on('error', (error) => console.error('[ERROR]', error));
watcher.on('ready', () => {
  console.log('[READY] Initial scan complete');
  const watched = watcher.getWatched();
  console.log('[WATCHED]', Object.keys(watched));
  console.log('[WATCHED COUNT]', Object.keys(watched).length);

  // Stop after 5 seconds
  setTimeout(() => {
    console.log('[STOPPING] Closing watcher');
    watcher.close();
    process.exit(0);
  }, 5000);
});
