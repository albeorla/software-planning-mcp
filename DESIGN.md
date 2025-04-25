# Governed Planner Workflow (DDD/SOLID Refined)

This document guides interactions with the coding agent (Claude Code) within this repository. It focuses on the workflow enforced by the integrated governed_planner MCP server, which is designed following Domain-Driven Design (DDD) and SOLID principles for maintainability and clear separation of concerns.

## Implementation Status

**Status: In Progress**

Reference CLAUDE.md for detailed implementation task tracking.

## Governance Server

The project implements a governance server that acts as the sole intermediary between Claude Code and all other tools. This ensures strict workflow enforcement by controlling all interactions through a single point of access.

### Configuration

To use the governance server alongside Claude's built-in capabilities, configure Claude Code to allow both direct tool access and governance MCP server tools in `.claude/settings.json`:

```json
{
  "allowedTools": [
    "Bash",
    "View",
    "Edit",
    "GlobTool",
    "GrepTool",
    "LSTool",
    "BatchTool",
    "AgentTool",
    "mcp__governance__*"
  ]
}
```

This hybrid approach allows Claude to directly perform file operations while using the governance server for workflow-specific operations like planning, task tracking, and state transitions.

### Running the Governance Server

To run the governance server:

```bash
pnpm run governance
```

This will start the governance MCP server with the inspector interface for debugging.

### Governance Tools

The governance server exposes high-level actions that map to the workflow phases:

#### Planning Phase
- `mcp__governance__start_planning_session`: Start a new planning session for a PRD/Goal
- `mcp__governance__add_planning_thought`: Record a thought during planning
- `mcp__governance__create_epic`: Create a new epic
- `mcp__governance__create_story`: Create a user story
- `mcp__governance__create_task`: Create a new implementation task
- `mcp__governance__create_subtask`: Create a subtask within a task
- `mcp__governance__list_tasks`: List all tasks in the current plan
- `mcp__governance__create_sprint`: Create a new sprint with selected stories/tasks
- `mcp__governance__get_sprint_info`: Get information about a sprint

#### Implementation Phase
- `mcp__governance__start_implementation`: Start implementing a specific task
- `mcp__governance__update_task_status`: Update the status of a task (in-progress, blocked)
- `mcp__governance__track_file_read`: Track file reads (actual reading done through Claude's View tool)
- `mcp__governance__track_file_edit`: Track file edits (actual editing done through Claude's Edit tool)
- `mcp__governance__log_daily_work`: Record work done for the day
- `mcp__governance__complete_implementation`: Mark implementation as complete

#### Review and Commit Phase
- `mcp__governance__start_code_review`: Begin code review process
- `mcp__governance__commit_changes`: Commit changes for the task
- `mcp__governance__create_branch`: Create a feature branch
- `mcp__governance__create_pull_request`: Create a pull request
- `mcp__governance__update_sprint_status`: Update sprint status with completed work

#### Available in Multiple Phases
- `mcp__governance__search_code`: Search for code patterns (planning/implementation)
- `mcp__governance__run_command`: Run allowed command based on current phase

The governance server enforces the workflow by only allowing certain actions during specific phases and validating the state transitions.

## Guiding Principles

- **Bounded Contexts**: The server's functionality is divided into distinct contexts (Planning, Documentation, Version Control, Thinking) each with its own Application Service.
- **API-Driven Workflow**: The agent interacts with high-level use cases exposed as MCP tools. These tools map directly to methods on the Application Services.
- **Repository-Owned State**: Core domain state (Goals, Todos, etc.) is managed within the repository via Infrastructure implementations (e.g., JSON files in .docs/).
- **Application Layer Governance**: Workflow rules and document interactions are orchestrated within the Application Services, ensuring consistency.
- **Thin Transport Layer**: The MCP server (index.ts) acts primarily as a router, delegating requests to the appropriate Application Service.

## Architecture Overview (Bounded Contexts & Layers)

### Planning Context:
- **Domain**: 
  - **Entities**: 
    - `PRD`: Product Requirements Document with ID (e.g., PRD-EM-01) and sections
    - `Epic`: Large initiative that may span multiple sprints
    - `Story`: User-focused feature description
    - `Task`: Implementation task (previously called Todo)
    - `Subtask`: Smaller unit of work within a Task
    - `Sprint`: Time-boxed collection of Stories and Tasks
    - `Goal`: Overall objective (renamed from current Goal)
    - `ImplementationPlan`: Collection of Tasks for a Goal/PRD
  - **Interfaces**: 
    - IPRDRepository, IEpicRepository, IStoryRepository
    - ITaskRepository, ISprintRepository, IGoalRepository
    
- **Application**: 
  - PlanningApplicationService
    - Handles PRD, Epic, Story, Task, Subtask management
    - Sprint planning and task allocation
    - Task status updates
    
- **Infrastructure**: 
  - JsonFilePRDRepository, JsonFileEpicRepository, JsonFileStoryRepository
  - JsonFileTaskRepository, JsonFileSprintRepository
  - All interacting with structured files in .docs/ directory

### Thinking Context:
- **Domain**: ThinkingProcess, Thought entities; IThinkingProcessRepository interface.
- **Application**: ThinkingApplicationService (Handles add_thought, get_thinking_history).
- **Infrastructure**: JsonFileThinkingProcessRepository (interacting with .docs/thinking.json).

### Documentation Context:
- **Domain**:
  - **Entities**:
    - `PRDDocument`: Structure representing a PRD markdown file
    - `SprintDocument`: Sprint planning and progress document
    - `DailyLog`: Daily work summaries and accomplishments
    - `StatusReport`: Weekly/periodic status reports
    - `Metrics`: Project metrics and KPIs
  - **Value Objects**:
    - `DocumentSection`: Represents markdown sections with start/end markers
    - `TaskStatus`: Enumeration (todo, in-progress, done, blocked)
    - `MetricValue`: Time series data point for project metrics
    
- **Application**:
  - DocumentationApplicationService:
    - PRD document management
    - Sprint documents creation and updating
    - Task status updating across documents
    - Work summary logging
    - Dashboard metrics calculation and updating
    
- **Infrastructure**:
  - MarkdownFileService:
    - Implements parsing/updating logic for markdown files
    - Manages document sections, tables, and metrics charts
    - Handles files in structured directories:
      - `.docs/prd/`: PRD documents (e.g., `PRD-EM-01.md`, `PRD-AUTH-02.md`)
      - `.docs/planning/`: Planning artifacts
        - `.docs/planning/epics/`: Epic documents (e.g., `EPIC-01-user-management.md`)
        - `.docs/planning/stories/`: User stories (e.g., `STORY-101-login-flow.md`)
      - `.docs/sprints/`: Sprint planning and tracking
        - `.docs/sprints/sprint_2025-05-06.md`: Individual sprint documents
        - `.docs/sprints/current.md`: Current sprint (symlink)
      - `.docs/logs/`: Daily work logs
        - `.docs/logs/2025-05-07.md`: Daily detailed work
      - `.docs/reports/`: Status reports
        - `.docs/reports/weekly/`: Weekly status reports
        - `.docs/reports/monthly/`: Monthly progress summaries
      - `.docs/dashboard/`: Project dashboards and metrics
        - `.docs/dashboard/metrics.md`: Key metrics dashboard
        - `.docs/dashboard/burndown.md`: Sprint burndown charts
      - `.docs/data/`: JSON data files for repositories
        - `.docs/data/tasks.json`: Task repository data
        - `.docs/data/sprints.json`: Sprint repository data
        - `.docs/data/thinking.json`: Thinking process data

### Version Control Context:
- **Domain**:
  - **Entities**:
    - `Commit`: Represents a Git commit with metadata
    - `Branch`: Represents a Git branch (feature, hotfix, etc.)
    - `PullRequest`: Represents a PR with associated tasks
  - **Value Objects**:
    - `CommitMessage`: Structured message with PRD/Task references
    - `GitStatus`: Representation of working tree status
    - `FileChange`: Modified/added/deleted file with metadata
    - `BranchNamingConvention`: Rules for branch name formatting
    
- **Application**:
  - VersionControlApplicationService:
    - Task-based commit creation
    - Branch management based on tasks/PRDs
    - Pull request creation and management
    - Integration with Planning and Documentation contexts
    - Enforces version control policy and conventions
    
- **Infrastructure**:
  - GitInfrastructureService:
    - Wraps Git CLI commands (commit, branch, merge, status)
    - Manages Git operations with proper formatting
    - Tracks relationships between commits and tasks

### Presentation/Transport Layer:
- **src/index.ts**: The MCP server, mapping incoming tool calls to Application Service methods.

(SOLID principles like Single Responsibility (SRP) are applied by separating contexts, Dependency Inversion (DIP) by using repository interfaces, etc.)

## User Journey & Interaction Patterns with Governance Server

Here's the workflow now enforced by the Governance Server, which acts as the sole intermediary between Claude Code and all other tools:

### 1. Task Assignment:
- **User Input**: Provide a clear task description with PRD reference.
  ```bash
  claude "Implement the Eisenhower Matrix feature for todost (PRD-EM-01), see sprint plan .docs/sprints/sprint_2025-05-06.md"
  ```
- **Agent Action**: Consults this `DESIGN.md` file and examines the referenced PRD and sprint plan.

### 2. Planning Initiation:
- **Agent → Governance**: Calls the governance planning tool with PRD reference.
  ```
  Tool Call: mcp__governance__start_planning_session
  Arguments: { 
    "prdId": "PRD-EM-01", 
    title": "Implement Eisenhower Matrix feature for todost",
    "sprintId": "2025-05-06"
  }
  ```
- **Governance → Planner**: Governance server validates the request and proxies to the planner.
  - Updates workflow state to PLANNING phase
  - Loads the PRD document for reference
  - Associates with the specified sprint
  - Calls PlanningApplicationService.startPlanningSession()
- **Governance → Agent**: Returns sequential thinking prompt and workflow state.

### 3. Guided Planning & Task Breakdown:
- **Agent ↔ User**: Agent asks clarifying questions about the PRD requirements.
- **Agent → Governance (Record Thinking)**: Records reasoning.
  ```
  Tool Call: mcp__governance__add_planning_thought
  Arguments: { "thought": "User confirmed need for is_urgent/is_important fields in the Eisenhower Matrix implementation." }
  ```
- **Governance → Planner**: Validates the request and proxies to ThinkingApplicationService.
- **Agent → Governance (Epic Creation)**: Creates an epic if needed.
  ```
  Tool Call: mcp__governance__create_epic
  Arguments: { 
    "title": "Eisenhower Matrix Implementation", 
    "description": "Add prioritization capabilities using the Eisenhower Matrix method",
    "prdIds": ["PRD-EM-01"]
  }
  ```
- **Agent → Governance (Story Creation)**: Creates user stories.
  ```
  Tool Call: mcp__governance__create_story
  Arguments: { 
    "title": "User can mark tasks as urgent/important", 
    "description": "As a user, I want to mark tasks as urgent and/or important to prioritize my work",
    "epicId": "EPIC-12",
    "complexity": 5
  }
  ```
- **Agent → Governance (Task Creation)**: Creates implementation tasks.
  ```
  Tool Call: mcp__governance__create_task
  Arguments: { 
    "title": "Update GTDFields data model", 
    "description": "Add is_urgent/is_important fields to the data model",
    "storyId": "STORY-45",
    "complexity": 3
  }
  ```
- **Governance → Planner**: Validates each request and proxies to PlanningApplicationService.

### 4. Implementation:
- **Agent → Governance**: Starts implementation of a specific task.
  ```
  Tool Call: mcp__governance__start_implementation
  Arguments: { "taskId": "TASK-102" }
  ```
- **Governance → State Update**: 
  - Updates state to IMPLEMENTATION phase with active task
  - Updates task status in sprint document to "in-progress"
  - Records implementation start time

- **Agent → Claude Tools**: Reads files directly using Claude's View tool.
  ```
  Tool Call: View
  Arguments: { "file_path": "/path/to/file.ts" }
  ```
- **Agent → Governance**: Tracks the file read for auditing.
  ```
  Tool Call: mcp__governance__track_file_read
  Arguments: { "filePath": "/path/to/file.ts" }
  ```
- **Agent → Claude Tools**: Edits files directly using Claude's Edit tool.
  ```
  Tool Call: Edit
  Arguments: { "file_path": "/path/to/file.ts", "old_string": "...", "new_string": "..." }
  ```
- **Agent → Governance**: Tracks the file edit for auditing.
  ```
  Tool Call: mcp__governance__track_file_edit
  Arguments: { "filePath": "/path/to/file.ts" }
  ```
- **Agent → Governance**: Logs work during implementation.
  ```
  Tool Call: mcp__governance__log_daily_work
  Arguments: { 
    "taskId": "TASK-102", 
    "entry": "Implemented is_urgent/is_important fields in data model",
    "timeSpent": 30
  }
  ```

### 5. Task Completion:
- **Agent → Governance**: Completes implementation.
  ```
  Tool Call: mcp__governance__complete_implementation
  Arguments: { 
    "taskId": "TASK-102",
    "summaryPoints": [
      "Added is_urgent/is_important boolean fields to Task model",
      "Updated database schema with new fields",
      "Added field validation in API"
    ],
    "testingNotes": "Verified field persistence and validation"
  }
  ```
- **Governance → State Update**: Updates state to REVIEW_AND_COMMIT phase.
- **Governance → Planner**: 
  - Calls PlanningApplicationService.completeTask() with the active task ID
  - Updates task status to "done" in the data repository
- **Governance → Documentation**: 
  - Updates sprint document to mark task as complete
  - Adds work summary to daily log
  - Updates burndown chart in dashboard

### 6. Committing Work:
- **Agent → Governance**: Creates a branch for the changes if needed.
  ```
  Tool Call: mcp__governance__create_branch
  Arguments: { 
    "name": "feature/eisenhower-matrix-fields",
    "baseBranch": "develop"
  }
  ```
- **Agent → Governance**: Commits changes.
  ```
  Tool Call: mcp__governance__commit_changes
  Arguments: { 
    "taskId": "TASK-102",
    "message": "Added is_urgent/is_important fields for Eisenhower Matrix implementation"
  }
  ```
- **Governance → Version Control**: 
  - Validates the request (only allowed in REVIEW_AND_COMMIT phase)
  - Automatically formats commit message with proper structure:
    - `[PRD-EM-01] (TASK-102) Added is_urgent/is_important fields for Eisenhower Matrix implementation`
  - Calls VersionControlApplicationService.commitTaskChanges()
  
- **Agent → Governance**: Creates pull request if needed.
  ```
  Tool Call: mcp__governance__create_pull_request
  Arguments: { 
    "title": "Eisenhower Matrix Fields Implementation",
    "description": "Adds support for marking tasks as urgent and important",
    "sourceBranch": "feature/eisenhower-matrix-fields",
    "targetBranch": "develop",
    "taskIds": ["TASK-102", "TASK-103"],
    "reviewers": ["@tech-lead", "@product-manager"]
  }
  ```
- **Governance → State Update**: Updates state to COMPLETED phase.

### 7. Iteration / Conclusion:
- **Agent → User**: Confirms completion and asks for next task.
- **User Input**: Directs agent or ends session.

## Key Benefits of the Hybrid Governance Approach

- **Balanced Control**: The governance server manages workflow state while Claude retains direct tool access for efficiency
- **Workflow Structure**: The governance server provides clear phase transitions and state tracking
- **Direct File Operations**: Claude can use native file tools for immediate feedback and performance
- **Audit Trail**: Key workflow transitions and decisions are logged in the governance state
- **Flexibility with Structure**: Combines the freedom of direct tool access with the structure of workflow governance
- **Best of Both Worlds**: Uses governance for high-level processes while leveraging Claude's built-in capabilities for implementation details

## Key Tools (Mapping to Application Services)

- start_planning(goal: string) → PlanningApplicationService.startPlanningSession
- add_todo(...) → PlanningApplicationService.addTodoToCurrentPlan
- get_todos() → PlanningApplicationService.getCurrentTodos
- complete_task(todoId: string, summaryPoints: string[]) → PlanningApplicationService.completeTask (Orchestrates Planning & Documentation updates)
- remove_todo(todoId: string) → PlanningApplicationService.removeTodo (Potentially orchestrates Documentation update)
- add_thought(thought: string) → ThinkingApplicationService.addThought
- commit_changes(todoId: string, message: string) → VersionControlApplicationService.commitTaskChanges

This structure provides clearer boundaries, enhances testability (Application/Domain layers can be tested independently of Infrastructure), and makes the system more adaptable to future changes by isolating responsibilities within specific contexts and layers.