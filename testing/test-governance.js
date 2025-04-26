#!/usr/bin/env node

/**
 * Comprehensive test script for the Governance MCP server
 * 
 * This script tests each aspect of the governance workflow, including:
 * - Server initialization
 * - Tool registration
 * - Workflow phase transitions
 * - Phase enforcement (tool validation)
 * - Document creation
 * - File tracking
 * - Error handling
 */

import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import http from 'http';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Define console colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function for colored console output
function logStatus(message, status) {
  const statusColor = status === 'PASS' ? colors.green : colors.red;
  console.log(`${colors.blue}[TEST]${colors.reset} ${message}: ${statusColor}${status}${colors.reset}`);
}

// Function to make a tool call to the MCP server
async function callTool(serverProcess, name, args) {
  return new Promise((resolve, reject) => {
    const request = {
      jsonrpc: '2.0',
      method: 'callTool',
      params: {
        name: `mcp__governance__${name}`,
        arguments: args
      },
      id: Date.now()
    };
    
    // Write request to server's stdin
    serverProcess.stdin.write(JSON.stringify(request) + '\n');
    
    // Set up response handling
    let responseData = '';
    
    const timeout = setTimeout(() => {
      reject(new Error('Tool call timed out'));
    }, 5000);
    
    function handleData(data) {
      responseData += data.toString();
      
      try {
        // Check if we have a complete JSON response
        JSON.parse(responseData);
        
        // If parsing succeeded, we have a complete response
        serverProcess.stdout.removeListener('data', handleData);
        clearTimeout(timeout);
        
        try {
          resolve(JSON.parse(responseData));
        } catch (err) {
          reject(new Error(`Invalid JSON response: ${responseData}`));
        }
      } catch (err) {
        // Incomplete JSON, keep collecting data
      }
    }
    
    serverProcess.stdout.on('data', handleData);
  });
}

// Function to list tools using the MCP server
async function listTools(serverProcess) {
  return new Promise((resolve, reject) => {
    const request = {
      jsonrpc: '2.0',
      method: 'listTools',
      params: {},
      id: Date.now()
    };
    
    // Write request to server's stdin
    serverProcess.stdin.write(JSON.stringify(request) + '\n');
    
    // Set up response handling
    let responseData = '';
    
    const timeout = setTimeout(() => {
      reject(new Error('List tools timed out'));
    }, 5000);
    
    function handleData(data) {
      responseData += data.toString();
      
      try {
        // Check if we have a complete JSON response
        JSON.parse(responseData);
        
        // If parsing succeeded, we have a complete response
        serverProcess.stdout.removeListener('data', handleData);
        clearTimeout(timeout);
        
        try {
          resolve(JSON.parse(responseData));
        } catch (err) {
          reject(new Error(`Invalid JSON response: ${responseData}`));
        }
      } catch (err) {
        // Incomplete JSON, keep collecting data
      }
    }
    
    serverProcess.stdout.on('data', handleData);
  });
}

// Main test function
async function runTests() {
  console.log(`${colors.magenta}=== Governance MCP Server Test Suite ===${colors.reset}`);
  console.log(`${colors.blue}Starting tests at ${new Date().toISOString()}${colors.reset}`);
  
  // Collect test results
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  function recordResult(testName, result, details = '') {
    if (result) {
      results.passed++;
      logStatus(testName, 'PASS');
    } else {
      results.failed++;
      logStatus(testName, 'FAIL');
    }
    
    results.details.push({
      name: testName,
      result: result ? 'PASS' : 'FAIL',
      details
    });
    
    if (details) {
      console.log(`${colors.cyan}└─ ${details}${colors.reset}`);
    }
  }
  
  try {
    // 1. Test server initialization
    console.log(`\n${colors.cyan}[1] Testing server initialization${colors.reset}`);
    
    const serverProcess = spawn('node', ['build/governance-server.js'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Set a flag for server startup
    let serverStarted = false;
    
    // Listen for server startup message
    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Governance MCP server running on stdio')) {
        serverStarted = true;
      }
    });
    
    // Wait a moment for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    recordResult('Server initialization', serverStarted, 
      serverStarted ? 'Server started successfully' : 'Server failed to start or did not output expected message');
    
    if (!serverStarted) {
      // If server didn't start, stop testing
      throw new Error('Server initialization failed, cannot continue tests');
    }
    
    // 2. Test tool registration
    console.log(`\n${colors.cyan}[2] Testing tool registration${colors.reset}`);
    
    try {
      const toolsResponse = await listTools(serverProcess);
      
      const toolsRegistered = toolsResponse && 
                             toolsResponse.result && 
                             toolsResponse.result.tools && 
                             Array.isArray(toolsResponse.result.tools) &&
                             toolsResponse.result.tools.length > 0;
      
      const toolCount = toolsRegistered ? toolsResponse.result.tools.length : 0;
      
      recordResult('Tool registration', toolsRegistered, 
        toolsRegistered ? `Server registered ${toolCount} tools` : 'Server failed to register tools');
      
      if (toolsRegistered) {
        // Check for required tools
        const requiredTools = [
          'mcp__governance__start_planning_session',
          'mcp__governance__add_planning_thought',
          'mcp__governance__create_task',
          'mcp__governance__track_file_read',
          'mcp__governance__track_file_edit'
        ];
        
        const registeredToolNames = toolsResponse.result.tools.map(t => t.name);
        
        let allRequiredToolsFound = true;
        requiredTools.forEach(toolName => {
          const hasRequired = registeredToolNames.includes(toolName);
          if (!hasRequired) {
            allRequiredToolsFound = false;
            console.log(`${colors.yellow}└─ Missing required tool: ${toolName}${colors.reset}`);
          }
        });
        
        recordResult('Required tools registration', allRequiredToolsFound,
          allRequiredToolsFound ? 'All required tools registered' : 'Some required tools missing');
      }
    } catch (error) {
      recordResult('Tool registration', false, `Error: ${error.message}`);
    }
    
    // 3. Test workflow phase transitions
    console.log(`\n${colors.cyan}[3] Testing workflow phase transitions${colors.reset}`);
    
    // 3.1 Start planning session (IDLE → PLANNING)
    try {
      const planningResponse = await callTool(serverProcess, 'start_planning_session', {
        goal: 'Implement value objects for domain model'
      });
      
      const planningSuccess = planningResponse && 
                             planningResponse.result && 
                             planningResponse.result.content &&
                             planningResponse.result.content[0] &&
                             planningResponse.result.content[0].text;
      
      let planningStateCorrect = false;
      let planningDetails = '';
      
      if (planningSuccess) {
        try {
          const content = JSON.parse(planningResponse.result.content[0].text);
          planningStateCorrect = content.state === 'PLANNING';
          planningDetails = planningStateCorrect ? 
            'Successfully transitioned to PLANNING phase' : 
            `Unexpected state: ${content.state}`;
        } catch {
          planningDetails = 'Could not parse response content';
        }
      } else {
        planningDetails = 'Failed to start planning session';
      }
      
      recordResult('Phase transition: IDLE → PLANNING', planningSuccess && planningStateCorrect, planningDetails);
    } catch (error) {
      recordResult('Phase transition: IDLE → PLANNING', false, `Error: ${error.message}`);
    }
    
    // Create a task for the next step
    let taskId = null;
    try {
      const taskResponse = await callTool(serverProcess, 'create_task', {
        title: 'Implement Priority value object',
        description: 'Create a Priority value object to replace string primitive',
        complexity: 2
      });
      
      const taskSuccess = taskResponse && 
                         taskResponse.result && 
                         taskResponse.result.content &&
                         taskResponse.result.content[0] &&
                         taskResponse.result.content[0].text;
      
      if (taskSuccess) {
        try {
          const content = JSON.parse(taskResponse.result.content[0].text);
          taskId = content.taskId || content.id;
        } catch {
          // Ignore parsing errors
        }
      }
      
      recordResult('Task creation', taskSuccess && taskId, 
        taskId ? `Successfully created task with ID: ${taskId}` : 'Failed to create task or get task ID');
    } catch (error) {
      recordResult('Task creation', false, `Error: ${error.message}`);
    }
    
    // 3.2 Start implementation (PLANNING → IMPLEMENTATION)
    if (taskId) {
      try {
        const implResponse = await callTool(serverProcess, 'start_implementation', {
          taskId: taskId
        });
        
        const implSuccess = implResponse && 
                           implResponse.result && 
                           implResponse.result.content &&
                           implResponse.result.content[0] &&
                           implResponse.result.content[0].text;
        
        let implStateCorrect = false;
        let implDetails = '';
        
        if (implSuccess) {
          try {
            const content = JSON.parse(implResponse.result.content[0].text);
            implStateCorrect = content.state === 'IMPLEMENTATION';
            implDetails = implStateCorrect ? 
              'Successfully transitioned to IMPLEMENTATION phase' : 
              `Unexpected state: ${content.state}`;
          } catch {
            implDetails = 'Could not parse response content';
          }
        } else {
          implDetails = 'Failed to start implementation';
        }
        
        recordResult('Phase transition: PLANNING → IMPLEMENTATION', implSuccess && implStateCorrect, implDetails);
      } catch (error) {
        recordResult('Phase transition: PLANNING → IMPLEMENTATION', false, `Error: ${error.message}`);
      }
      
      // 3.3 Test file tracking
      console.log(`\n${colors.cyan}[4] Testing file tracking${colors.reset}`);
      
      // 4.1 Track file read
      try {
        const readResponse = await callTool(serverProcess, 'track_file_read', {
          filePath: '/src/domain/entities/Task.ts'
        });
        
        const readSuccess = readResponse && 
                           readResponse.result && 
                           readResponse.result.content &&
                           readResponse.result.content[0] &&
                           readResponse.result.content[0].text;
        
        recordResult('File read tracking', readSuccess, 
          readSuccess ? 'Successfully tracked file read' : 'Failed to track file read');
      } catch (error) {
        recordResult('File read tracking', false, `Error: ${error.message}`);
      }
      
      // 4.2 Track file edit
      try {
        const editResponse = await callTool(serverProcess, 'track_file_edit', {
          filePath: '/src/domain/entities/Task.ts'
        });
        
        const editSuccess = editResponse && 
                           editResponse.result && 
                           editResponse.result.content &&
                           editResponse.result.content[0] &&
                           editResponse.result.content[0].text;
        
        recordResult('File edit tracking', editSuccess, 
          editSuccess ? 'Successfully tracked file edit' : 'Failed to track file edit');
      } catch (error) {
        recordResult('File edit tracking', false, `Error: ${error.message}`);
      }
      
      // 3.4 Complete implementation (IMPLEMENTATION → REVIEW_AND_COMMIT)
      try {
        const completeResponse = await callTool(serverProcess, 'complete_implementation', {
          summaryPoints: ['Implemented Priority value object', 'Updated existing entities']
        });
        
        const completeSuccess = completeResponse && 
                               completeResponse.result && 
                               completeResponse.result.content &&
                               completeResponse.result.content[0] &&
                               completeResponse.result.content[0].text;
        
        recordResult('Phase transition: IMPLEMENTATION → REVIEW_AND_COMMIT', completeSuccess, 
          completeSuccess ? 'Successfully transitioned to REVIEW_AND_COMMIT phase' : 'Failed to complete implementation');
      } catch (error) {
        recordResult('Phase transition: IMPLEMENTATION → REVIEW_AND_COMMIT', false, `Error: ${error.message}`);
      }
      
      // 3.5 Commit changes (REVIEW_AND_COMMIT → COMPLETED)
      try {
        const commitResponse = await callTool(serverProcess, 'commit_changes', {
          message: 'Implement Priority value object'
        });
        
        const commitSuccess = commitResponse && 
                             commitResponse.result && 
                             commitResponse.result.content &&
                             commitResponse.result.content[0] &&
                             commitResponse.result.content[0].text;
        
        recordResult('Phase transition: REVIEW_AND_COMMIT → COMPLETED', commitSuccess, 
          commitSuccess ? 'Successfully transitioned to COMPLETED phase' : 'Failed to commit changes');
      } catch (error) {
        recordResult('Phase transition: REVIEW_AND_COMMIT → COMPLETED', false, `Error: ${error.message}`);
      }
    }
    
    // 5. Test phase enforcement
    console.log(`\n${colors.cyan}[5] Testing phase enforcement${colors.reset}`);
    
    // First restart planning to ensure we're in PLANNING phase
    try {
      await callTool(serverProcess, 'start_planning_session', {
        goal: 'Test phase enforcement'
      });
      
      // Now attempt to use an implementation tool in planning phase
      try {
        const invalidToolResponse = await callTool(serverProcess, 'track_file_read', {
          filePath: '/some/file.ts'
        });
        
        // This should fail, so success of the test means we got an error
        const enforcementWorking = invalidToolResponse && 
                                  invalidToolResponse.error && 
                                  invalidToolResponse.error.message;
        
        recordResult('Phase enforcement: Implementation tool in Planning phase', enforcementWorking, 
          enforcementWorking ? `Correctly rejected with error: ${invalidToolResponse.error.message}` : 
                              'Failed to enforce phase restriction');
      } catch (error) {
        // We actually expect an error here, so this is a success
        recordResult('Phase enforcement: Implementation tool in Planning phase', true, 
          `Correctly rejected with error: ${error.message}`);
      }
    } catch (error) {
      recordResult('Phase enforcement setup', false, `Error setting up phase: ${error.message}`);
    }
    
    // 6. Test error handling
    console.log(`\n${colors.cyan}[6] Testing error handling${colors.reset}`);
    
    // 6.1 Test non-existent tool
    try {
      const invalidToolResponse = await callTool(serverProcess, 'nonexistent_tool', {});
      
      // This should fail
      recordResult('Error handling: Non-existent tool', false, 
        'Failed to reject non-existent tool');
    } catch (error) {
      // We expect an error here
      recordResult('Error handling: Non-existent tool', true, 
        `Correctly rejected with error: ${error.message}`);
    }
    
    // 6.2 Test missing required parameters
    try {
      // Start planning without required goal parameter
      const invalidParamsResponse = await callTool(serverProcess, 'start_planning_session', {});
      
      // This should fail
      recordResult('Error handling: Missing required parameters', false, 
        'Failed to reject missing parameters');
    } catch (error) {
      // We expect an error here
      recordResult('Error handling: Missing required parameters', true, 
        `Correctly rejected with error: ${error.message}`);
    }
    
    // Shut down the server
    serverProcess.kill();
    
    // Final summary
    console.log(`\n${colors.magenta}=== Test Results Summary ===${colors.reset}`);
    console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
    console.log(`${colors.blue}Total: ${results.passed + results.failed}${colors.reset}`);
    
    // Update the test report
    const testReport = await fs.promises.readFile(resolve(__dirname, 'governance-test-report.md'), 'utf8');
    
    let updatedReport = testReport;
    
    // Update actual results in the report
    results.details.forEach(detail => {
      const searchKey = `**Status**: [PASS/FAIL]`;
      const replaceWith = `**Status**: ${detail.result}`;
      updatedReport = updatedReport.replace(searchKey, replaceWith);
      
      if (detail.name.includes('Server initialization')) {
        const searchKey = `**Actual Result**: [To be filled when executed]`;
        const replaceWith = `**Actual Result**: ${detail.details}`;
        updatedReport = updatedReport.replace(searchKey, replaceWith);
      }
      
      // More replacements could be added here for other tests
    });
    
    // Update summary table in the report
    const summarySection = `## Summary of Findings

Overall test results summary:

| Component | Status | Notes |
|-----------|--------|-------|
| Server Initialization | [PASS/FAIL] | |
| Tool Registration | [PASS/FAIL] | |
| Workflow Transitions | [PASS/FAIL] | |
| Phase Enforcement | [PASS/FAIL] | |
| Document Creation | [PASS/FAIL] | |
| File Tracking | [PASS/FAIL] | |
| Error Handling | [PASS/FAIL] | |`;
    
    const serverInit = results.details.find(d => d.name === 'Server initialization')?.result || 'FAIL';
    const toolReg = results.details.find(d => d.name === 'Tool registration')?.result || 'FAIL';
    const workflowTrans = results.details.some(d => d.name.includes('Phase transition')) ? 
      (results.details.filter(d => d.name.includes('Phase transition')).every(d => d.result === 'PASS') ? 'PASS' : 'PARTIAL') : 'FAIL';
    const phaseEnf = results.details.find(d => d.name.includes('Phase enforcement'))?.result || 'FAIL';
    const docCreate = results.details.find(d => d.name === 'Task creation')?.result || 'FAIL';
    const fileTrack = results.details.some(d => d.name.includes('File') && d.name.includes('tracking')) ?
      (results.details.filter(d => d.name.includes('File') && d.name.includes('tracking')).every(d => d.result === 'PASS') ? 'PASS' : 'PARTIAL') : 'FAIL';
    const errorHandling = results.details.some(d => d.name.includes('Error handling')) ?
      (results.details.filter(d => d.name.includes('Error handling')).every(d => d.result === 'PASS') ? 'PASS' : 'PARTIAL') : 'FAIL';
    
    const updatedSummary = `## Summary of Findings

Overall test results summary:

| Component | Status | Notes |
|-----------|--------|-------|
| Server Initialization | ${serverInit} | |
| Tool Registration | ${toolReg} | |
| Workflow Transitions | ${workflowTrans} | |
| Phase Enforcement | ${phaseEnf} | |
| Document Creation | ${docCreate} | |
| File Tracking | ${fileTrack} | |
| Error Handling | ${errorHandling} | |`;
    
    updatedReport = updatedReport.replace(summarySection, updatedSummary);
    
    // Add the test script
    updatedReport = updatedReport.replace('```javascript\n// Test script contents to be filled in based on tests\n```', 
      `\`\`\`javascript\n${fs.readFileSync(__filename, 'utf8')}\n\`\`\``);
    
    // Write the updated report
    await fs.promises.writeFile(resolve(__dirname, 'governance-test-report.md'), updatedReport);
    
    console.log(`\n${colors.blue}Test report updated at: ${resolve(__dirname, 'governance-test-report.md')}${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);