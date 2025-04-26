# Governance MCP

A Model Context Protocol (MCP) server that enforces software development governance and workflow structure for AI coding assistants like Claude.

## Overview

The Governance MCP server provides a structured workflow for AI assistants to follow when developing software. It enforces phases like planning, implementation, review, and completion, with specific tools for each phase.

<a href="https://glama.ai/mcp/servers/a35c7qc7ie">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/a35c7qc7ie/badge" alt="Governance MCP server" />
</a>

## Status: Prototype

This project is currently in **prototype stage**. While the core architecture is solid, our comprehensive testing has revealed several issues that need to be fixed before the server is ready for production use:

- **Server Initialization**: ✅ PASS - Starts correctly
- **Tool Registration**: ❌ FAIL - Tools aren't properly visible to clients
- **Workflow Transitions**: ⚠️ PARTIAL - Some phase transitions work
- **Phase Enforcement**: ✅ PASS - Correctly enforces workflow rules
- **Document Creation**: ❌ FAIL - Needs implementation fixes
- **File Tracking**: ❌ FAIL - Needs implementation fixes

See the [testing results](#test-results) for more details.

## Features ✨

- **Structured Development Workflow**: Enforced phases for planning, implementation, review, and completion
- **Product Roadmapping**: Create and manage product roadmaps with timeframes, initiatives, and items
- **Task Management**: Create and track tasks, subtasks, and related artifacts
- **Documentation Generation**: Automated creation of PRDs, Epics, User Stories, and other documents
- **Sequential Thinking**: Record and organize thoughts during the planning process
- **Version Control Integration**: Coordinate Git operations tied to specific tasks and sprints
- **Sprint Planning**: Organize tasks into sprints with tracking and reporting

## Domain-Driven Design Architecture

This project is built following Domain-Driven Design (DDD) and SOLID principles:

### Architecture Layers

1. **Domain Layer**: Rich domain models with encapsulated behavior
2. **Application Layer**: Orchestrates use cases and enforces workflow rules
3. **Infrastructure Layer**: Implements persistence through repository pattern
4. **Presentation Layer**: Governance server exposing tools to Claude via MCP

### Bounded Contexts

1. **Planning Context**: Manages PRDs, Epics, Stories, Tasks, and Roadmaps
2. **Documentation Context**: Handles generating and updating markdown documentation
3. **Thinking Context**: Manages sequential thinking processes for planning
4. **Version Control Context**: Coordinates Git operations and connects tasks to commits

## Installation 🛠️

### Prerequisites

- Node.js 16+ and pnpm
- Claude Code (claude.ai/code)

### Manual Installation

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```
3. Build the project:
```bash
pnpm run build
```

## Usage 🧰

### Starting the Governance Server

```bash
pnpm run governance
```

This starts the governance MCP server that enforces the workflow rules.

Or use it with Claude:

```bash
claude mcp add governance "pnpm run governance"
claude mcp --server governance
```

### Workflow Phases

The governance server enforces these workflow phases:

1. **Planning Phase**: Creating PRDs, Epics, Stories, Tasks, and Roadmaps
2. **Implementation Phase**: Executing tasks and modifying code
3. **Review and Commit Phase**: Code review and committing changes
4. **Completed Phase**: Finished tasks

### Governance Tools

The MCP server exposes tools for each phase of development:

#### Planning Phase
- `mcp__governance__start_planning_session`: Begin a planning session
- `mcp__governance__add_planning_thought`: Record thoughts during planning
- `mcp__governance__create_prd`, `create_epic`, etc.: Create documentation
- `mcp__governance__create_task`: Define implementation tasks
- `mcp__governance__create_roadmap`: Create a product roadmap

#### Implementation Phase
- `mcp__governance__start_implementation`: Begin implementing a task
- `mcp__governance__track_file_read`: Track file reads
- `mcp__governance__track_file_edit`: Track file edits
- `mcp__governance__update_task_status`: Update task status
- `mcp__governance__log_daily_work`: Log progress

#### Review and Commit Phase
- `mcp__governance__start_code_review`: Conduct code review
- `mcp__governance__create_branch`: Create git branches
- `mcp__governance__commit_changes`: Commit work
- `mcp__governance__create_pull_request`: Create PRs

## Project Structure 📂

```
governance-mcp/
├── src/
│   ├── domain/               # Domain layer - entities, repositories
│   │   ├── entities/         # Domain entities with behavior
│   │   └── repositories/     # Repository interfaces
│   ├── application/          # Application services
│   │   ├── PlanningService.ts
│   │   ├── ThinkingService.ts
│   │   ├── DocumentationService.ts
│   │   ├── VersionControlService.ts
│   │   ├── roadmap/                # CQRS implementation for roadmap
│   │   │   ├── RoadmapQueryService.ts       # Read operations
│   │   │   ├── RoadmapCommandService.ts     # Write operations  
│   │   │   └── RoadmapApplicationService.ts # Facade combining both
│   ├── infrastructure/       # Repository implementations
│   │   ├── storage/          # JSON file repositories
│   │   ├── documentation/    # Markdown file handling
│   │   └── versioncontrol/   # Git operations
│   ├── governance/           # Governance server
│   │   ├── handlers/         # Specialized handlers by context
│   │   ├── config/           # Tool definitions by category
│   │   │   ├── WorkflowToolDefinitions.ts
│   │   │   ├── DocumentToolDefinitions.ts
│   │   │   ├── TaskToolDefinitions.ts
│   │   │   ├── VersionControlToolDefinitions.ts
│   │   │   ├── SprintToolDefinitions.ts
│   │   │   └── ToolDefinitionsFactory.ts
│   │   ├── GovernanceServer.ts
│   │   └── WorkflowState.ts
│   └── governance-server.ts  # MCP server entry point
├── docs/                     # Documentation
│   ├── architecture.md       # Architectural details with class diagrams
│   ├── workflow.md           # Workflow phase documentation
│   ├── domain_model_analysis.md # DDD analysis and recommendations
│   └── code_metrics.html     # Code metrics visualizations
├── testing/                  # Test files
│   ├── governance-test-report.md  # Comprehensive test results
│   └── test-governance.js    # Test script
└── CLAUDE.md                 # Instructions for Claude Code
```

## Development 🔨

### Build Commands
- Build: `pnpm run build`
- Watch mode: `pnpm run watch`
- Start governance server: `pnpm run governance`
- Generate metrics: `pnpm run metrics` 
- Run simple test: `pnpm run test:simple`
- Run comprehensive tests: `pnpm run test:comprehensive`

### Test Results

Our comprehensive testing revealed several issues with the current implementation:

| Component | Status | Notes |
|-----------|--------|-------|
| Server Initialization | PASS | Server starts correctly with expected output |
| Tool Registration | FAIL | Tools aren't properly registered or visible to clients |
| Workflow Transitions | PARTIAL | Some phase transitions work while others fail |
| Phase Enforcement | PASS | Correctly rejects tools used in wrong phases |
| Document Creation | FAIL | Task creation functionality incomplete |
| File Tracking | FAIL | File tracking functionality incomplete |
| Error Handling | PARTIAL | Inconsistent error handling |

For detailed test results, see the [governance test report](testing/governance-test-report.md).

### Known Issues and TODO

1. **Tool Registration**: Fix ListToolsRequestSchema handler in GovernanceServer.ts
2. **Communication Protocol**: Update JSON-RPC handlers to conform to MCP spec 
3. **Workflow State Transitions**: Fix initial planning phase transition
4. **Documentation Creation**: Complete document creation handlers
5. **File Tracking**: Fix file tracking functionality
6. **Error Handling**: Standardize error responses across all handlers

### Code Organization Guidelines

- **Modular Configuration**: Tool definitions must be organized by category in separate files under `src/governance/config/`
- **File Size Limits**: No single file should exceed 400 lines of code
- **Metrics Monitoring**: Run `pnpm run metrics` regularly to identify files that need refactoring

## Contributing 🤝

Contributions are welcome! Please review the architecture documentation before making changes to ensure alignment with the DDD principles and established patterns.

## License 📄

MIT

---

Made with ❤️ using Domain-Driven Design and the Model Context Protocol