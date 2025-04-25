import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { WorkflowState, WorkflowPhase } from '../../WorkflowState.js';
import { GovernanceToolProxy } from '../../GovernanceToolProxy.js';

/**
 * Handlers for planning session related governance tools
 */
export class SessionHandlers {
  /**
   * Start a new planning session
   */
  static async startPlanningSession(
    state: WorkflowState,
    toolProxy: GovernanceToolProxy,
    params: { goal: string }
  ) {
    // Verify workflow state allows starting a planning session
    if (state.currentPhase !== WorkflowPhase.IDLE && state.currentPhase !== WorkflowPhase.COMPLETED) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot start planning session in ${state.currentPhase} phase. Complete or reset current workflow first.`
      );
    }
    
    const { goal } = params;
    
    // Start the planning session through the governed_planner
    const result = await toolProxy.startPlanning(goal);
    
    // Update workflow state
    state.startPlanningSession(goal);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: "Planning session started successfully",
            state: state.currentPhase,
            planningPrompt: result
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Add a thought during the planning process
   */
  static async addPlanningThought(
    state: WorkflowState,
    toolProxy: GovernanceToolProxy,
    params: { thought: string }
  ) {
    // Verify we're in the planning phase
    if (state.currentPhase !== WorkflowPhase.PLANNING) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot add planning thought in ${state.currentPhase} phase. Must be in PLANNING phase.`
      );
    }
    
    const { thought } = params;
    
    // Record the thought through the governed_planner
    const result = await toolProxy.addThought(thought);
    
    // Update state
    state.addThought(thought);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: "Thought recorded successfully",
            thoughtCount: state.thoughts.length
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Run a command (restricted based on current phase)
   */
  static async runCommand(
    state: WorkflowState,
    toolProxy: GovernanceToolProxy,
    params: { 
      command: string;
      purpose: string;
    },
    isCommandAllowedInCurrentPhase: (command: string, purpose: string) => boolean
  ) {
    const { command, purpose } = params;
    
    // Validate the command based on current phase
    if (!isCommandAllowedInCurrentPhase(command, purpose)) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Command '${command}' is not allowed in the ${state.currentPhase} phase.`
      );
    }
    
    // Execute the command using the toolProxy
    const result = await toolProxy.runCommand(command);
    
    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }
}