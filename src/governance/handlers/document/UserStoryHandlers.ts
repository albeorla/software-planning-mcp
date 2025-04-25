import { DocumentationApplicationService } from '../../../application/DocumentationService.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { WorkflowState, WorkflowPhase } from '../../WorkflowState.js';

/**
 * Handlers for user story-related documents
 */
export class UserStoryHandlers {
  /**
   * Create a User Story document
   */
  static async createStory(
    state: WorkflowState,
    storyData: {
      title: string;
      userType: string;
      action: string;
      benefit: string;
      description?: string;
      epicId: string;
      acceptanceCriteria?: {
        scenario: string;
        given: string;
        when: string;
        then: string;
      }[];
      complexity: number;
    }
  ) {
    // Verify we're in the planning phase
    if (state.currentPhase !== WorkflowPhase.PLANNING) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot create User Story in ${state.currentPhase} phase. Must be in PLANNING phase.`
      );
    }

    try {
      // Create a DocumentationService instance
      const documentationService = new DocumentationApplicationService();
      await documentationService.initialize(); // Ensure the documentation directories are created
      
      // Call the createUserStory method
      const result = await documentationService.createUserStory(
        storyData.title,
        storyData.userType,
        storyData.action,
        storyData.benefit,
        storyData.epicId
      );
      
      // Update the workflow state with additional story details
      state.addThought(`Created User Story document: ${result.id} - ${storyData.title} (Complexity: ${storyData.complexity})`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              message: "User Story created successfully",
              id: result.id,
              filePath: result.filePath,
              title: storyData.title,
              userStory: `As a ${storyData.userType}, I want to ${storyData.action}, so that ${storyData.benefit}`,
              complexity: storyData.complexity
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create User Story: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}