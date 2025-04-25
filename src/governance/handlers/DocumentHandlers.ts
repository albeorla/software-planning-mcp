import { DocumentationApplicationService } from '../../application/DocumentationService.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { WorkflowState, WorkflowPhase } from '../WorkflowState.js';

/**
 * Handlers for document-related governance tools
 */
export class DocumentHandlers {
  /**
   * Create a Product Requirements Document (PRD)
   */
  static async createPRD(
    state: WorkflowState,
    prdData: {
      title: string;
      goal: string;
      scope: string;
      businessRequirements: string[];
      technicalRequirements?: {
        functional: string[];
        nonFunctional: string[];
      };
      acceptanceCriteria?: string[];
    }
  ) {
    // Verify we're in the planning phase
    if (state.currentPhase !== WorkflowPhase.PLANNING) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot create PRD in ${state.currentPhase} phase. Must be in PLANNING phase.`
      );
    }

    try {
      // Create a DocumentationService instance
      const documentationService = new DocumentationApplicationService();
      await documentationService.initialize(); // Ensure the documentation directories are created
      
      // Combine business and technical requirements into a single description
      let descriptionContent = `## Goal\n${prdData.goal}\n\n`;
      descriptionContent += `## Scope\n${prdData.scope}\n\n`;
      
      descriptionContent += "## Business Requirements\n";
      prdData.businessRequirements.forEach((req, index) => {
        descriptionContent += `${index + 1}. ${req}\n`;
      });
      
      if (prdData.technicalRequirements) {
        descriptionContent += "\n## Technical Requirements\n";
        
        if (prdData.technicalRequirements.functional && prdData.technicalRequirements.functional.length > 0) {
          descriptionContent += "\n### Functional\n";
          prdData.technicalRequirements.functional.forEach((req, index) => {
            descriptionContent += `${index + 1}. ${req}\n`;
          });
        }
        
        if (prdData.technicalRequirements.nonFunctional && prdData.technicalRequirements.nonFunctional.length > 0) {
          descriptionContent += "\n### Non-Functional\n";
          prdData.technicalRequirements.nonFunctional.forEach((req, index) => {
            descriptionContent += `${index + 1}. ${req}\n`;
          });
        }
      }
      
      if (prdData.acceptanceCriteria && prdData.acceptanceCriteria.length > 0) {
        descriptionContent += "\n## Acceptance Criteria\n";
        prdData.acceptanceCriteria.forEach((criteria, index) => {
          descriptionContent += `${index + 1}. ${criteria}\n`;
        });
      }
      
      // Call the createPRD method
      const result = await documentationService.createPRD(
        prdData.title,
        descriptionContent
      );
      
      // Update the workflow state
      state.addThought(`Created PRD document: ${result.id} - ${prdData.title}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              message: "PRD created successfully",
              id: result.id,
              filePath: result.filePath,
              title: prdData.title
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create PRD: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Create an Epic document
   */
  static async createEpic(
    state: WorkflowState,
    epicData: {
      title: string;
      goal: string;
      scope: string;
      outOfScope?: string;
      prdIds: string[];
      rationale?: string;
    }
  ) {
    // Verify we're in the planning phase
    if (state.currentPhase !== WorkflowPhase.PLANNING) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot create Epic in ${state.currentPhase} phase. Must be in PLANNING phase.`
      );
    }

    try {
      // Create a DocumentationService instance
      const documentationService = new DocumentationApplicationService();
      await documentationService.initialize(); // Ensure the documentation directories are created
      
      // Combine fields into a comprehensive description
      let descriptionContent = `## Goal\n${epicData.goal}\n\n`;
      descriptionContent += `## Scope\n${epicData.scope}\n\n`;
      
      if (epicData.outOfScope) {
        descriptionContent += `## Out of Scope\n${epicData.outOfScope}\n\n`;
      }
      
      if (epicData.rationale) {
        descriptionContent += `## Business Value and Rationale\n${epicData.rationale}\n\n`;
      }
      
      descriptionContent += "## Related PRDs\n";
      epicData.prdIds.forEach(prdId => {
        descriptionContent += `- ${prdId}\n`;
      });
      
      // Call the createEpic method
      const result = await documentationService.createEpic(
        epicData.title,
        descriptionContent,
        epicData.prdIds
      );
      
      // Update the workflow state
      state.addThought(`Created Epic document: ${result.id} - ${epicData.title}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              message: "Epic created successfully",
              id: result.id,
              filePath: result.filePath,
              title: epicData.title
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create Epic: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

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