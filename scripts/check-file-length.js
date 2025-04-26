#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const MAX_LINES = 400;
const FILE_PATTERN = '*.ts';

// Get staged files
function getStagedFiles() {
  const output = execSync('git diff --staged --name-only').toString().trim();
  return output.split('\n').filter(file => file.endsWith('.ts'));
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return 0;
  }
}

function main() {
  const stagedFiles = getStagedFiles();
  
  if (stagedFiles.length === 0) {
    console.log('No TypeScript files are staged for commit.');
    process.exit(0);
  }

  let hasLongFiles = false;
  const longFiles = [];

  stagedFiles.forEach(file => {
    const lineCount = countLines(file);
    if (lineCount > MAX_LINES) {
      hasLongFiles = true;
      longFiles.push({ file, lineCount });
    }
  });

  if (hasLongFiles) {
    console.error(`\n❌ The following files exceed the maximum line count (${MAX_LINES}):`);
    longFiles.forEach(({ file, lineCount }) => {
      console.error(`  - ${file}: ${lineCount} lines`);
    });
    console.error('\nPlease refactor these files to reduce their size before committing.\n');
    process.exit(1);
  } else {
    console.log(`✅ All staged TypeScript files are under the maximum line count (${MAX_LINES}).`);
  }
}

main();