import { DocumentationApplicationService } from '../../../application/DocumentationService.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { WorkflowState, WorkflowPhase } from '../../WorkflowState.js';

/**
 * Handlers for research-related documents (Spikes)
 */
export class ResearchHandlers {
  /**
   * Create a Spike document
   */
  static async createSpike(
    state: WorkflowState,
    spikeData: {
      title: string;
      objective: string;
      background?: string;
      questions: string[];
      researchApproach?: string;
      timeBox: string;
      parentReference?: string;
      acceptanceCriteria?: string[];
      deliverables: string[];
    }
  ) {
    // Verify we're in the planning phase
    if (state.currentPhase !== WorkflowPhase.PLANNING) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot create Spike in ${state.currentPhase} phase. Must be in PLANNING phase.`
      );
    }

    try {
      // Create a DocumentationService instance
      const documentationService = new DocumentationApplicationService();
      await documentationService.initialize(); // Ensure the documentation directories are created
      
      // Call the createSpike method
      const result = await documentationService.createSpike(
        spikeData.title,
        spikeData.objective,
        spikeData.questions,
        spikeData.timeBox,
        spikeData.parentReference,
        spikeData.background,
        spikeData.researchApproach,
        spikeData.acceptanceCriteria,
        spikeData.deliverables
      );
      
      // Update the workflow state
      state.addThought(`Created Spike document: ${result.id} - ${spikeData.title}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              message: "Spike created successfully",
              id: result.id,
              filePath: result.filePath,
              title: spikeData.title
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create Spike: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}