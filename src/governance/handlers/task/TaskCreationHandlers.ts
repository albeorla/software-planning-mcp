import { DocumentationApplicationService } from '../../../application/DocumentationService.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { WorkflowState, WorkflowPhase } from '../../WorkflowState.js';
import { GovernanceToolProxy } from '../../GovernanceToolProxy.js';

/**
 * Handlers for task creation-related governance tools
 */
export class TaskCreationHandlers {
  /**
   * Create a Task document and add it to the TODO list
   */
  static async createTask(
    state: WorkflowState,
    toolProxy: GovernanceToolProxy,
    taskData: {
      title: string;
      description: string;
      implementationSteps?: string[];
      storyId: string;
      filePaths?: string[];
      components?: string[];
      testingNotes?: {
        unitTests?: string;
        integrationTests?: string;
        manualVerification?: string;
      };
      complexity: number;
      codeExample?: string;
    }
  ) {
    // Verify we're in the planning phase
    if (state.currentPhase !== WorkflowPhase.PLANNING) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot create task in ${state.currentPhase} phase. Must be in PLANNING phase.`
      );
    }

    try {
      // Create a DocumentationService instance
      const documentationService = new DocumentationApplicationService();
      await documentationService.initialize(); // Ensure the documentation directories are created
      
      // Create a comprehensive description with implementation steps
      let enhancedDescription = taskData.description + "\n\n";
      
      if (taskData.implementationSteps && taskData.implementationSteps.length > 0) {
        enhancedDescription += "## Implementation Steps\n";
        taskData.implementationSteps.forEach((step, index) => {
          enhancedDescription += `${index + 1}. ${step}\n`;
        });
        enhancedDescription += "\n";
      }
      
      if (taskData.filePaths && taskData.filePaths.length > 0) {
        enhancedDescription += "## Affected Files\n";
        taskData.filePaths.forEach(filePath => {
          enhancedDescription += `- \`${filePath}\`\n`;
        });
        enhancedDescription += "\n";
      }
      
      if (taskData.components && taskData.components.length > 0) {
        enhancedDescription += "## Affected Components\n";
        taskData.components.forEach(component => {
          enhancedDescription += `- ${component}\n`;
        });
        enhancedDescription += "\n";
      }
      
      if (taskData.testingNotes) {
        enhancedDescription += "## Testing Notes\n";
        
        if (taskData.testingNotes.unitTests) {
          enhancedDescription += "### Unit Tests\n";
          enhancedDescription += taskData.testingNotes.unitTests + "\n\n";
        }
        
        if (taskData.testingNotes.integrationTests) {
          enhancedDescription += "### Integration Tests\n";
          enhancedDescription += taskData.testingNotes.integrationTests + "\n\n";
        }
        
        if (taskData.testingNotes.manualVerification) {
          enhancedDescription += "### Manual Verification\n";
          enhancedDescription += taskData.testingNotes.manualVerification + "\n\n";
        }
      }
      
      if (taskData.codeExample) {
        enhancedDescription += "## Code Example\n```\n";
        enhancedDescription += taskData.codeExample + "\n```\n";
      }
      
      // Call the createTask method
      const result = await documentationService.createTask(
        taskData.title,
        enhancedDescription,
        taskData.storyId,
        taskData.complexity
      );
      
      // Create the task through the governed_planner
      const newTask = await toolProxy.addTodo({
        title: taskData.title,
        description: taskData.description,
        complexity: taskData.complexity,
        id: result.id,
        codeExample: taskData.codeExample
      });
      
      // Update state
      state.addTask(newTask);
      state.addThought(`Created Task document: ${result.id} - ${taskData.title} (Complexity: ${taskData.complexity})`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              message: "Task created successfully",
              id: result.id,
              filePath: result.filePath,
              title: taskData.title,
              complexity: taskData.complexity,
              todoCreated: true,
              todoId: newTask.id
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create Task: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Create a Subtask and link it to a parent task
   */
  static async createSubtask(
    state: WorkflowState,
    toolProxy: GovernanceToolProxy,
    subtaskData: {
      title: string;
      description: string;
      parentTaskId: string;
      filePaths?: string[];
      complexity: number;
    }
  ) {
    // Verify we're in the planning phase
    if (state.currentPhase !== WorkflowPhase.PLANNING) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Cannot create Subtask in ${state.currentPhase} phase. Must be in PLANNING phase.`
      );
    }

    try {
      // Create a DocumentationService instance
      const documentationService = new DocumentationApplicationService();
      await documentationService.initialize(); // Ensure the documentation directories are created
      
      // Create a comprehensive description with file paths
      let enhancedDescription = subtaskData.description + "\n\n";
      
      if (subtaskData.filePaths && subtaskData.filePaths.length > 0) {
        enhancedDescription += "## Affected Files\n";
        subtaskData.filePaths.forEach(filePath => {
          enhancedDescription += `- \`${filePath}\`\n`;
        });
        enhancedDescription += "\n";
      }
      
      enhancedDescription += `## Parent Task\n- ${subtaskData.parentTaskId}\n\n`;
      
      // Call the createTask method (reusing the task implementation for subtasks)
      const result = await documentationService.createTask(
        `[Subtask] ${subtaskData.title}`,
        enhancedDescription,
        "PARENT_" + subtaskData.parentTaskId, // Use a special convention for parent tasks
        subtaskData.complexity
      );
      
      // Create the subtask as a todo through the governed_planner
      const newSubtask = await toolProxy.addTodo({
        title: `[Subtask] ${subtaskData.title}`,
        description: subtaskData.description,
        complexity: subtaskData.complexity,
        id: result.id,
        parentId: subtaskData.parentTaskId
      });
      
      // Update state
      state.addTask(newSubtask);
      state.addThought(`Created Subtask document: ${result.id} - ${subtaskData.title} (Complexity: ${subtaskData.complexity})`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              message: "Subtask created successfully",
              id: result.id,
              filePath: result.filePath,
              title: subtaskData.title,
              complexity: subtaskData.complexity,
              parentTaskId: subtaskData.parentTaskId,
              todoCreated: true,
              todoId: newSubtask.id
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create Subtask: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}