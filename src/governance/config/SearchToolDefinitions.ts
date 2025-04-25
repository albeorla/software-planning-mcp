/**
 * Factory class for code search tool definitions
 */
export class SearchToolDefinitions {
  /**
   * Generate code search tools
   */
  static getSearchTools() {
    return [
      {
        name: 'mcp__governance__search_code',
        description: 'Search for code matching a pattern',
        inputSchema: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Search pattern or regex',
            },
            fileGlob: {
              type: 'string',
              description: 'Optional file glob pattern to filter search',
            },
          },
          required: ['pattern'],
        },
      },
    ];
  }
}