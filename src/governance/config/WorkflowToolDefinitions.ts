/**
 * Factory class for workflow-related tool definitions
 */
export class WorkflowToolDefinitions {
  /**
   * Generate workflow and planning session tools
   */
  static getWorkflowTools() {
    return [
      {
        name: 'mcp__governance__start_planning_session',
        description: 'Start a new planning session with the specified goal',
        inputSchema: {
          type: 'object',
          properties: {
            goal: {
              type: 'string',
              description: 'The software development goal to plan',
            },
          },
          required: ['goal'],
        },
      },
      {
        name: 'mcp__governance__add_planning_thought',
        description: 'Record a thought during the planning process',
        inputSchema: {
          type: 'object',
          properties: {
            thought: {
              type: 'string',
              description: 'The thought to record',
            },
          },
          required: ['thought'],
        },
      },
      {
        name: 'mcp__governance__run_command',
        description: 'Run a system command with authorization',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The command to execute',
            },
            purpose: {
              type: 'string',
              description: 'Why this command needs to be run',
            },
          },
          required: ['command', 'purpose'],
        },
      },
    ];
  }
}