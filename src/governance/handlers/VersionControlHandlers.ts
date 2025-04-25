import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { WorkflowState, WorkflowPhase } from '../WorkflowState.js';
import { GovernanceToolProxy } from '../GovernanceToolProxy.js';

/**
 * Handlers for version control-related governance tools
 */
export class VersionControlHandlers {
  /**
   * Commit changes for the current task
   */
  static async commitChanges(
    state: WorkflowState,
    toolProxy: GovernanceToolProxy,
    params: { message: string }
  ) {
    // Must be in the REVIEW_AND_COMMIT phase
    if (state.currentPhase !== WorkflowPhase.REVIEW_AND_COMMIT) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot commit changes in ${state.currentPhase} phase. Must be in REVIEW_AND_COMMIT phase.`
      );
    }
    
    // Ensure we have a completed task
    if (!state.currentTask) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `No completed task to commit changes for.`
      );
    }
    
    const { message } = params;
    
    // Formulate the complete commit message based on our task
    const taskId = state.currentTask.id;
    const commitMessage = `[${state.extractPrdId()}] (${taskId}) ${state.currentTask.title}\n\n${message}`;
    
    // Commit the changes through the governed_planner
    const result = await toolProxy.commitChanges(taskId, commitMessage);
    
    // Update workflow state to completed
    state.completeCommit();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: "Changes committed successfully",
            commitMessage,
            state: state.currentPhase
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Start code review process
   */
  static async startCodeReview(
    state: WorkflowState,
    params: { 
      taskId: string;
      reviewFocus?: string[];
    }
  ) {
    // This should be callable in IMPLEMENTATION or REVIEW_AND_COMMIT phase
    if (state.currentPhase !== WorkflowPhase.IMPLEMENTATION && 
        state.currentPhase !== WorkflowPhase.REVIEW_AND_COMMIT) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot start code review in ${state.currentPhase} phase. Must be in IMPLEMENTATION or REVIEW_AND_COMMIT phase.`
      );
    }
    
    const { taskId, reviewFocus } = params;
    
    // TODO: Implement calling VersionControlService to start code review
    // For now, return a placeholder response
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: "Start code review not yet implemented",
            taskId,
            reviewFocus
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Create a feature branch
   */
  static async createBranch(
    state: WorkflowState,
    params: { 
      name: string;
      baseBranch: string;
      taskId?: string;
    }
  ) {
    // This should be callable in PLANNING or IMPLEMENTATION phase
    if (state.currentPhase !== WorkflowPhase.PLANNING && 
        state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot create branch in ${state.currentPhase} phase. Must be in PLANNING or IMPLEMENTATION phase.`
      );
    }
    
    const { name, baseBranch, taskId } = params;
    
    // TODO: Implement calling VersionControlService to create branch
    // For now, return a placeholder response
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: "Create branch not yet implemented",
            name,
            baseBranch,
            taskId
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Create a pull request
   */
  static async createPullRequest(
    state: WorkflowState,
    params: { 
      title: string;
      description: string;
      sourceBranch: string;
      targetBranch: string;
      taskIds?: string[];
      reviewers?: string[];
    }
  ) {
    // This should be callable in REVIEW_AND_COMMIT phase
    if (state.currentPhase !== WorkflowPhase.REVIEW_AND_COMMIT) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot create pull request in ${state.currentPhase} phase. Must be in REVIEW_AND_COMMIT phase.`
      );
    }
    
    const { title, description, sourceBranch, targetBranch, taskIds, reviewers } = params;
    
    // TODO: Implement calling VersionControlService to create pull request
    // For now, return a placeholder response
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: "Create pull request not yet implemented",
            title,
            description,
            sourceBranch,
            targetBranch,
            taskIds,
            reviewers
          }, null, 2),
        },
      ],
    };
  }
}