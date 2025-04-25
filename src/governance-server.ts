#!/usr/bin/env node
import { GovernanceServer } from './governance/GovernanceServer.js';

const server = new GovernanceServer();
server.run().catch(console.error);