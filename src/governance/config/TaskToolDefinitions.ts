/**
 * Factory class for task management tool definitions
 */
export class TaskToolDefinitions {
  /**
   * Generate task management tools
   */
  static getTaskTools() {
    return [
      {
        name: 'mcp__governance__create_task',
        description: 'Create an implementation task for a user story',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the task',
            },
            description: {
              type: 'string',
              description: 'Detailed description of the task',
            },
            implementationSteps: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Step-by-step implementation plan',
            },
            storyId: {
              type: 'string',
              description: 'ID of the parent user story',
            },
            filePaths: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Files that will need to be modified',
            },
            components: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Components or modules involved',
            },
            testingNotes: {
              type: 'object',
              properties: {
                unitTests: { type: 'string' },
                integrationTests: { type: 'string' },
                manualVerification: { type: 'string' },
              },
              description: 'Testing considerations',
            },
            complexity: {
              type: 'number',
              description: 'Task complexity rating',
              minimum: 1,
              maximum: 5,
            },
            codeExample: {
              type: 'string',
              description: 'Example code or pseudocode',
            },
          },
          required: ['title', 'description', 'storyId', 'complexity'],
        },
      },
      {
        name: 'mcp__governance__create_subtask',
        description: 'Create a subtask for a larger task',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the subtask',
            },
            description: {
              type: 'string',
              description: 'Detailed description of the subtask',
            },
            parentTaskId: {
              type: 'string',
              description: 'ID of the parent task',
            },
            filePaths: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Files that will need to be modified',
            },
            complexity: {
              type: 'number',
              description: 'Subtask complexity rating',
              minimum: 1,
              maximum: 3,
            },
          },
          required: ['title', 'description', 'parentTaskId', 'complexity'],
        },
      },
      {
        name: 'mcp__governance__list_tasks',
        description: 'List all available tasks',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'mcp__governance__start_implementation',
        description: 'Start implementing a selected task',
        inputSchema: {
          type: 'object',
          properties: {
            todoId: {
              type: 'string',
              description: 'ID of the task to implement',
            },
          },
          required: ['todoId'],
        },
      },
      {
        name: 'mcp__governance__track_file_read',
        description: 'Track file read access for governance purposes',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file being read',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'mcp__governance__track_file_edit',
        description: 'Track file edit access for governance purposes',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file being edited',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'mcp__governance__complete_implementation',
        description: 'Mark current task implementation as complete',
        inputSchema: {
          type: 'object',
          properties: {
            summaryPoints: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Summary points of what was implemented',
            },
          },
          required: ['summaryPoints'],
        },
      },
      {
        name: 'mcp__governance__update_task_status',
        description: 'Update the status of a task',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'ID of the task to update',
            },
            status: {
              type: 'string',
              enum: ['todo', 'in-progress', 'blocked', 'done'],
              description: 'New status for the task',
            },
            blockerDescription: {
              type: 'string',
              description: 'Description of what is blocking the task (if status is blocked)',
            },
          },
          required: ['taskId', 'status'],
        },
      },
      {
        name: 'mcp__governance__log_daily_work',
        description: 'Log daily work progress on a task',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'ID of the task being worked on',
            },
            summary: {
              type: 'string',
              description: 'Summary of work done today',
            },
            timeSpent: {
              type: 'number',
              description: 'Hours spent on this task today',
            },
            blockers: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of blockers encountered',
            },
            nextSteps: {
              type: 'array',
              items: { type: 'string' },
              description: 'Next steps for tomorrow',
            },
          },
          required: ['taskId', 'summary'],
        },
      },
    ];
  }
}