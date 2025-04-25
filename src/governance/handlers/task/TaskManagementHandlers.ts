import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { WorkflowState, WorkflowPhase } from '../../WorkflowState.js';
import { GovernanceToolProxy } from '../../GovernanceToolProxy.js';

/**
 * Handlers for task management-related governance tools
 */
export class TaskManagementHandlers {
  /**
   * Start implementing a task
   */
  static async startImplementation(
    state: WorkflowState,
    toolProxy: GovernanceToolProxy,
    params: {
      todoId: string
    }
  ) {
    // Can transition from planning to implementation or switch tasks within implementation
    if (state.currentPhase !== WorkflowPhase.PLANNING && 
        state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot start implementation in ${state.currentPhase} phase.`
      );
    }
    
    const { todoId } = params;
    
    // Get the specific task info to verify it exists
    const tasks = await toolProxy.getTodos();
    const taskToImplement = tasks.find(t => t.id === todoId);
    
    if (!taskToImplement) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Task with ID ${todoId} not found.`
      );
    }
    
    // Update the workflow state to implementation phase with this task
    state.startImplementation(todoId, taskToImplement);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: `Started implementation of task ${todoId}`,
            task: taskToImplement
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Complete implementation of the current task
   */
  static async completeImplementation(
    state: WorkflowState,
    toolProxy: GovernanceToolProxy,
    params: {
      summaryPoints: string[];
    }
  ) {
    // Must be in implementation phase
    if (state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot complete implementation in ${state.currentPhase} phase. Must be in IMPLEMENTATION phase.`
      );
    }
    
    // Ensure we have an active task
    if (!state.currentTask) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `No active implementation task to complete.`
      );
    }
    
    const { summaryPoints } = params;
    
    // Complete the task through the governed_planner
    const result = await toolProxy.completeTask(
      state.currentTask.id, 
      summaryPoints
    );
    
    // Update workflow state
    state.completeImplementation();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: `Task ${state.currentTask.id} completed successfully`,
            summaryPoints,
            state: state.currentPhase
          }, null, 2),
        },
      ],
    };
  }

  /**
   * List all tasks in the current plan
   */
  static async listTasks(
    state: WorkflowState,
    toolProxy: GovernanceToolProxy
  ) {
    // This can be called in planning or implementation phases
    if (state.currentPhase !== WorkflowPhase.PLANNING && 
        state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot list tasks in ${state.currentPhase} phase.`
      );
    }
    
    // Get tasks through the governed_planner
    const tasks = await toolProxy.getTodos();
    
    // Update state with latest tasks
    state.updateTasks(tasks);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(tasks, null, 2),
        },
      ],
    };
  }

  /**
   * Update the status of a task
   */
  static async updateTaskStatus(
    state: WorkflowState,
    params: { 
      taskId: string;
      status: 'todo' | 'in-progress' | 'blocked' | 'done';
      blockerDescription?: string;
    }
  ) {
    // This should be callable in IMPLEMENTATION phase
    if (state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot update task status in ${state.currentPhase} phase. Must be in IMPLEMENTATION phase.`
      );
    }
    
    const { taskId, status, blockerDescription } = params;
    
    // Validate that blockerDescription is provided when status is 'blocked'
    if (status === 'blocked' && !blockerDescription) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Blocker description is required when status is 'blocked'.`
      );
    }
    
    // TODO: Implement calling PlanningService to update task status
    // For now, return a placeholder response
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: "Update task status not yet implemented",
            taskId,
            status,
            blockerDescription
          }, null, 2),
        },
      ],
    };
  }
}