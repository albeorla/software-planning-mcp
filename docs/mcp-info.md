# MCP Integration Guide

## Overview

This document provides comprehensive information about the Multi-Channel Proxy (MCP) implementation in the Software Planning Tool, including available tools, integration patterns, and usage examples.

## MCP Architecture

The Software Planning Tool implements a governance-based MCP architecture that enables Claude to interact with the system through well-defined tools while enforcing workflow constraints and best practices.

### Key Components

1. **GovernanceServer**: Central server that coordinates all MCP interactions
2. **GovernanceToolProxy**: Proxy that handles Claude's requests to governance tools
3. **ActionHandler**: Central dispatcher that routes commands to appropriate handlers
4. **Specialized Handlers**: Domain-specific handlers organized by bounded context
5. **WorkflowState**: Enforces workflow phases and transitions

## Available MCP Tools

The following tools are available through the MCP integration:

### Planning Tools

- **mcp__governance__start_planning_session**: Begins a planning session
- **mcp__governance__add_planning_thought**: Records thoughts during planning
- **mcp__governance__run_command**: Executes commands within planning session
- **mcp__governance__create_prd**: Creates a Product Requirements Document
- **mcp__governance__create_epic**: Creates an Epic document
- **mcp__governance__create_story**: Creates a User Story document
- **mcp__governance__create_task**: Creates a Task document
- **mcp__governance__create_subtask**: Creates a Subtask document
- **mcp__governance__create_spike**: Creates a Spike/research document

### Roadmap Tools

- **mcp__governance__create_roadmap**: Creates a new roadmap
- **mcp__governance__get_roadmap**: Retrieves a roadmap by ID
- **mcp__governance__list_roadmaps**: Lists all available roadmaps
- **mcp__governance__add_timeframe**: Adds a timeframe to a roadmap
- **mcp__governance__add_initiative**: Adds an initiative to a timeframe
- **mcp__governance__add_roadmap_item**: Adds an item to an initiative
- **mcp__governance__create_roadmap_note**: Creates a roadmap note
- **mcp__governance__get_roadmap_note**: Retrieves a roadmap note
- **mcp__governance__update_roadmap_note**: Updates a roadmap note
- **mcp__governance__list_roadmap_notes**: Lists all roadmap notes

### Sprint Tools

- **mcp__governance__create_sprint**: Creates a new sprint
- **mcp__governance__get_sprint_info**: Retrieves sprint information
- **mcp__governance__update_sprint_status**: Updates sprint status

### Implementation Tools

- **mcp__governance__start_implementation**: Begins task implementation
- **mcp__governance__track_file_read**: Tracks file reads
- **mcp__governance__track_file_edit**: Tracks file edits
- **mcp__governance__update_task_status**: Updates task status
- **mcp__governance__log_daily_work**: Logs daily work progress
- **mcp__governance__complete_implementation**: Completes task implementation

### Version Control Tools

- **mcp__governance__commit_changes**: Commits changes
- **mcp__governance__create_branch**: Creates a new branch
- **mcp__governance__create_pull_request**: Creates a pull request
- **mcp__governance__start_code_review**: Begins code review

## Governance Workflow

The governance server enforces a structured workflow with distinct phases:

1. **Planning Phase**:
   - Start planning sessions
   - Record thinking processes
   - Create documentation (PRDs, Epics, Stories, etc.)
   - Define tasks for implementation

2. **Implementation Phase**:
   - Start implementation of specific tasks
   - Track file operations
   - Update task status
   - Log daily work

3. **Review and Commit Phase**:
   - Complete implementation
   - Review code changes
   - Create branches and pull requests
   - Commit changes

4. **Completed Phase**:
   - Update sprint status
   - Finalize documentation

## Integration Patterns

### Handler-based Architecture

The MCP implements a handler-based architecture where each tool invocation is routed to a specialized handler:

```typescript
// Example handler implementation
export class RoadmapManagementHandlers {
  constructor(
    private roadmapService: RoadmapApplicationService,
    private storage: RoadmapJsonFileStorage
  ) {}

  public async createRoadmap(params: CreateRoadmapParams): Promise<CreateRoadmapResult> {
    // Implementation...
  }

  // Other handler methods...
}
```

### Command Validation

Commands are validated before execution to ensure they meet requirements:

```typescript
// Example command validation
export class CommandValidator {
  public static validateCreateRoadmap(params: any): CreateRoadmapParams {
    if (!params.title) {
      throw new Error('Roadmap title is required');
    }
    
    // Other validation...
    
    return params as CreateRoadmapParams;
  }
}
```

### Tool Definitions

Tools are defined using a factory pattern with category-based organization:

```typescript
// Example tool definition
export class RoadmapToolDefinitions {
  public static getDefinitions(): ToolDefinition[] {
    return [
      {
        name: 'mcp__governance__create_roadmap',
        description: 'Creates a new roadmap',
        parameters: {
          title: { type: 'string', description: 'Roadmap title' },
          description: { type: 'string', description: 'Roadmap description' },
          // Other parameters...
        },
      },
      // Other tool definitions...
    ];
  }
}
```

## Usage Examples

### Creating a Roadmap

```typescript
const result = await claude.runTool('mcp__governance__create_roadmap', {
  title: 'Product Roadmap 2025',
  description: 'Strategic roadmap for 2025 product development',
  version: '1.0',
  owner: 'Product Team'
});
```

### Adding Planning Thoughts

```typescript
const result = await claude.runTool('mcp__governance__add_planning_thought', {
  sessionId: 'session-123',
  thought: 'We should focus on performance improvements in Q2',
  thoughtNumber: 3,
  totalThoughts: 5
});
```

### Tracking File Operations

```typescript
// Before reading a file
const tracking = await claude.runTool('mcp__governance__track_file_read', {
  taskId: 'task-123',
  filePath: '/path/to/file.ts',
  purpose: 'Understanding the current implementation'
});

// Now read the file
const fileContent = await claude.runTool('Read', {
  file_path: '/path/to/file.ts'
});
```

## Implementation Status

The current implementation status of MCP tools is as follows:

- ** Planning tools**: Fully implemented
- ** Roadmap tools**: Fully implemented
- **  Sprint tools**: API framework implemented, backend needs completion
- **  Implementation tools**: Partially implemented, some backend work needed
- **  Version Control tools**: API framework implemented, backend needs completion

## Best Practices

1. **Always follow the workflow**: Use tools in the correct sequence according to the workflow phases
2. **Track file operations**: Always use tracking tools before reading or editing files
3. **Record thinking**: Use planning thoughts to document reasoning and decision-making
4. **Create documentation first**: Create proper documentation before implementation
5. **Update task status**: Keep task status updated during implementation

## Conclusion

The MCP integration in the Software Planning Tool provides a robust framework for Claude to interact with the system while following structured workflows and best practices. The handler-based architecture ensures clean separation of concerns, while the domain model provides a rich representation of planning concepts and relationships.