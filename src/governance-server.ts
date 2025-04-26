#!/usr/bin/env node
/**
 * Entry point for the Software Planning Tool MCP server with governance capabilities
 * 
 * This server implements a complete MCP server with workflow state management,
 * planning tools, documentation tools, and version control tools.
 */
import { GovernanceServer } from './governance/GovernanceServer.js';

const server = new GovernanceServer();
server.run().catch(console.error);