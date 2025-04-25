import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { WorkflowState, WorkflowPhase } from '../../WorkflowState.js';
import { GovernanceToolProxy } from '../../GovernanceToolProxy.js';

/**
 * Handlers for file operation-related tasks
 */
export class FileOperationHandlers {
  /**
   * Track file read access within the implementation phase
   */
  static async trackFileRead(
    state: WorkflowState,
    toolProxy: GovernanceToolProxy,
    params: {
      filePath: string;
    }
  ) {
    // Must be in implementation phase
    if (state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot track file reads in ${state.currentPhase} phase. Must be in IMPLEMENTATION phase.`
      );
    }
    
    const { filePath } = params;
    
    // Just track the file access - the actual reading is done directly by Claude
    await toolProxy.trackFileRead(filePath);
    
    // Record this file access in our state for tracking
    state.addFileAccess(filePath, 'read');
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: `File read access to ${filePath} has been tracked`,
            phase: state.currentPhase,
            currentTask: state.currentTask?.id
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Track file edit within the implementation phase
   */
  static async trackFileEdit(
    state: WorkflowState,
    toolProxy: GovernanceToolProxy,
    params: {
      filePath: string;
    }
  ) {
    // Must be in implementation phase
    if (state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot track file edits in ${state.currentPhase} phase. Must be in IMPLEMENTATION phase.`
      );
    }
    
    const { filePath } = params;
    
    // Just track the file modification - the actual editing is done directly by Claude
    await toolProxy.trackFileEdit(filePath);
    
    // Record this file modification in our state
    state.addFileAccess(filePath, 'write');
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: `File modification to ${filePath} has been tracked`,
            phase: state.currentPhase,
            currentTask: state.currentTask?.id
          }, null, 2),
        },
      ],
    };
  }
}