import { WorkflowState } from '../WorkflowState.js';
import { GovernanceToolProxy } from '../GovernanceToolProxy.js';
import { GovernanceRouter } from '../router/GovernanceRouter.js';

/**
 * Main handler for governing action requests
 * Delegates to the router which routes to appropriate specialized handlers
 */
export class ActionHandler {
  /**
   * Handle a governance action request
   * @param action The action name (without mcp__governance__ prefix)
   * @param params The action parameters
   * @param state The current workflow state
   * @param toolProxy The tool proxy for communicating with underlying tools
   * @returns The action result
   */
  static async handleAction(
    action: string,
    params: any,
    state: WorkflowState,
    toolProxy: GovernanceToolProxy
  ) {
    return await GovernanceRouter.routeAction(action, params, state, toolProxy);
  }
}