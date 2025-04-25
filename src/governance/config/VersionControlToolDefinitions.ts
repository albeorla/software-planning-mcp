/**
 * Factory class for version control tool definitions
 */
export class VersionControlToolDefinitions {
  /**
   * Generate version control tools
   */
  static getVersionControlTools() {
    return [
      {
        name: 'mcp__governance__start_code_review',
        description: 'Initiate a code review for implemented changes',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'ID of the task to review',
            },
            reviewFocus: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Areas to focus on during review',
            },
          },
          required: ['taskId'],
        },
      },
      {
        name: 'mcp__governance__commit_changes',
        description: 'Commit changes to the repository',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Commit message',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'mcp__governance__create_branch',
        description: 'Create a new git branch for a feature or task',
        inputSchema: {
          type: 'object',
          properties: {
            branchName: {
              type: 'string',
              description: 'Name for the new branch',
            },
            baseBranch: {
              type: 'string',
              description: 'Branch to base the new branch on',
              default: 'main',
            },
            taskId: {
              type: 'string',
              description: 'ID of the related task',
            },
          },
          required: ['branchName'],
        },
      },
      {
        name: 'mcp__governance__create_pull_request',
        description: 'Create a pull request for review',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Title of the pull request',
            },
            description: {
              type: 'string',
              description: 'Description of the changes',
            },
            sourceBranch: {
              type: 'string',
              description: 'Source branch containing the changes',
            },
            targetBranch: {
              type: 'string',
              description: 'Target branch for the pull request',
              default: 'main',
            },
            reviewers: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of requested reviewers',
            },
            taskIds: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'IDs of tasks included in this PR',
            },
          },
          required: ['title', 'description', 'sourceBranch'],
        },
      },
    ];
  }
}