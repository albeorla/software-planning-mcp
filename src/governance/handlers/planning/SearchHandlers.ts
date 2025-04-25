import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { WorkflowState, WorkflowPhase } from '../../WorkflowState.js';
import { GovernanceToolProxy } from '../../GovernanceToolProxy.js';

/**
 * Handlers for search related governance tools
 */
export class SearchHandlers {
  /**
   * Search code using grep or other techniques
   */
  static async searchCode(
    state: WorkflowState,
    toolProxy: GovernanceToolProxy,
    params: { 
      pattern: string;
      fileGlob?: string;
    }
  ) {
    // This can be called in planning or implementation phases
    if (state.currentPhase !== WorkflowPhase.PLANNING && 
        state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot search code in ${state.currentPhase} phase.`
      );
    }
    
    const { pattern, fileGlob } = params;
    
    // Search code using the toolProxy
    const results = await toolProxy.searchCode(pattern, fileGlob);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }
}