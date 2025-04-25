import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { WorkflowState, WorkflowPhase } from '../../WorkflowState.js';

/**
 * Handlers for sprint related governance tools
 */
export class SprintHandlers {
  /**
   * Create a new sprint with selected stories/tasks
   */
  static async createSprint(
    state: WorkflowState,
    sprintData: {
      sprintId: string;
      goal: string;
      startDate: string;
      endDate: string;
      teamMembers: string[];
      capacityPoints?: number;
      stories: {
        id: string;
        title: string;
        complexity: number;
        tasks: {
          id: string;
          title: string;
          complexity: number;
        }[];
      }[];
      risks?: string[];
      successMetrics?: string[];
    }
  ) {
    // Verify we're in the planning phase
    if (state.currentPhase !== WorkflowPhase.PLANNING) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot create Sprint in ${state.currentPhase} phase. Must be in PLANNING phase.`
      );
    }
    
    // TODO: Implement calling DocumentationService to create Sprint
    // For now, return a placeholder response
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: "Sprint creation not yet implemented",
            sprintData
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Get information about a sprint
   */
  static async getSprintInfo(
    params: { sprintId: string }
  ) {
    // This can be called in any phase as it's a read operation
    
    const { sprintId } = params;
    
    // TODO: Implement calling DocumentationService to get Sprint info
    // For now, return a placeholder response
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: "Get Sprint info not yet implemented",
            sprintId
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Update sprint status with completed work
   */
  static async updateSprintStatus(
    params: { 
      sprintId: string;
      completedTaskIds: string[];
      progressSummary?: string;
    }
  ) {
    // This can be called in any phase
    
    const { sprintId, completedTaskIds, progressSummary } = params;
    
    // TODO: Implement calling DocumentationService to update sprint status
    // For now, return a placeholder response
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: "Update sprint status not yet implemented",
            sprintId,
            completedTaskIds,
            progressSummary
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Log daily work for a task
   */
  static async logDailyWork(
    state: WorkflowState,
    params: { 
      taskId: string;
      summary: string;
      timeSpent?: number;
      blockers?: string[];
      nextSteps?: string[];
    }
  ) {
    // This should be callable in IMPLEMENTATION phase
    if (state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot log daily work in ${state.currentPhase} phase. Must be in IMPLEMENTATION phase.`
      );
    }
    
    const { taskId, summary, timeSpent, blockers, nextSteps } = params;
    
    // TODO: Implement calling DocumentationService to log daily work
    // For now, return a placeholder response
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: "Log daily work not yet implemented",
            taskId,
            summary,
            timeSpent,
            blockers,
            nextSteps
          }, null, 2),
        },
      ],
    };
  }
}