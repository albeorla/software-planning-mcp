import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Governance-specific imports
import { WorkflowState, WorkflowPhase } from './WorkflowState.js';
import { GovernanceToolProxy } from './GovernanceToolProxy.js';

/**
 * Main Governance Server class that acts as the sole intermediary between
 * Claude and all other tools. This server enforces workflow rules and orchestrates
 * the interactions between different bounded contexts.
 */
export class GovernanceServer {
  private server: Server;
  private state: WorkflowState;
  private toolProxy: GovernanceToolProxy;

  constructor() {
    this.state = new WorkflowState();
    this.toolProxy = new GovernanceToolProxy();
    
    this.server = new Server(
      {
        name: 'governance-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupResourceHandlers();
    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[Governance MCP Error]', error);
  }

  private setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'governance://workflow-state',
          name: 'Workflow State',
          description: 'Current state of the workflow including active phase, tasks, etc.',
          mimeType: 'application/json',
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      switch (request.params.uri) {
        case 'governance://workflow-state': {
          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'application/json',
                text: JSON.stringify(this.state, null, 2),
              },
            ],
          };
        }
        default:
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Unknown resource URI: ${request.params.uri}`
          );
      }
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // High-level workflow tools
        {
          name: 'mcp__governance__start_planning_session',
          description: 'Start a new planning session with the specified goal',
          inputSchema: {
            type: 'object',
            properties: {
              goal: {
                type: 'string',
                description: 'The software development goal to plan',
              },
            },
            required: ['goal'],
          },
        },
        {
          name: 'mcp__governance__add_planning_thought',
          description: 'Record a thought during the planning process',
          inputSchema: {
            type: 'object',
            properties: {
              thought: {
                type: 'string',
                description: 'The thought to record',
              },
            },
            required: ['thought'],
          },
        },
        // Document creation tools
        {
          name: 'mcp__governance__create_prd',
          description: 'Create a Product Requirements Document (PRD)',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the PRD',
              },
              goal: {
                type: 'string',
                description: 'Primary goal of the feature or project',
              },
              scope: {
                type: 'string',
                description: 'What is included in the scope of this PRD',
              },
              businessRequirements: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'List of business requirements',
              },
              technicalRequirements: {
                type: 'object',
                properties: {
                  functional: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    description: 'Functional requirements',
                  },
                  nonFunctional: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    description: 'Non-functional requirements (performance, security, etc.)',
                  },
                },
                description: 'Technical requirements for the PRD',
              },
              acceptanceCriteria: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Acceptance criteria for the PRD',
              },
            },
            required: ['title', 'goal', 'scope', 'businessRequirements'],
          },
        },
        {
          name: 'mcp__governance__create_epic',
          description: 'Create an Epic based on a PRD',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the Epic',
              },
              goal: {
                type: 'string',
                description: 'Primary goal of the Epic',
              },
              scope: {
                type: 'string',
                description: 'What is included in the scope of this Epic',
              },
              outOfScope: {
                type: 'string',
                description: 'What is explicitly excluded from this Epic',
              },
              prdIds: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'List of PRD IDs this Epic is related to',
              },
              rationale: {
                type: 'string',
                description: 'Business value and rationale for the Epic',
              },
            },
            required: ['title', 'goal', 'scope', 'prdIds'],
          },
        },
        {
          name: 'mcp__governance__create_story',
          description: 'Create a User Story based on an Epic',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the User Story',
              },
              userType: {
                type: 'string',
                description: 'Type of user this story is for',
              },
              action: {
                type: 'string',
                description: 'What the user wants to do',
              },
              benefit: {
                type: 'string',
                description: 'The benefit the user receives',
              },
              description: {
                type: 'string',
                description: 'Detailed description of the story',
              },
              epicId: {
                type: 'string',
                description: 'ID of the Epic this story belongs to',
              },
              acceptanceCriteria: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    scenario: {
                      type: 'string',
                      description: 'Name of the scenario',
                    },
                    given: {
                      type: 'string',
                      description: 'Context of the scenario',
                    },
                    when: {
                      type: 'string',
                      description: 'Action performed',
                    },
                    then: {
                      type: 'string',
                      description: 'Expected outcome',
                    },
                  },
                },
                description: 'Acceptance criteria in Gherkin format',
              },
              complexity: {
                type: 'number',
                description: 'Complexity score (1-8)',
              },
            },
            required: ['title', 'userType', 'action', 'benefit', 'epicId', 'complexity'],
          },
        },
        {
          name: 'mcp__governance__create_task',
          description: 'Create a new implementation task',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the task',
              },
              description: {
                type: 'string',
                description: 'Detailed description of the task',
              },
              implementationSteps: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'List of implementation steps',
              },
              storyId: {
                type: 'string',
                description: 'ID of the parent User Story',
              },
              filePaths: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'List of file paths affected by this task',
              },
              components: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'List of components affected by this task',
              },
              testingNotes: {
                type: 'object',
                properties: {
                  unitTests: {
                    type: 'string',
                    description: 'Unit test requirements',
                  },
                  integrationTests: {
                    type: 'string',
                    description: 'Integration test requirements',
                  },
                  manualVerification: {
                    type: 'string',
                    description: 'Steps for manual verification',
                  },
                },
                description: 'Testing notes for the task',
              },
              complexity: {
                type: 'number',
                description: 'Complexity score (1-8)',
              },
              codeExample: {
                type: 'string',
                description: 'Optional code example',
              },
            },
            required: ['title', 'description', 'storyId', 'complexity'],
          },
        },
        {
          name: 'mcp__governance__create_subtask',
          description: 'Create a subtask within a task',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the subtask',
              },
              description: {
                type: 'string',
                description: 'Detailed description of the subtask',
              },
              parentTaskId: {
                type: 'string',
                description: 'ID of the parent task',
              },
              filePaths: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'List of file paths affected by this subtask',
              },
              complexity: {
                type: 'number',
                description: 'Complexity score (1-8)',
              },
            },
            required: ['title', 'description', 'parentTaskId', 'complexity'],
          },
        },
        {
          name: 'mcp__governance__create_spike',
          description: 'Create a spike for research and exploration',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the spike',
              },
              objective: {
                type: 'string',
                description: 'Clear objective of the research/exploration',
              },
              background: {
                type: 'string',
                description: 'Background context for the spike',
              },
              questions: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'List of questions to answer through the spike',
              },
              researchApproach: {
                type: 'string',
                description: 'Approach for investigating the questions',
              },
              timeBox: {
                type: 'string',
                description: 'Time limit for the spike (e.g., "2 days")',
              },
              parentReference: {
                type: 'string',
                description: 'ID of the parent Story or Epic',
              },
              acceptanceCriteria: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Criteria for successful completion of the spike',
              },
              deliverables: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Expected outputs from the spike',
              },
            },
            required: ['title', 'objective', 'questions', 'timeBox', 'deliverables'],
          },
        },
        {
          name: 'mcp__governance__create_sprint',
          description: 'Create a new sprint with selected stories/tasks',
          inputSchema: {
            type: 'object',
            properties: {
              sprintId: {
                type: 'string',
                description: 'ID or number of the sprint',
              },
              goal: {
                type: 'string',
                description: 'Primary goal of the sprint',
              },
              startDate: {
                type: 'string',
                description: 'Start date of the sprint (YYYY-MM-DD)',
              },
              endDate: {
                type: 'string',
                description: 'End date of the sprint (YYYY-MM-DD)',
              },
              teamMembers: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'List of team members participating in the sprint',
              },
              capacityPoints: {
                type: 'number',
                description: 'Estimated capacity in story points',
              },
              stories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      description: 'ID of the story',
                    },
                    title: {
                      type: 'string',
                      description: 'Title of the story',
                    },
                    complexity: {
                      type: 'number',
                      description: 'Complexity of the story',
                    },
                    tasks: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            description: 'ID of the task',
                          },
                          title: {
                            type: 'string',
                            description: 'Title of the task',
                          },
                          complexity: {
                            type: 'number',
                            description: 'Complexity of the task',
                          },
                        },
                      },
                      description: 'Tasks belonging to this story',
                    },
                  },
                },
                description: 'List of stories and their tasks for the sprint',
              },
              risks: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'List of risks and dependencies',
              },
              successMetrics: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'List of success metrics for the sprint',
              },
            },
            required: ['sprintId', 'goal', 'startDate', 'endDate', 'teamMembers', 'stories'],
          },
        },
        {
          name: 'mcp__governance__get_sprint_info',
          description: 'Get information about a sprint',
          inputSchema: {
            type: 'object',
            properties: {
              sprintId: {
                type: 'string',
                description: 'ID of the sprint to get information about',
              },
            },
            required: ['sprintId'],
          },
        },
        {
          name: 'mcp__governance__update_task_status',
          description: 'Update the status of a task (in-progress, blocked, etc.)',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                description: 'ID of the task to update',
              },
              status: {
                type: 'string',
                enum: ['todo', 'in-progress', 'blocked', 'done'],
                description: 'New status of the task',
              },
              blockerDescription: {
                type: 'string',
                description: 'Description of the blocker (required if status is "blocked")',
              },
            },
            required: ['taskId', 'status'],
          },
        },
        {
          name: 'mcp__governance__list_tasks',
          description: 'List all tasks in the current plan',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'mcp__governance__start_implementation',
          description: 'Start implementing a specific task',
          inputSchema: {
            type: 'object',
            properties: {
              todoId: {
                type: 'string',
                description: 'ID of the task to implement',
              },
            },
            required: ['todoId'],
          },
        },
        {
          name: 'mcp__governance__track_file_read',
          description: 'Track file read access within the implementation phase (use Claude\'s View tool for actual reading)',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: {
                type: 'string',
                description: 'Path to the file being read',
              },
            },
            required: ['filePath'],
          },
        },
        {
          name: 'mcp__governance__track_file_edit',
          description: 'Track file edit within the implementation phase (use Claude\'s Edit tool for actual editing)',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: {
                type: 'string',
                description: 'Path to the file being edited',
              },
            },
            required: ['filePath'],
          },
        },
        {
          name: 'mcp__governance__log_daily_work',
          description: 'Record work done for the day',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                description: 'ID of the task worked on',
              },
              summary: {
                type: 'string',
                description: 'Detailed summary of work done',
              },
              timeSpent: {
                type: 'number',
                description: 'Time spent in minutes',
              },
              blockers: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'List of blockers encountered',
              },
              nextSteps: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'List of next steps',
              },
            },
            required: ['taskId', 'summary'],
          },
        },
        {
          name: 'mcp__governance__complete_implementation',
          description: 'Mark the current implementation task as complete',
          inputSchema: {
            type: 'object',
            properties: {
              summaryPoints: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Summary of changes made',
              },
            },
            required: ['summaryPoints'],
          },
        },
        {
          name: 'mcp__governance__start_code_review',
          description: 'Begin code review process',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                description: 'ID of the task to review',
              },
              reviewFocus: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Areas to focus on during review',
              },
            },
            required: ['taskId'],
          },
        },
        {
          name: 'mcp__governance__commit_changes',
          description: 'Commit the changes for the current task',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Additional commit message details',
              },
            },
            required: ['message'],
          },
        },
        {
          name: 'mcp__governance__create_branch',
          description: 'Create a feature branch',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the branch to create',
              },
              baseBranch: {
                type: 'string',
                description: 'Base branch to create from',
              },
              taskId: {
                type: 'string',
                description: 'ID of the task this branch is for',
              },
            },
            required: ['name', 'baseBranch'],
          },
        },
        {
          name: 'mcp__governance__create_pull_request',
          description: 'Create a pull request',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the pull request',
              },
              description: {
                type: 'string',
                description: 'Description of the pull request',
              },
              sourceBranch: {
                type: 'string',
                description: 'Source branch for the PR',
              },
              targetBranch: {
                type: 'string',
                description: 'Target branch for the PR',
              },
              taskIds: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'IDs of tasks included in this PR',
              },
              reviewers: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'List of reviewers',
              },
            },
            required: ['title', 'description', 'sourceBranch', 'targetBranch'],
          },
        },
        {
          name: 'mcp__governance__update_sprint_status',
          description: 'Update sprint status with completed work',
          inputSchema: {
            type: 'object',
            properties: {
              sprintId: {
                type: 'string',
                description: 'ID of the sprint to update',
              },
              completedTaskIds: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'IDs of completed tasks',
              },
              progressSummary: {
                type: 'string',
                description: 'Summary of sprint progress',
              },
            },
            required: ['sprintId', 'completedTaskIds'],
          },
        },
        {
          name: 'mcp__governance__search_code',
          description: 'Search for code patterns across the codebase',
          inputSchema: {
            type: 'object',
            properties: {
              pattern: {
                type: 'string',
                description: 'Regex pattern to search for',
              },
              fileGlob: {
                type: 'string',
                description: 'Optional file glob pattern to filter files',
              },
            },
            required: ['pattern'],
          },
        },
        {
          name: 'mcp__governance__run_command',
          description: 'Run a command (restricted to safe operations based on current phase)',
          inputSchema: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: 'Command to run',
              },
              purpose: {
                type: 'string',
                description: 'Purpose of running this command',
              },
            },
            required: ['command', 'purpose'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      // Extract the action from the tool name
      const action = request.params.name.replace('mcp__governance__', '');
      
      switch (action) {
        case 'start_planning_session': {
          // Verify workflow state allows starting a planning session
          if (this.state.currentPhase !== WorkflowPhase.IDLE && this.state.currentPhase !== WorkflowPhase.COMPLETED) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot start planning session in ${this.state.currentPhase} phase. Complete or reset current workflow first.`
            );
          }
          
          const { goal } = request.params.arguments as { goal: string };
          
          // Start the planning session through the governed_planner
          const result = await this.toolProxy.startPlanning(goal);
          
          // Update workflow state
          this.state.startPlanningSession(goal);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: "Planning session started successfully",
                  state: this.state.currentPhase,
                  planningPrompt: result
                }, null, 2),
              },
            ],
          };
        }
        
        case 'add_planning_thought': {
          // Verify we're in the planning phase
          if (this.state.currentPhase !== WorkflowPhase.PLANNING) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot add planning thought in ${this.state.currentPhase} phase. Must be in PLANNING phase.`
            );
          }
          
          const { thought } = request.params.arguments as { thought: string };
          
          // Record the thought through the governed_planner
          const result = await this.toolProxy.addThought(thought);
          
          // Update state
          this.state.addThought(thought);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: "Thought recorded successfully",
                  thoughtCount: this.state.thoughts.length
                }, null, 2),
              },
            ],
          };
        }
        
        case 'create_task': {
          // Verify we're in the planning phase
          if (this.state.currentPhase !== WorkflowPhase.PLANNING) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot create task in ${this.state.currentPhase} phase. Must be in PLANNING phase.`
            );
          }
          
          const taskData = request.params.arguments as {
            title: string;
            description: string;
            complexity: number;
            codeExample?: string;
          };
          
          // Create the task through the governed_planner
          const newTask = await this.toolProxy.addTodo(taskData);
          
          // Update state
          this.state.addTask(newTask);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(newTask, null, 2),
              },
            ],
          };
        }
        
        case 'list_tasks': {
          // This can be called in planning or implementation phases
          if (this.state.currentPhase !== WorkflowPhase.PLANNING && 
              this.state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot list tasks in ${this.state.currentPhase} phase.`
            );
          }
          
          // Get tasks through the governed_planner
          const tasks = await this.toolProxy.getTodos();
          
          // Update state with latest tasks
          this.state.updateTasks(tasks);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(tasks, null, 2),
              },
            ],
          };
        }
        
        case 'start_implementation': {
          // Can transition from planning to implementation or switch tasks within implementation
          if (this.state.currentPhase !== WorkflowPhase.PLANNING && 
              this.state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot start implementation in ${this.state.currentPhase} phase.`
            );
          }
          
          const { todoId } = request.params.arguments as { todoId: string };
          
          // Get the specific task info to verify it exists
          const tasks = await this.toolProxy.getTodos();
          const taskToImplement = tasks.find(t => t.id === todoId);
          
          if (!taskToImplement) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Task with ID ${todoId} not found.`
            );
          }
          
          // Update the workflow state to implementation phase with this task
          this.state.startImplementation(todoId, taskToImplement);
          
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
        
        case 'track_file_read': {
          // Must be in implementation phase
          if (this.state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot track file reads in ${this.state.currentPhase} phase. Must be in IMPLEMENTATION phase.`
            );
          }
          
          const { filePath } = request.params.arguments as { filePath: string };
          
          // Just track the file access - the actual reading is done directly by Claude
          await this.toolProxy.trackFileRead(filePath);
          
          // Record this file access in our state for tracking
          this.state.addFileAccess(filePath, 'read');
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: `File read access to ${filePath} has been tracked`,
                  phase: this.state.currentPhase,
                  currentTask: this.state.currentTask?.id
                }, null, 2),
              },
            ],
          };
        }
        
        case 'track_file_edit': {
          // Must be in implementation phase
          if (this.state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot track file edits in ${this.state.currentPhase} phase. Must be in IMPLEMENTATION phase.`
            );
          }
          
          const { filePath } = request.params.arguments as { filePath: string };
          
          // Just track the file modification - the actual editing is done directly by Claude
          await this.toolProxy.trackFileEdit(filePath);
          
          // Record this file modification in our state
          this.state.addFileAccess(filePath, 'write');
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: `File modification to ${filePath} has been tracked`,
                  phase: this.state.currentPhase,
                  currentTask: this.state.currentTask?.id
                }, null, 2),
              },
            ],
          };
        }
        
        case 'complete_implementation': {
          // Must be in implementation phase
          if (this.state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot complete implementation in ${this.state.currentPhase} phase. Must be in IMPLEMENTATION phase.`
            );
          }
          
          // Ensure we have an active task
          if (!this.state.currentTask) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `No active implementation task to complete.`
            );
          }
          
          const { summaryPoints } = request.params.arguments as { summaryPoints: string[] };
          
          // Complete the task through the governed_planner
          const result = await this.toolProxy.completeTask(
            this.state.currentTask.id, 
            summaryPoints
          );
          
          // Update workflow state
          this.state.completeImplementation();
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: `Task ${this.state.currentTask.id} completed successfully`,
                  summaryPoints,
                  state: this.state.currentPhase
                }, null, 2),
              },
            ],
          };
        }
        
        case 'commit_changes': {
          // Must be in the REVIEW_AND_COMMIT phase
          if (this.state.currentPhase !== WorkflowPhase.REVIEW_AND_COMMIT) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot commit changes in ${this.state.currentPhase} phase. Must be in REVIEW_AND_COMMIT phase.`
            );
          }
          
          // Ensure we have a completed task
          if (!this.state.currentTask) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `No completed task to commit changes for.`
            );
          }
          
          const { message } = request.params.arguments as { message: string };
          
          // Formulate the complete commit message based on our task
          const taskId = this.state.currentTask.id;
          const commitMessage = `[${this.state.extractPrdId()}] (${taskId}) ${this.state.currentTask.title}\n\n${message}`;
          
          // Commit the changes through the governed_planner
          const result = await this.toolProxy.commitChanges(taskId, commitMessage);
          
          // Update workflow state to completed
          this.state.completeCommit();
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: "Changes committed successfully",
                  commitMessage,
                  state: this.state.currentPhase
                }, null, 2),
              },
            ],
          };
        }
        
        case 'create_prd': {
          // Verify we're in the planning phase
          if (this.state.currentPhase !== WorkflowPhase.PLANNING) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot create PRD in ${this.state.currentPhase} phase. Must be in PLANNING phase.`
            );
          }
          
          // Extract PRD data from the request
          const prdData = request.params.arguments as {
            title: string;
            goal: string;
            scope: string;
            businessRequirements: string[];
            technicalRequirements?: {
              functional: string[];
              nonFunctional: string[];
            };
            acceptanceCriteria?: string[];
          };
          
          // TODO: Implement calling DocumentationService to create PRD
          // For now, return a placeholder response
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: "PRD creation not yet implemented",
                  prdData
                }, null, 2),
              },
            ],
          };
        }
        
        case 'create_epic': {
          // Verify we're in the planning phase
          if (this.state.currentPhase !== WorkflowPhase.PLANNING) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot create Epic in ${this.state.currentPhase} phase. Must be in PLANNING phase.`
            );
          }
          
          // Extract Epic data from the request
          const epicData = request.params.arguments as {
            title: string;
            goal: string;
            scope: string;
            outOfScope?: string;
            prdIds: string[];
            rationale?: string;
          };
          
          // TODO: Implement calling DocumentationService to create Epic
          // For now, return a placeholder response
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: "Epic creation not yet implemented",
                  epicData
                }, null, 2),
              },
            ],
          };
        }
        
        case 'create_story': {
          // Verify we're in the planning phase
          if (this.state.currentPhase !== WorkflowPhase.PLANNING) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot create User Story in ${this.state.currentPhase} phase. Must be in PLANNING phase.`
            );
          }
          
          // Extract Story data from the request
          const storyData = request.params.arguments as {
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
          };
          
          // TODO: Implement calling DocumentationService to create Story
          // For now, return a placeholder response
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: "User Story creation not yet implemented",
                  storyData
                }, null, 2),
              },
            ],
          };
        }
        
        case 'create_subtask': {
          // Verify we're in the planning phase
          if (this.state.currentPhase !== WorkflowPhase.PLANNING) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot create Subtask in ${this.state.currentPhase} phase. Must be in PLANNING phase.`
            );
          }
          
          // Extract Subtask data from the request
          const subtaskData = request.params.arguments as {
            title: string;
            description: string;
            parentTaskId: string;
            filePaths?: string[];
            complexity: number;
          };
          
          // TODO: Implement calling DocumentationService to create Subtask
          // For now, return a placeholder response
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: "Subtask creation not yet implemented",
                  subtaskData
                }, null, 2),
              },
            ],
          };
        }
        
        case 'create_spike': {
          // Verify we're in the planning phase
          if (this.state.currentPhase !== WorkflowPhase.PLANNING) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot create Spike in ${this.state.currentPhase} phase. Must be in PLANNING phase.`
            );
          }
          
          // Extract Spike data from the request
          const spikeData = request.params.arguments as {
            title: string;
            objective: string;
            background?: string;
            questions: string[];
            researchApproach?: string;
            timeBox: string;
            parentReference?: string;
            acceptanceCriteria?: string[];
            deliverables: string[];
          };
          
          // TODO: Implement calling DocumentationService to create Spike
          // For now, return a placeholder response
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: "Spike creation not yet implemented",
                  spikeData
                }, null, 2),
              },
            ],
          };
        }
        
        case 'create_sprint': {
          // Verify we're in the planning phase
          if (this.state.currentPhase !== WorkflowPhase.PLANNING) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot create Sprint in ${this.state.currentPhase} phase. Must be in PLANNING phase.`
            );
          }
          
          // Extract Sprint data from the request
          const sprintData = request.params.arguments as {
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
          };
          
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
        
        case 'get_sprint_info': {
          // This can be called in any phase as it's a read operation
          
          const { sprintId } = request.params.arguments as { sprintId: string };
          
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
        
        case 'update_task_status': {
          // This should be callable in IMPLEMENTATION phase
          if (this.state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot update task status in ${this.state.currentPhase} phase. Must be in IMPLEMENTATION phase.`
            );
          }
          
          const { taskId, status, blockerDescription } = request.params.arguments as { 
            taskId: string;
            status: 'todo' | 'in-progress' | 'blocked' | 'done';
            blockerDescription?: string;
          };
          
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
        
        case 'log_daily_work': {
          // This should be callable in IMPLEMENTATION phase
          if (this.state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot log daily work in ${this.state.currentPhase} phase. Must be in IMPLEMENTATION phase.`
            );
          }
          
          const { taskId, summary, timeSpent, blockers, nextSteps } = request.params.arguments as { 
            taskId: string;
            summary: string;
            timeSpent?: number;
            blockers?: string[];
            nextSteps?: string[];
          };
          
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
        
        case 'start_code_review': {
          // This should be callable in IMPLEMENTATION or REVIEW_AND_COMMIT phase
          if (this.state.currentPhase !== WorkflowPhase.IMPLEMENTATION && 
              this.state.currentPhase !== WorkflowPhase.REVIEW_AND_COMMIT) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot start code review in ${this.state.currentPhase} phase. Must be in IMPLEMENTATION or REVIEW_AND_COMMIT phase.`
            );
          }
          
          const { taskId, reviewFocus } = request.params.arguments as { 
            taskId: string;
            reviewFocus?: string[];
          };
          
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
        
        case 'create_branch': {
          // This should be callable in PLANNING or IMPLEMENTATION phase
          if (this.state.currentPhase !== WorkflowPhase.PLANNING && 
              this.state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot create branch in ${this.state.currentPhase} phase. Must be in PLANNING or IMPLEMENTATION phase.`
            );
          }
          
          const { name, baseBranch, taskId } = request.params.arguments as { 
            name: string;
            baseBranch: string;
            taskId?: string;
          };
          
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
        
        case 'create_pull_request': {
          // This should be callable in REVIEW_AND_COMMIT phase
          if (this.state.currentPhase !== WorkflowPhase.REVIEW_AND_COMMIT) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot create pull request in ${this.state.currentPhase} phase. Must be in REVIEW_AND_COMMIT phase.`
            );
          }
          
          const { title, description, sourceBranch, targetBranch, taskIds, reviewers } = request.params.arguments as { 
            title: string;
            description: string;
            sourceBranch: string;
            targetBranch: string;
            taskIds?: string[];
            reviewers?: string[];
          };
          
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
        
        case 'update_sprint_status': {
          // This can be called in any phase
          
          const { sprintId, completedTaskIds, progressSummary } = request.params.arguments as { 
            sprintId: string;
            completedTaskIds: string[];
            progressSummary?: string;
          };
          
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
        
        case 'search_code': {
          // This can be called in planning or implementation phases
          if (this.state.currentPhase !== WorkflowPhase.PLANNING && 
              this.state.currentPhase !== WorkflowPhase.IMPLEMENTATION) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Cannot search code in ${this.state.currentPhase} phase.`
            );
          }
          
          const { pattern, fileGlob } = request.params.arguments as { 
            pattern: string;
            fileGlob?: string;
          };
          
          // Search code using the toolProxy
          const results = await this.toolProxy.searchCode(pattern, fileGlob);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(results, null, 2),
              },
            ],
          };
        }
        
        case 'run_command': {
          const { command, purpose } = request.params.arguments as { 
            command: string;
            purpose: string;
          };
          
          // Validate the command based on current phase
          // Different commands are allowed in different phases
          if (!this.isCommandAllowedInCurrentPhase(command, purpose)) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Command '${command}' is not allowed in the ${this.state.currentPhase} phase.`
            );
          }
          
          // Execute the command using the toolProxy
          const result = await this.toolProxy.runCommand(command);
          
          return {
            content: [
              {
                type: 'text',
                text: result,
              },
            ],
          };
        }
        
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown governance action: ${action}`
          );
      }
    });
  }
  
  /**
   * Validates whether a command is allowed in the current workflow phase
   */
  private isCommandAllowedInCurrentPhase(command: string, purpose: string): boolean {
    // Whitelist of commands for each phase
    const allowedCommands: Record<WorkflowPhase, RegExp[]> = {
      [WorkflowPhase.IDLE]: [/^ls/, /^pwd/, /^echo/],
      [WorkflowPhase.PLANNING]: [/^ls/, /^pwd/, /^echo/, /^npm (list|ll|la)/, /^node -v/, /^cat package\.json/],
      [WorkflowPhase.IMPLEMENTATION]: [/^ls/, /^pwd/, /^echo/, /^npm (list|ll|la|run)/, /^node/],
      [WorkflowPhase.REVIEW_AND_COMMIT]: [/^ls/, /^pwd/, /^echo/, /^git status/, /^git diff/],
      [WorkflowPhase.COMPLETED]: [/^ls/, /^pwd/, /^echo/]
    };
    
    // Check if the command matches any allowed pattern for the current phase
    const currentPhasePatterns = allowedCommands[this.state.currentPhase];
    return currentPhasePatterns.some(pattern => pattern.test(command));
  }

  async run() {
    // Connect to MCP transport
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Governance MCP server running on stdio');
  }
}