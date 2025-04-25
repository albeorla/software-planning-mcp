import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { WorkflowState } from '../WorkflowState.js';

/**
 * Handles governance resource-related requests
 */
export class ResourceHandler {
  /**
   * Handle list resources request
   * @returns List of available governance resources
   */
  static async handleListResources() {
    return {
      resources: [
        {
          uri: 'governance://workflow-state',
          name: 'Workflow State',
          description: 'Current state of the workflow including active phase, tasks, etc.',
          mimeType: 'application/json',
        },
        {
          uri: 'governance://thoughts',
          name: 'Planning Thoughts',
          description: 'Thoughts recorded during planning phase',
          mimeType: 'application/json',
        },
        {
          uri: 'governance://file-access-log',
          name: 'File Access Log',
          description: 'Log of file reads and writes during implementation',
          mimeType: 'application/json',
        },
      ],
    };
  }

  /**
   * Handle read resource request
   * @param uri The resource URI to read
   * @param state The current workflow state
   * @returns The resource contents
   */
  static async handleReadResource(uri: string, state: WorkflowState) {
    switch (uri) {
      case 'governance://workflow-state': {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(state, null, 2),
            },
          ],
        };
      }
      case 'governance://thoughts': {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({ thoughts: state.thoughts }, null, 2),
            },
          ],
        };
      }
      case 'governance://file-access-log': {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({ fileAccesses: state.fileAccesses }, null, 2),
            },
          ],
        };
      }
      default:
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Unknown resource URI: ${uri}`
        );
    }
  }
}