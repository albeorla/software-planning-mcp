import { WorkflowState } from '../WorkflowState.js';
import { WorkflowToolDefinitions } from './WorkflowToolDefinitions.js';
import { DocumentToolDefinitions } from './DocumentToolDefinitions.js';
import { TaskToolDefinitions } from './TaskToolDefinitions.js';
import { VersionControlToolDefinitions } from './VersionControlToolDefinitions.js';
import { SprintToolDefinitions } from './SprintToolDefinitions.js';
import { SearchToolDefinitions } from './SearchToolDefinitions.js';

/**
 * Factory class that generates tool definitions for the governance server
 * by composing specialized tool definition providers.
 */
export class ToolDefinitionsFactory {
  /**
   * Generate all tool definitions for the governance server
   */
  static generateToolDefinitions() {
    return [
      ...WorkflowToolDefinitions.getWorkflowTools(),
      ...DocumentToolDefinitions.getDocumentTools(),
      ...TaskToolDefinitions.getTaskTools(),
      ...VersionControlToolDefinitions.getVersionControlTools(),
      ...SprintToolDefinitions.getSprintTools(),
      ...SearchToolDefinitions.getSearchTools(),
    ];
  }
}