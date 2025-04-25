# CODEX.md - Governed Planner Workflow (DDD/SOLID Refined)

This document guides interactions with the coding agent (Claude Code) within this repository. It focuses on the workflow enforced by the integrated governed_planner MCP server, which is designed following Domain-Driven Design (DDD) and SOLID principles for maintainability and clear separation of concerns.

## Guiding Principles

- **Bounded Contexts**: The server's functionality is divided into distinct contexts (Planning, Documentation, Version Control, Thinking) each with its own Application Service.
- **API-Driven Workflow**: The agent interacts with high-level use cases exposed as MCP tools. These tools map directly to methods on the Application Services.
- **Repository-Owned State**: Core domain state (Goals, Todos, etc.) is managed within the repository via Infrastructure implementations (e.g., JSON files in .docs/).
- **Application Layer Governance**: Workflow rules and document interactions are orchestrated within the Application Services, ensuring consistency.
- **Thin Transport Layer**: The MCP server (index.ts) acts primarily as a router, delegating requests to the appropriate Application Service.

## Architecture Overview (Bounded Contexts & Layers)

### Planning Context:
- **Domain**: Goal, ImplementationPlan, Todo entities; IGoalRepository, IImplementationPlanRepository interfaces.
- **Application**: PlanningApplicationService (Handles start_planning, add_todo, get_todos, update_task_status use cases).
- **Infrastructure**: JsonFileGoalRepository, JsonFilePlanRepository (implementing interfaces, interacting with .docs/data.json).

### Thinking Context:
- **Domain**: ThinkingProcess, Thought entities; IThinkingProcessRepository interface.
- **Application**: ThinkingApplicationService (Handles add_thought, get_thinking_history).
- **Infrastructure**: JsonFileThinkingProcessRepository (interacting with .docs/thinking.json).

### Documentation Context:
- **Domain**: (Potentially value objects representing document sections or metrics).
- **Application**: DocumentationApplicationService (Handles update_sprint_task_status, append_work_summary, update_dashboard_metrics).
- **Infrastructure**: MarkdownFileService (implements parsing/updating logic for specific sections in sprints/*.md, reports/*.md, dashboard.md).

### Version Control Context:
- **Domain**: (Potentially value objects for Commit messages, Git status).
- **Application**: VersionControlApplicationService (Handles commit_task_changes).
- **Infrastructure**: GitInfrastructureService (wraps git CLI commands for commit, status, log).

### Presentation/Transport Layer:
- **src/index.ts**: The MCP server, mapping incoming tool calls to Application Service methods.

(SOLID principles like Single Responsibility (SRP) are applied by separating contexts, Dependency Inversion (DIP) by using repository interfaces, etc.)

## User Journey & Interaction Patterns (DDD/SOLID Refined)

Here's the workflow emphasizing the interaction with Application Services via MCP tools:

### 1. Task Assignment:
- **User Input**: Provide a clear task description.
  ```bash
  claude "Implement the Eisenhower Matrix feature for todost (PRD-EM-01), see sprint plan docs/planning/sprints/sprint_2025-05-06.md"
  ```
- **Agent Action**: Consults this CODEX.md.

### 2. Planning Initiation:
- **Agent → MCP**: Calls the planning tool.
  ```
  Tool Call: mcp__governed_planner__start_planning
  Arguments: { "goal": "Implement Eisenhower Matrix feature for todost (PRD-EM-01)" }
  ```
- **MCP → Application**: Routes to PlanningApplicationService.startPlanningSession().
- **Application/Infrastructure Action**: PlanningApplicationService creates Goal and ImplementationPlan, saves via repositories (to .docs/data.json), potentially extracting PRD ID.
- **MCP → Agent**: Returns sequential thinking prompt.

### 3. Guided Planning & Task Breakdown:
- **Agent ↔ User**: Agent asks clarifying questions.
- **Agent → MCP (Record Thinking)**: Records reasoning.
  ```
  Tool Call: mcp__governed_planner__add_thought
  Arguments: { "thought": "User confirmed need for is_urgent/is_important fields." }
  ```
- **MCP → Application**: Routes to ThinkingApplicationService.addThought(). Saves to .docs/thinking.json.
- **Agent → MCP (Task Creation)**: Adds todos.
  ```
  Tool Call: mcp__governed_planner__add_todo
  Arguments: { "title": "Update GTDFields data model", "description": "Add is_urgent/is_important", "complexity": 3 }
  ```
- **MCP → Application**: Routes to PlanningApplicationService.addTodoToCurrentPlan(). Saves todo state to .docs/data.json.

### 4. Implementation:
- **User Input**: Directs agent to implement a task (e.g., "Implement T-102").
- **Agent Action**: Reads files, proposes changes, applies approved edits.

### 5. Task Completion & Documentation Update:
- **User Input**: Instructs agent the task is done.
  ```
  User: "Implementation for T-102 is complete. Please log work and update status."
  ```
- **Agent → MCP**: Calls the primary task completion tool.
  ```
  Tool Call: mcp__governed_planner__complete_task
  Arguments: { "todoId": "T-102", "summaryPoints": ["Added is_urgent/is_important fields.", "Updated types."] }
  ```
- **MCP → Application**: Routes call to PlanningApplicationService.completeTask().
- **Application Service Orchestration**:
  - PlanningApplicationService finds the Todo (T-102) via its repository.
  - It calls DocumentationApplicationService.updateSprintTaskStatus(todoId="T-102", status="done").
  - DocumentationApplicationService uses MarkdownFileService (Infrastructure) to parse sprints/*.md, update the status marker for T-102, and save the file.
  - It calls DocumentationApplicationService.appendWorkSummary(date=today, points=summaryPoints).
  - DocumentationApplicationService uses MarkdownFileService to append structured points to reports/*.md.
  - (Optional) It calls DocumentationApplicationService.updateDashboardMetrics().
  - DocumentationApplicationService uses MarkdownFileService to update metrics in dashboard.md.
  - PlanningApplicationService marks the Todo as complete in its state and saves via its repository (to .docs/data.json).
- **MCP → Agent**: Returns success or aggregated errors from services.

### 6. Committing Work:
- **Agent → MCP**: Uses the dedicated commit tool.
  ```
  Tool Call: mcp__governed_planner__commit_changes
  Arguments: { "todoId": "T-102", "message": "[PRD-EM-01] (T-102) Update GTDFields model\n\n- Added fields." }
  ```
- **MCP → Application**: Routes to VersionControlApplicationService.commitTaskChanges().
- **Application/Infrastructure Action**: VersionControlApplicationService validates the message format (using todoId to fetch PRD ID from PlanningApplicationService if needed), uses GitInfrastructureService to execute git commit, returns result.

### 7. Iteration / Conclusion:
- **Agent → User**: Confirms commit and doc updates, prompts for next step.
- **User Input**: Directs agent or ends session.

## Key Tools (Mapping to Application Services)

- start_planning(goal: string) → PlanningApplicationService.startPlanningSession
- add_todo(...) → PlanningApplicationService.addTodoToCurrentPlan
- get_todos() → PlanningApplicationService.getCurrentTodos
- complete_task(todoId: string, summaryPoints: string[]) → PlanningApplicationService.completeTask (Orchestrates Planning & Documentation updates)
- remove_todo(todoId: string) → PlanningApplicationService.removeTodo (Potentially orchestrates Documentation update)
- add_thought(thought: string) → ThinkingApplicationService.addThought
- commit_changes(todoId: string, message: string) → VersionControlApplicationService.commitTaskChanges

This structure provides clearer boundaries, enhances testability (Application/Domain layers can be tested independently of Infrastructure), and makes the system more adaptable to future changes by isolating responsibilities within specific contexts and layers.