#!/usr/bin/env node
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

// --- Application & Infrastructure layer imports (Dependency Inversion) ----
import { JsonFileStorage } from './infrastructure/storage/JsonFileStorage.js';
import { PlanningApplicationService } from './application/PlanningService.js';
import { BasicPlanParser } from './application/PlanParser.js';
import { SEQUENTIAL_THINKING_PROMPT } from './application/prompts.js';
import { ThinkingApplicationService } from './application/ThinkingService.js';
import { JsonFileThinkingProcessRepository } from './infrastructure/storage/JsonFileThinkingProcessRepository.js';
import { DocumentationApplicationService } from './application/DocumentationService.js';
import { VersionControlApplicationService } from './application/VersionControlService.js';
import { GitInfrastructureService } from './infrastructure/versioncontrol/GitInfrastructureService.js';
import { MarkdownFileService } from './infrastructure/documentation/MarkdownFileService.js';

// Domain entities
import { Goal } from './domain/entities/Goal.js';
import { Todo } from './domain/entities/Todo.js';

class GovernedPlannerServer {
  private server: Server;
  private currentGoal: Goal | null = null;
  
  // Infrastructure services
  private readonly storage: JsonFileStorage;
  private readonly markdownFileService: MarkdownFileService;
  private readonly gitService: GitInfrastructureService;
  
  // Application services (Bounded Contexts)
  private readonly planningService: PlanningApplicationService;
  private readonly thinkingService: ThinkingApplicationService;
  private readonly documentationService: DocumentationApplicationService;
  private readonly versionControlService: VersionControlApplicationService;

  constructor() {
    // ------------------------------------------------------------------
    // Infrastructure layer initialization
    // ------------------------------------------------------------------
    this.storage = new JsonFileStorage();
    const thinkingRepo = new JsonFileThinkingProcessRepository();
    this.markdownFileService = new MarkdownFileService(process.cwd() + '/.docs');
    this.gitService = new GitInfrastructureService();
    
    // ------------------------------------------------------------------
    // Application layer initialization (Dependencies injected)
    // ------------------------------------------------------------------
    const parser = new BasicPlanParser();
    this.planningService = new PlanningApplicationService(this.storage, this.storage, parser);
    this.thinkingService = new ThinkingApplicationService(thinkingRepo);
    this.documentationService = new DocumentationApplicationService();
    this.versionControlService = new VersionControlApplicationService();
    
    // ------------------------------------------------------------------
    // MCP Server initialization
    // ------------------------------------------------------------------
    this.server = new Server(
      {
        name: 'governed-planner',
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
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
  }

  private setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'planning://current-goal',
          name: 'Current Goal',
          description: 'The current software development goal being planned',
          mimeType: 'application/json',
        },
        {
          uri: 'planning://implementation-plan',
          name: 'Implementation Plan',
          description: 'The current implementation plan with todos',
          mimeType: 'application/json',
        },
        {
          uri: 'planning://thinking-process',
          name: 'Thinking Process',
          description: 'The sequential thinking process for the current goal',
          mimeType: 'application/json',
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      switch (request.params.uri) {
        case 'planning://current-goal': {
          if (!this.currentGoal) {
            throw new McpError(
              ErrorCode.InvalidParams,
              'No active goal. Start a new planning session first.'
            );
          }
          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'application/json',
                text: JSON.stringify(this.currentGoal, null, 2),
              },
            ],
          };
        }
        case 'planning://implementation-plan': {
          if (!this.currentGoal) {
            throw new McpError(
              ErrorCode.InvalidParams,
              'No active goal. Start a new planning session first.'
            );
          }
          const plan = await this.planningService.getPlan(this.currentGoal.id);
          if (!plan) {
            throw new McpError(
              ErrorCode.InvalidParams,
              'No implementation plan found for current goal.'
            );
          }
          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'application/json',
                text: JSON.stringify(plan, null, 2),
              },
            ],
          };
        }
        case 'planning://thinking-process': {
          if (!this.currentGoal) {
            throw new McpError(
              ErrorCode.InvalidParams,
              'No active goal. Start a new planning session first.'
            );
          }
          const thoughts = await this.thinkingService.getThinkingHistory(this.currentGoal.id);
          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'application/json',
                text: JSON.stringify(thoughts, null, 2),
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
        {
          name: 'mcp__governed_planner__start_planning',
          description: 'Start a new planning session with a goal',
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
          name: 'mcp__governed_planner__add_todo',
          description: 'Add a new todo item to the current plan',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the todo item',
              },
              description: {
                type: 'string',
                description: 'Detailed description of the todo item',
              },
              complexity: {
                type: 'number',
                description: 'Complexity score (0-10)',
                minimum: 0,
                maximum: 10,
              },
              codeExample: {
                type: 'string',
                description: 'Optional code example',
              },
            },
            required: ['title', 'description', 'complexity'],
          },
        },
        {
          name: 'mcp__governed_planner__get_todos',
          description: 'Get all todos in the current plan',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'mcp__governed_planner__remove_todo',
          description: 'Remove a todo item from the current plan',
          inputSchema: {
            type: 'object',
            properties: {
              todoId: {
                type: 'string',
                description: 'ID of the todo item to remove',
              },
            },
            required: ['todoId'],
          },
        },
        {
          name: 'mcp__governed_planner__update_task_status',
          description: 'Update the status of a task',
          inputSchema: {
            type: 'object',
            properties: {
              todoId: {
                type: 'string',
                description: 'ID of the todo item',
              },
              isComplete: {
                type: 'boolean',
                description: 'New completion status',
              },
            },
            required: ['todoId', 'isComplete'],
          },
        },
        {
          name: 'mcp__governed_planner__complete_task',
          description: 'Mark a task as complete and update documentation',
          inputSchema: {
            type: 'object',
            properties: {
              todoId: {
                type: 'string',
                description: 'ID of the todo item',
              },
              summaryPoints: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Summary points of what was accomplished',
              },
            },
            required: ['todoId', 'summaryPoints'],
          },
        },
        {
          name: 'mcp__governed_planner__add_thought',
          description: 'Add a thought to the sequential thinking process',
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
        {
          name: 'mcp__governed_planner__commit_changes',
          description: 'Commit changes related to a task',
          inputSchema: {
            type: 'object',
            properties: {
              todoId: {
                type: 'string',
                description: 'ID of the todo item',
              },
              message: {
                type: 'string',
                description: 'Commit message',
              },
            },
            required: ['todoId', 'message'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'mcp__governed_planner__start_planning': {
          const { goal } = request.params.arguments as { goal: string };
          this.currentGoal = await this.planningService.startPlanningSession(goal);

          return {
            content: [
              {
                type: 'text',
                text: SEQUENTIAL_THINKING_PROMPT,
              },
            ],
          };
        }

        case 'mcp__governed_planner__add_todo': {
          if (!this.currentGoal) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              'No active goal. Start a new planning session first.'
            );
          }

          const todo = request.params.arguments as Omit<
            Todo,
            'id' | 'isComplete' | 'createdAt' | 'updatedAt'
          >;
          const newTodo = await this.planningService.addTodoToCurrentPlan(this.currentGoal.id, todo);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(newTodo, null, 2),
              },
            ],
          };
        }

        case 'mcp__governed_planner__get_todos': {
          if (!this.currentGoal) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              'No active goal. Start a new planning session first.'
            );
          }

          const todos = await this.planningService.getCurrentTodos(this.currentGoal.id);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(todos, null, 2),
              },
            ],
          };
        }

        case 'mcp__governed_planner__remove_todo': {
          if (!this.currentGoal) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              'No active goal. Start a new planning session first.'
            );
          }

          const { todoId } = request.params.arguments as { todoId: string };
          await this.planningService.removeTodo(this.currentGoal.id, todoId);

          return {
            content: [
              {
                type: 'text',
                text: `Successfully removed todo ${todoId}`,
              },
            ],
          };
        }

        case 'mcp__governed_planner__update_task_status': {
          if (!this.currentGoal) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              'No active goal. Start a new planning session first.'
            );
          }

          const { todoId, isComplete } = request.params.arguments as {
            todoId: string;
            isComplete: boolean;
          };
          const updatedTodo = await this.planningService.updateTodoStatus(
            this.currentGoal.id,
            todoId,
            isComplete,
          );

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(updatedTodo, null, 2),
              },
            ],
          };
        }

        case 'mcp__governed_planner__complete_task': {
          if (!this.currentGoal) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              'No active goal. Start a new planning session first.'
            );
          }

          const { todoId, summaryPoints } = request.params.arguments as {
            todoId: string;
            summaryPoints: string[];
          };
          
          // Update documentation
          await this.documentationService.updateSprintTaskStatus(todoId, "done");
          await this.documentationService.appendWorkSummary(new Date(), summaryPoints);
          await this.documentationService.updateDashboardMetrics();
          
          // Mark the todo as complete
          const updatedTodo = await this.planningService.updateTodoStatus(
            this.currentGoal.id,
            todoId,
            true
          );

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: `Successfully completed task ${todoId} and updated documentation`,
                  todo: updatedTodo
                }, null, 2),
              },
            ],
          };
        }

        case 'mcp__governed_planner__add_thought': {
          if (!this.currentGoal) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              'No active goal. Start a new planning session first.'
            );
          }

          const { thought } = request.params.arguments as { thought: string };
          const process = await this.thinkingService.addThought(this.currentGoal.id, thought);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: "Thought recorded successfully",
                  thoughtCount: process.history.length
                }, null, 2),
              },
            ],
          };
        }

        case 'mcp__governed_planner__commit_changes': {
          if (!this.currentGoal) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              'No active goal. Start a new planning session first.'
            );
          }

          const { todoId, message } = request.params.arguments as {
            todoId: string;
            message: string;
          };
          
          // In a complete implementation, we would:
          // 1. Validate that the todoId exists
          // 2. Extract PRD ID from the current goal or the todo's metadata
          // 3. Ensure the commit message follows the format [PRD-ID] (todoId) Message
          
          const result = await this.versionControlService.commitTaskChanges(todoId, message);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  async run() {
    // Initialize storage and services
    await this.storage.initialise();
    await this.documentationService.initialize();
    
    // Connect to MCP transport
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Governed Planner MCP server running on stdio');
  }
}

const server = new GovernedPlannerServer();
server.run().catch(console.error);