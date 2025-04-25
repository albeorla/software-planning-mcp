import { WorkflowState } from '../WorkflowState.js';
import { GovernanceToolProxy } from '../GovernanceToolProxy.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { routes } from './routes.js';

/**
 * Router that handles routing governance actions to the appropriate handlers
 */
export class GovernanceRouter {
  /**
   * Route an action to the appropriate handler
   * @param action The action to route
   * @param params The action parameters
   * @param state The current workflow state
   * @param toolProxy The tool proxy for executing tool actions
   * @returns The result of the handler execution
   */
  static async routeAction(
    action: string,
    params: any,
    state: WorkflowState,
    toolProxy: GovernanceToolProxy
  ) {
    const route = routes[action];
    
    if (!route) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown governance action: ${action}`
      );
    }

    // Execute the handler for this route
    try {
      return await route.handler(state, toolProxy, params);
    } catch (error) {
      // Convert normal errors to MCP errors
      if (error instanceof McpError) {
        throw error;
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `Error handling action '${action}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}