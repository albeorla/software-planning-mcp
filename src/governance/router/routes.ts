import { WorkflowState } from '../WorkflowState.js';
import { GovernanceToolProxy } from '../GovernanceToolProxy.js';
import { CommandValidator } from '../utils/CommandValidator.js';

// Import all handlers
import { 
  RequirementsHandlers,
  UserStoryHandlers,
  ResearchHandlers,
  TaskCreationHandlers,
  TaskManagementHandlers,
  FileOperationHandlers,
  SessionHandlers,
  SearchHandlers,
  SprintHandlers,
  VersionControlHandlers
} from '../handlers/index.js';

// Define route type
type RouteHandler = (
  state: WorkflowState, 
  toolProxy: GovernanceToolProxy, 
  params: any
) => Promise<any>;

interface Route {
  handler: RouteHandler;
}

// Create a map of action names to handler functions
export const routes: Record<string, Route> = {
  // Session and planning routes
  'start_planning_session': {
    handler: async (state, toolProxy, params) => {
      const { goal } = params;
      return await SessionHandlers.startPlanningSession(state, toolProxy, { goal });
    }
  },
  'add_planning_thought': {
    handler: async (state, toolProxy, params) => {
      const { thought } = params;
      return await SessionHandlers.addPlanningThought(state, toolProxy, { thought });
    }
  },
  'run_command': {
    handler: async (state, toolProxy, params) => {
      const { command, purpose } = params;
      // Pass the validator function to ensure command validation
      const isAllowed = (cmd: string, purp: string) => CommandValidator.isCommandAllowedInCurrentPhase(
        cmd, purp, state.currentPhase
      );
      return await SessionHandlers.runCommand(state, toolProxy, { command, purpose }, isAllowed);
    }
  },
  'search_code': {
    handler: async (state, toolProxy, params) => {
      const { pattern, fileGlob } = params;
      return await SearchHandlers.searchCode(state, toolProxy, { pattern, fileGlob });
    }
  },
  
  // Document creation routes
  'create_prd': {
    handler: async (state, toolProxy, params) => {
      return await RequirementsHandlers.createPRD(state, params);
    }
  },
  'create_epic': {
    handler: async (state, toolProxy, params) => {
      return await RequirementsHandlers.createEpic(state, params);
    }
  },
  'create_story': {
    handler: async (state, toolProxy, params) => {
      return await UserStoryHandlers.createStory(state, params);
    }
  },
  'create_spike': {
    handler: async (state, toolProxy, params) => {
      return await ResearchHandlers.createSpike(state, params);
    }
  },
  
  // Task management routes
  'create_task': {
    handler: async (state, toolProxy, params) => {
      return await TaskCreationHandlers.createTask(state, toolProxy, params);
    }
  },
  'create_subtask': {
    handler: async (state, toolProxy, params) => {
      return await TaskCreationHandlers.createSubtask(state, toolProxy, params);
    }
  },
  'list_tasks': {
    handler: async (state, toolProxy, params) => {
      return await TaskManagementHandlers.listTasks(state, toolProxy);
    }
  },
  'start_implementation': {
    handler: async (state, toolProxy, params) => {
      const { todoId } = params;
      return await TaskManagementHandlers.startImplementation(state, toolProxy, { todoId });
    }
  },
  'track_file_read': {
    handler: async (state, toolProxy, params) => {
      const { filePath } = params;
      return await FileOperationHandlers.trackFileRead(state, toolProxy, { filePath });
    }
  },
  'track_file_edit': {
    handler: async (state, toolProxy, params) => {
      const { filePath } = params;
      return await FileOperationHandlers.trackFileEdit(state, toolProxy, { filePath });
    }
  },
  'update_task_status': {
    handler: async (state, toolProxy, params) => {
      const { taskId, status, blockerDescription } = params;
      return await TaskManagementHandlers.updateTaskStatus(state, { taskId, status, blockerDescription });
    }
  },
  'complete_implementation': {
    handler: async (state, toolProxy, params) => {
      const { summaryPoints } = params;
      return await TaskManagementHandlers.completeImplementation(state, toolProxy, { summaryPoints });
    }
  },
  'log_daily_work': {
    handler: async (state, toolProxy, params) => {
      const { taskId, summary, timeSpent, blockers, nextSteps } = params;
      return await SprintHandlers.logDailyWork(state, { taskId, summary, timeSpent, blockers, nextSteps });
    }
  },
  
  // Version control routes
  'start_code_review': {
    handler: async (state, toolProxy, params) => {
      const { taskId, reviewFocus } = params;
      return await VersionControlHandlers.startCodeReview(state, { taskId, reviewFocus });
    }
  },
  'commit_changes': {
    handler: async (state, toolProxy, params) => {
      const { message } = params;
      return await VersionControlHandlers.commitChanges(state, toolProxy, { message });
    }
  },
  'create_branch': {
    handler: async (state, toolProxy, params) => {
      // Fix: Map branchName to name for backward compatibility
      const { branchName, baseBranch, taskId } = params;
      return await VersionControlHandlers.createBranch(state, { 
        name: branchName, // Map branchName to name
        baseBranch, 
        taskId 
      });
    }
  },
  'create_pull_request': {
    handler: async (state, toolProxy, params) => {
      const { title, description, sourceBranch, targetBranch, reviewers, taskIds } = params;
      return await VersionControlHandlers.createPullRequest(state, { 
        title, description, sourceBranch, targetBranch, reviewers, taskIds 
      });
    }
  },
  
  // Sprint management routes
  'create_sprint': {
    handler: async (state, toolProxy, params) => {
      return await SprintHandlers.createSprint(state, params);
    }
  },
  'get_sprint_info': {
    handler: async (state, toolProxy, params) => {
      const { sprintId } = params;
      return await SprintHandlers.getSprintInfo({ sprintId });
    }
  },
  'update_sprint_status': {
    handler: async (state, toolProxy, params) => {
      const { sprintId, completedTaskIds, progressSummary } = params;
      return await SprintHandlers.updateSprintStatus({ sprintId, completedTaskIds, progressSummary });
    }
  }
};