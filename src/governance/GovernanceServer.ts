import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Governance-specific imports
import { WorkflowState } from './WorkflowState.js';
import { GovernanceToolProxy } from './GovernanceToolProxy.js';
import { GovernanceRouter } from './router/GovernanceRouter.js';
import { ResourceHandler } from './handlers/ResourceHandler.js';
import { ToolDefinitionsFactory } from './config/ToolDefinitionsFactory.js';

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

  /**
   * Set up handlers for listing and reading governance resources
   */
  private setupResourceHandlers() {
    // Handler for listing available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return await ResourceHandler.handleListResources();
    });

    // Handler for reading a specific resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      return await ResourceHandler.handleReadResource(request.params.uri, this.state);
    });
  }

  /**
   * Set up handlers for listing tools and handling tool calls
   */
  private setupToolHandlers() {
    // Handler for listing available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: ToolDefinitionsFactory.generateToolDefinitions(),
    }));

    // Handler for tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      // Extract the action from the tool name
      const action = request.params.name.replace('mcp__governance__', '');
      
      // Route the action to the appropriate handler
      return await GovernanceRouter.routeAction(
        action, 
        request.params.arguments, 
        this.state, 
        this.toolProxy
      );
    });
  }

  /**
   * Run the governance server
   */
  async run() {
    // Connect to MCP transport
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Governance MCP server running on stdio');
  }
}