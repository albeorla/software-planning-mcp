# MCP SDK Usage Guide

This document explains how to use the Model Context Protocol (MCP) SDK for TypeScript.

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to large language models (LLMs) like Claude. MCP provides a structured way for LLMs to interact with tools, resources, and external systems.

## Installing the SDK

```bash
pnpm add @your-org/mcp-sdk
```

## Creating an MCP Server

### Basic Server Example

```typescript
import { MCPServer, StdioServerTransport, ListToolsRequestSchema, CallToolRequestSchema } from '@your-org/mcp-sdk';

// Create a new server
const server = new MCPServer(
  { name: 'example-server', version: '1.0.0' },
  {
    capabilities: {
      resources: {},
      tools: {}
    }
  }
);

// Set up tool listing handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'mcp__example__hello_world',
      description: 'Returns a hello world message',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Your name'
          }
        }
      }
    }
  ]
}));

// Set up tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'mcp__example__hello_world') {
    const name = request.params.arguments.name || 'World';
    return {
      result: `Hello, ${name}!`
    };
  }
  
  return {
    error: {
      code: 'unknown_tool',
      message: `Tool ${request.params.name} not found`
    }
  };
});

// Connect to a stdio transport (for Claude Desktop)
const transport = new StdioServerTransport();
await server.connect(transport);
```

### HTTP Server Example

```typescript
import { MCPServer, HTTPServerTransport, ListToolsRequestSchema, CallToolRequestSchema } from '@your-org/mcp-sdk';

// Create a new server
const server = new MCPServer(
  { name: 'example-http-server', version: '1.0.0' },
  {
    capabilities: {
      resources: {},
      tools: {}
    }
  }
);

// Set up handlers...

// Connect to an HTTP transport (port 3000)
const transport = new HTTPServerTransport(3000);
await server.connect(transport);
```

## Using the MCP Client

The SDK also provides a client for connecting to MCP servers:

```typescript
import { MCPClient } from '@your-org/mcp-sdk';

// Create a client for an HTTP-based MCP server
const client = new MCPClient('http://localhost:3000');

async function main() {
  // List available tools
  const { tools } = await client.listTools();
  console.log('Available tools:', tools);
  
  // Call a tool
  const response = await client.callTool({
    name: 'mcp__example__hello_world',
    arguments: { name: 'Claude' }
  });
  
  console.log('Tool response:', response.result);
}

main().catch(console.error);
```

## Working with Resources

MCP allows servers to expose resources (documents, files, etc.) to clients:

```typescript
import { MCPServer, StdioServerTransport, ListResourcesRequestSchema, ReadResourceRequestSchema } from '@your-org/mcp-sdk';

const server = new MCPServer(
  { name: 'resource-server', version: '1.0.0' },
  {
    capabilities: {
      resources: {
        'docs/readme': {
          description: 'README document',
          contentType: 'text/markdown'
        }
      },
      tools: {}
    }
  }
);

// Handle resource listing
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: ['docs/readme']
}));

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === 'docs/readme') {
    return {
      content: '# README\n\nThis is a sample readme file.',
      contentType: 'text/markdown'
    };
  }
  
  return {
    error: {
      code: 'resource_not_found',
      message: `Resource ${request.params.uri} not found`
    }
  };
});

// Connect to transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

## Best Practices

1. **Structure Your Tools Logically**: Group related tools together with a common prefix (e.g., `mcp__search__`, `mcp__database__`).

2. **Provide Clear Descriptions**: Each tool should have a clear, concise description explaining what it does.

3. **Use JSON Schema Effectively**: Define input schemas with detailed property descriptions to help LLMs understand how to use your tools.

4. **Handle Errors Gracefully**: Return meaningful error messages when tools fail or receive invalid inputs.

5. **Consider Security**: Validate and sanitize inputs, and implement appropriate authorization checks.

## Integrating with Claude

To use your MCP server with Claude:

1. Start your MCP server
2. Register it with Claude Desktop or other MCP-compatible clients
3. Ensure your tools follow the naming convention `mcp__namespace__toolname`

See the [Claude integration documentation](/docs/claude-integration.md) for more details.