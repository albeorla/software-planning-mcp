#!/usr/bin/env node

/**
 * Test script for the governance server to verify workflow and tool functionality
 * 
 * This script simulates Claude interactions with the governance server by sending
 * MCP requests directly to test the workflow enforcement and tool functionality.
 */
import { MCPClient } from '@modelcontextprotocol/sdk/client/index.js';
import { connectStdio } from '@modelcontextprotocol/sdk/client/stdio.js';

async function runTest() {
  console.log('Starting governance server test...');
  
  // Connect to the MCP server on stdio
  const client = new MCPClient();
  const transport = await connectStdio('../../build/governance-server.js');
  await client.connect(transport);
  
  console.log('Connected to governance server');
  
  try {
    // 1. List available tools to verify server is working
    console.log('\n1. Listing available tools:');
    const tools = await client.listTools();
    console.log(`Found ${tools.length} governance tools`);
    
    // 2. Start planning session (IDLE -> PLANNING)
    console.log('\n2. Starting planning session:');
    const planningResult = await client.callTool('mcp__governance__start_planning_session', {
      title: 'Add Value Objects',
      description: 'Implement value objects to replace primitive types in domain model'
    });
    console.log('Planning session started:', planningResult);
    
    // 3. Add planning thought
    console.log('\n3. Adding planning thought:');
    const thoughtResult = await client.callTool('mcp__governance__add_planning_thought', {
      thought: 'We should start by implementing Priority and Status value objects'
    });
    console.log('Planning thought added:', thoughtResult);
    
    // 4. Create PRD
    console.log('\n4. Creating PRD:');
    const prdResult = await client.callTool('mcp__governance__create_prd', {
      title: 'Value Objects Implementation',
      description: 'Replace primitive types with proper value objects for better domain modeling'
    });
    console.log('PRD created:', prdResult);
    
    // 5. Create task
    console.log('\n5. Creating task:');
    const taskResult = await client.callTool('mcp__governance__create_task', {
      title: 'Implement Priority value object',
      description: 'Create a Priority value object to replace string primitive',
      complexity: 2
    });
    console.log('Task created:', taskResult);
    
    // 6. Start implementation (PLANNING -> IMPLEMENTATION)
    console.log('\n6. Starting implementation:');
    const implementationResult = await client.callTool('mcp__governance__start_implementation', {
      taskId: taskResult.taskId
    });
    console.log('Implementation started:', implementationResult);
    
    // 7. Track file read
    console.log('\n7. Tracking file read:');
    const readResult = await client.callTool('mcp__governance__track_file_read', {
      filePath: '/src/domain/entities/roadmap/RoadmapInitiative.ts'
    });
    console.log('File read tracked:', readResult);
    
    // 8. Track file edit
    console.log('\n8. Tracking file edit:');
    const editResult = await client.callTool('mcp__governance__track_file_edit', {
      filePath: '/src/domain/entities/roadmap/RoadmapInitiative.ts'
    });
    console.log('File edit tracked:', editResult);
    
    // 9. Complete implementation (IMPLEMENTATION -> REVIEW)
    console.log('\n9. Completing implementation:');
    const completeResult = await client.callTool('mcp__governance__complete_implementation', {
      taskId: taskResult.taskId,
      summaryPoints: ['Created Priority value object', 'Updated existing entities to use new value object']
    });
    console.log('Implementation completed:', completeResult);
    
    // 10. Test enforcement by trying to add a planning thought in REVIEW phase
    console.log('\n10. Testing enforcement (should fail):');
    try {
      const enforcementResult = await client.callTool('mcp__governance__add_planning_thought', {
        thought: 'This should fail because we are in REVIEW phase'
      });
      console.log('Enforcement test failed - tool call succeeded when it should have failed');
    } catch (error) {
      console.log('Enforcement test passed - tool call failed as expected:', error.message);
    }
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close the connection
    await transport.close();
  }
}

runTest().catch(console.error);