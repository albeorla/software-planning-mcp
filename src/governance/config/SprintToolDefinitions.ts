/**
 * Factory class for sprint planning tool definitions
 */
export class SprintToolDefinitions {
  /**
   * Generate sprint planning tools
   */
  static getSprintTools() {
    return [
      {
        name: 'mcp__governance__create_sprint',
        description: 'Create a new sprint with selected stories and tasks',
        inputSchema: {
          type: 'object',
          properties: {
            sprintId: {
              type: 'string',
              description: 'Sprint identifier (e.g., "Sprint 1")',
            },
            goal: {
              type: 'string',
              description: 'The sprint goal',
            },
            startDate: {
              type: 'string',
              description: 'Sprint start date (YYYY-MM-DD)',
            },
            endDate: {
              type: 'string',
              description: 'Sprint end date (YYYY-MM-DD)',
            },
            teamMembers: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Team members participating in this sprint',
            },
            capacityPoints: {
              type: 'number',
              description: 'Total capacity in story points',
            },
            stories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  complexity: { type: 'number' },
                  tasks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        complexity: { type: 'number' },
                      },
                      required: ['id', 'title', 'complexity'],
                    },
                  },
                },
                required: ['id', 'title', 'complexity', 'tasks'],
              },
              description: 'Stories included in this sprint with their tasks',
            },
            risks: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Identified risks for this sprint',
            },
            successMetrics: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Metrics to determine sprint success',
            },
          },
          required: ['sprintId', 'goal', 'startDate', 'endDate', 'teamMembers', 'stories'],
        },
      },
      {
        name: 'mcp__governance__get_sprint_info',
        description: 'Get detailed information about a sprint',
        inputSchema: {
          type: 'object',
          properties: {
            sprintId: {
              type: 'string',
              description: 'ID of the sprint to retrieve',
            },
          },
          required: ['sprintId'],
        },
      },
      {
        name: 'mcp__governance__update_sprint_status',
        description: 'Update the status of a sprint',
        inputSchema: {
          type: 'object',
          properties: {
            sprintId: {
              type: 'string',
              description: 'ID of the sprint to update',
            },
            completedTaskIds: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'IDs of completed tasks',
            },
            progressSummary: {
              type: 'string',
              description: 'Summary of sprint progress',
            },
          },
          required: ['sprintId', 'completedTaskIds'],
        },
      },
    ];
  }
}