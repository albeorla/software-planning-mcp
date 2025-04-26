#!/usr/bin/env node

/**
 * Simple test script that launches the governance server via the inspector
 * and prints information about available tools.
 */
console.log('Starting simple governance server test...');

import { spawnSync } from 'child_process';

// Run the governance server with the inspector and capture output
const result = spawnSync('npx', [
  '@modelcontextprotocol/inspector',
  'build/governance-server.js',
  '--list-tools'
], { 
  stdio: 'pipe',
  encoding: 'utf-8' 
});

if (result.error) {
  console.error('Error running inspector:', result.error);
  process.exit(1);
}

console.log('Inspector stdout:');
console.log(result.stdout);

if (result.stderr) {
  console.log('Inspector stderr:');
  console.log(result.stderr);
}

console.log('Test completed');