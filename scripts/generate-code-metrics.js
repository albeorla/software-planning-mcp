#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Function to count lines in a file
async function countLinesInFile(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    return content.split('\n').length;
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err}`);
    return 0;
  }
}

// Function to get description for a file
function getDescriptionForFile(filePath) {
  const fileNameMap = {
    'src/governance/GovernanceServer.ts': 'Main Governance Server class that configures and runs the MCP server',
    'src/governance/handlers/ActionHandler.ts': 'Central handler that routes action requests to appropriate specialized handlers',
    'src/governance/handlers/task/TaskCreationHandlers.ts': 'Handlers for creating tasks and subtasks',
    'src/governance/GovernanceToolProxy.ts': 'Proxy for communicating with underlying tools and services',
    'src/governance/handlers/task/TaskManagementHandlers.ts': 'Handlers for managing tasks (list/start/complete implementation)',
    'src/governance/handlers/VersionControlHandlers.ts': 'Handlers for version control operations (commit/branch/PR)',
    'src/governance/handlers/document/RequirementsHandlers.ts': 'Handlers for requirements documents (PRD/Epic)',
    'src/governance/WorkflowState.ts': 'State management for the workflow phases and context',
    'src/governance/handlers/planning/SprintHandlers.ts': 'Handlers for sprint-related operations',
    'src/governance/handlers/planning/SessionHandlers.ts': 'Handlers for planning session management operations',
    'src/governance/handlers/task/FileOperationHandlers.ts': 'Handlers for file read/write tracking operations',
    'src/governance/handlers/document/UserStoryHandlers.ts': 'Handlers for user story document operations',
    'src/governance/handlers/document/ResearchHandlers.ts': 'Handlers for research-related documents (Spikes)',
    'src/governance/handlers/planning/SearchHandlers.ts': 'Handlers for code search operations',
    'src/governance/handlers/index.ts': 'Export index for all handlers',
    'src/governance/handlers/task/index.ts': 'Export index for task handlers',
    'src/governance/handlers/planning/index.ts': 'Export index for planning handlers',
    'src/governance/handlers/document/index.ts': 'Export index for document handlers'
  };

  // Try to find an exact match
  if (fileNameMap[filePath]) {
    return fileNameMap[filePath];
  }

  // Get filename
  const fileName = path.basename(filePath);
  
  // Generate generic description based on file name
  if (fileName.includes('Repository')) {
    return `Data repository for ${fileName.replace('Repository.ts', '')}`;
  } else if (fileName.includes('Service')) {
    return `Service for ${fileName.replace('Service.ts', '')} operations`;
  } else if (fileName.includes('Handler')) {
    return `Handler for ${fileName.replace('Handler.ts', '')} operations`;
  } else if (fileName.endsWith('.ts')) {
    const baseName = fileName.replace('.ts', '');
    return `${baseName} implementation`;
  }
  
  return 'No description available';
}

// Function to explore directory and collect metrics
async function exploreDirectory(dirPath, results = []) {
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      // Skip node_modules and build directories
      if (entry.name !== 'node_modules' && entry.name !== 'build') {
        await exploreDirectory(fullPath, results);
      }
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      const linesOfCode = await countLinesInFile(fullPath);
      const description = getDescriptionForFile(relativePath);
      
      results.push({
        file_path: relativePath,
        description,
        lines_of_code: linesOfCode
      });
    }
  }
  
  return results;
}

async function generateMetrics() {
  try {
    const srcPath = path.join(rootDir, 'src');
    let metrics = await exploreDirectory(srcPath);
    
    // Sort by lines of code in descending order
    metrics.sort((a, b) => b.lines_of_code - a.lines_of_code);
    
    // Output as CSV
    console.log('file_path,description,lines_of_code');
    for (const item of metrics) {
      console.log(`${item.file_path},${item.description},${item.lines_of_code}`);
    }
  } catch (err) {
    console.error('Error generating metrics:', err);
  }
}

generateMetrics();