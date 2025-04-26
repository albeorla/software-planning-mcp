# Software Planning Tool Architecture

## Class Diagram

```mermaid
classDiagram
    %% Domain Entities
    class Goal {
        +string id
        +string description
        +string createdAt
        +equals(Goal): boolean
        +static create(string): Goal
        +static fromPersistence(object): Goal
    }
    
    class Todo {
        +string id
        +string title
        +string description
        +number complexity
        +string? codeExample
        +boolean isComplete
        +string createdAt
        +string updatedAt
        +markComplete(): void
        +markIncomplete(): void
        +static create(object): Todo
        +static fromPersistence(object): Todo
    }
    
    class Thought {
        +string id
        +string content
        +string createdAt
        +static create(string): Thought
        +static fromPersistence(object): Thought
    }
    
    class ThinkingProcess {
        +string id
        +string|null goalId
        +string updatedAt
        -Thought[] _history
        +addThought(Thought): void
        +get history(): Thought[]
        +static create(string|null): ThinkingProcess
        +static fromPersistence(object): ThinkingProcess
        -touch(): void
    }
    
    class ImplementationPlan {
        +string goalId
        -Todo[] _todos
        +string updatedAt
        +addTodo(Todo): void
        +removeTodo(string): boolean
        +get todos(): Todo[]
        -touch(): void
    }
    
    class Entity {
        <<abstract>>
        +string id
        #DomainEvent[] domainEvents
        +registerEvent(DomainEvent): void
        +releaseEvents(): DomainEvent[]
    }
    
    class Roadmap {
        +string id
        +string title
        +string description
        +string version
        +string owner
        -Map<string, RoadmapTimeframe> _timeframes
        +string createdAt
        +string updatedAt
        +addTimeframe(RoadmapTimeframe): Roadmap
        +removeTimeframe(string): Roadmap
        +get timeframes(): RoadmapTimeframe[]
        +getTimeframe(string): RoadmapTimeframe|undefined
        +update(object): Roadmap
        +static create(string, string, string, string, RoadmapTimeframe[]): Roadmap
        +static fromPersistence(object): Roadmap
        +toJSON(): object
    }
    
    class RoadmapTimeframe {
        +string id
        +string name
        +number order
        -Map<string, RoadmapInitiative> _initiatives
        +addInitiative(RoadmapInitiative): RoadmapTimeframe
        +removeInitiative(string): RoadmapTimeframe
        +get initiatives(): RoadmapInitiative[]
        +getInitiative(string): RoadmapInitiative|undefined
        +update(object): RoadmapTimeframe
        +static create(string, number, RoadmapInitiative[]): RoadmapTimeframe
        +static fromPersistence(object): RoadmapTimeframe
        +toJSON(): object
    }
    
    class RoadmapInitiative {
        +string id
        +string title
        +string description
        +Category category
        +Priority priority
        -Map<string, RoadmapItem> _items
        +addItem(RoadmapItem): RoadmapInitiative
        +removeItem(string): RoadmapInitiative
        +get items(): RoadmapItem[]
        +getItem(string): RoadmapItem|undefined
        +update(object): RoadmapInitiative
        +static create(string, string, Category, Priority, RoadmapItem[]): RoadmapInitiative
        +static fromPersistence(object): RoadmapInitiative
        +toJSON(): object
    }
    
    class RoadmapItem {
        +string id
        +string title
        +string description
        +Status status
        +string[] relatedEntities
        +string notes
        +update(object): RoadmapItem
        +updateStatus(Status): RoadmapItem
        +static create(string, string, Status, string[], string): RoadmapItem
        +static fromPersistence(object): RoadmapItem
        +toJSON(): object
    }
    
    class RoadmapNote {
        +string id
        +string title
        +string content
        +Category category
        +Priority priority
        +string timeline
        +string[] relatedItems
        +string createdAt
        +string updatedAt
        +static create(object): RoadmapNote
        +update(object): RoadmapNote
    }
    
    %% Domain Events
    class DomainEvent {
        <<interface>>
        +Date occurredOn
        +string eventType
    }
    
    class EventDispatcher {
        <<singleton>>
        -static instance: EventDispatcher
        -Map<string, Function[]> handlers
        +static getInstance(): EventDispatcher
        +register(string, Function): void
        +dispatch(DomainEvent): void
    }
    
    class RoadmapItemStatusChanged {
        +string roadmapId
        +string timeframeId
        +string initiativeId
        +string itemId
        +Status oldStatus
        +Status newStatus
        +Date occurredOn
        +string eventType
    }
    
    class RoadmapInitiativePriorityChanged {
        +string roadmapId
        +string timeframeId
        +string initiativeId
        +Priority oldPriority
        +Priority newPriority
        +Date occurredOn
        +string eventType
    }
    
    %% Value Objects
    class Priority {
        <<value object>>
        -string value
        +static HIGH: Priority
        +static MEDIUM: Priority
        +static LOW: Priority
        +static fromString(string): Priority
        +equals(Priority): boolean
        +toString(): string
        +get isHigh(): boolean
        +get isMedium(): boolean
        +get isLow(): boolean
    }
    
    class Status {
        <<value object>>
        -string value
        +static PLANNED: Status
        +static IN_PROGRESS: Status
        +static COMPLETED: Status
        +static CANCELED: Status
        +static fromString(string): Status
        +equals(Status): boolean
        +toString(): string
        +get isActive(): boolean
        +get isCompleted(): boolean
        +get isCanceled(): boolean
    }
    
    class Category {
        <<value object>>
        -string value
        +static FEATURE: Category
        +static ENHANCEMENT: Category
        +static BUG: Category
        +static ARCHITECTURE: Category
        +static fromString(string): Category
        +equals(Category): boolean
        +toString(): string
    }
    
    %% Domain Services
    class RoadmapPriorityService {
        +validateInitiativePriorities(Roadmap): {valid: boolean, message?: string}
        +rebalancePriorities(Roadmap): Roadmap
        -countInitiativesByPriority(Roadmap, Priority): number
    }
    
    class RoadmapTimeframeService {
        +validateTimeframeSequence(Roadmap): {valid: boolean, message?: string}
        +getNextTimeframeOrder(Roadmap): number
        +reorderTimeframes(Roadmap): Roadmap
    }
    
    class RoadmapValidationService {
        +validateRoadmap(Roadmap): {valid: boolean, messages: string[]}
        +validateTimeframe(RoadmapTimeframe): {valid: boolean, messages: string[]}
        +validateInitiative(RoadmapInitiative): {valid: boolean, messages: string[]}
        +validateItem(RoadmapItem): {valid: boolean, messages: string[]}
    }
    
    %% Repository Interfaces
    class GoalRepository {
        <<interface>>
        +save(Goal): Promise~void~
        +findById(string): Promise~Goal|null~
    }
    
    class ImplementationPlanRepository {
        <<interface>>
        +savePlan(ImplementationPlan): Promise~void~
        +findByGoalId(string): Promise~ImplementationPlan|null~
    }
    
    class ThinkingProcessRepository {
        <<interface>>
        +save(ThinkingProcess): Promise~void~
        +findByGoalId(string): Promise~ThinkingProcess|null~
    }
    
    class RoadmapRepository {
        <<interface>>
        +save(Roadmap): Promise~void~
        +findById(string): Promise~Roadmap|null~
        +findAll(): Promise~Roadmap[]~
        +findByOwner(string): Promise~Roadmap[]~
        +findByVersion(string): Promise~Roadmap[]~
        +delete(string): Promise~boolean~
    }
    
    class RoadmapNoteRepository {
        <<interface>>
        +save(RoadmapNote): Promise~void~
        +findById(string): Promise~RoadmapNote|null~
        +findByCategory(string): Promise~RoadmapNote[]~
        +findByPriority(string): Promise~RoadmapNote[]~
        +findByTimeline(string): Promise~RoadmapNote[]~
        +findAll(): Promise~RoadmapNote[]~
        +delete(string): Promise~boolean~
    }
    
    %% Application Services
    class PlanningApplicationService {
        -GoalRepository goals
        -ImplementationPlanRepository plans
        -PlanParser parser
        +startPlanningSession(string): Promise~Goal~
        +getPlan(string): Promise~ImplementationPlan|null~
        +addTodoToCurrentPlan(string, object): Promise~Todo~
        +importPlan(string, string): Promise~number~
        +removeTodo(string, string): Promise~void~
        +getCurrentTodos(string): Promise~Todo[]~
        +updateTodoStatus(string, string, boolean): Promise~Todo~
        +completeTask(string, string, string[]): Promise~Todo~
        -requirePlan(string): Promise~ImplementationPlan~
    }
    
    class RoadmapQueryService {
        -IRoadmapRepository roadmapRepository
        -IRoadmapNoteRepository noteRepository
        +getRoadmap(string): Promise~Roadmap|null~
        +getAllRoadmaps(): Promise~Roadmap[]~
        +getRoadmapsByOwner(string): Promise~Roadmap[]~
        +getRoadmapNote(string): Promise~RoadmapNote|null~
        +getAllRoadmapNotes(): Promise~RoadmapNote[]~
        +getRoadmapNotesByCategory(string): Promise~RoadmapNote[]~
        +getRoadmapNotesByPriority(string): Promise~RoadmapNote[]~
        +getRoadmapNotesByTimeline(string): Promise~RoadmapNote[]~
    }
    
    class RoadmapCommandService {
        -IRoadmapRepository roadmapRepository
        -IRoadmapNoteRepository noteRepository
        -RoadmapValidationService validationService
        -RoadmapPriorityService priorityService
        -RoadmapTimeframeService timeframeService
        -EventDispatcher eventDispatcher
        +createRoadmap(string, string, string, string, object[]): Promise~Roadmap~
        +updateRoadmap(string, object): Promise~Roadmap|null~
        +deleteRoadmap(string): Promise~boolean~
        +addTimeframe(string, string, number): Promise~Roadmap|null~
        +addInitiative(string, string, string, string, string): Promise~Roadmap|null~
        +addItem(string, string, string, string, string, string?, string[]?, string?): Promise~Roadmap|null~
        +createRoadmapNote(string, string, string, string, string, string[]): Promise~RoadmapNote~
        +updateRoadmapNote(string, object): Promise~RoadmapNote|null~
        +deleteRoadmapNote(string): Promise~boolean~
        -dispatchEvents(Entity): void
    }
    
    class RoadmapApplicationService {
        -RoadmapCommandService commandService
        -RoadmapQueryService queryService
        +createRoadmap(string, string, string, string, object[]): Promise~Roadmap~
        +getRoadmap(string): Promise~Roadmap|null~
        +getAllRoadmaps(): Promise~Roadmap[]~
        +getRoadmapsByOwner(string): Promise~Roadmap[]~
        +updateRoadmap(string, object): Promise~Roadmap|null~
        +deleteRoadmap(string): Promise~boolean~
        +addTimeframe(string, string, number): Promise~Roadmap|null~
        +addInitiative(string, string, string, string, string): Promise~Roadmap|null~
        +addItem(string, string, string, string, string, string?, string[]?, string?): Promise~Roadmap|null~
        +createRoadmapNote(string, string, string, string, string, string[]): Promise~RoadmapNote~
        +updateRoadmapNote(string, object): Promise~RoadmapNote|null~
        +getRoadmapNote(string): Promise~RoadmapNote|null~
        +getAllRoadmapNotes(): Promise~RoadmapNote[]~
        +getRoadmapNotesByCategory(string): Promise~RoadmapNote[]~
        +getRoadmapNotesByPriority(string): Promise~RoadmapNote[]~
        +getRoadmapNotesByTimeline(string): Promise~RoadmapNote[]~
        +deleteRoadmapNote(string): Promise~boolean~
    }
    
    class ThinkingApplicationService {
        -ThinkingProcessRepository repo
        +addThought(string, string): Promise~ThinkingProcess~
        +getThinkingHistory(string): Promise~Thought[]~
    }
    
    class DocumentationApplicationService {
        -string docsBasePath
        -TemplateService templateService
        +initialize(): Promise~void~
        +updateSprintTaskStatus(string, string): Promise~void~
        +appendWorkSummary(Date, string[]): Promise~void~
        +updateDashboardMetrics(): Promise~void~
        +createPRD(string, string): Promise~object~
        +createEpic(string, string, string[]): Promise~object~
        +createUserStory(string, string, string, string, string): Promise~object~
        +createTask(string, string, string, number): Promise~object~
        +createSpike(string, string, string[], string, ...): Promise~object~
    }
    
    %% Governance Server and Handlers
    class GovernanceServer {
        -Server server
        -WorkflowState state
        -GovernanceToolProxy toolProxy
        +constructor()
        -setupResourceHandlers()
        -setupToolHandlers()
        -isCommandAllowedInCurrentPhase(string, string): boolean
        +run(): Promise~void~
    }
    
    class GovernanceToolProxy {
        +executeCommand(command, purpose): Promise~object~
        +searchCode(pattern, fileGlob): Promise~object~
    }
    
    class WorkflowState {
        +WorkflowPhase currentPhase
        +string? currentGoalId
        +string? currentImplementationTaskId
        +array fileReads
        +array fileEdits
        +setPhase(phase): void
        +setCurrentGoal(goalId): void
        +setCurrentTask(taskId): void
        +trackFileRead(path): void
        +trackFileEdit(path): void
        +resetImplementationTracking(): void
    }
    
    %% Document Handler Classes
    class RequirementsHandlers {
        <<static>>
        +createPRD(WorkflowState, prdData): Promise~object~
        +createEpic(WorkflowState, epicData): Promise~object~
    }
    
    class UserStoryHandlers {
        <<static>>
        +createStory(WorkflowState, storyData): Promise~object~
    }
    
    class ResearchHandlers {
        <<static>>
        +createSpike(WorkflowState, spikeData): Promise~object~
    }
    
    %% Task Handler Classes
    class TaskCreationHandlers {
        <<static>>
        +createTask(WorkflowState, ToolProxy, taskData): Promise~object~
        +createSubtask(WorkflowState, ToolProxy, subtaskData): Promise~object~
    }
    
    class TaskManagementHandlers {
        <<static>>
        +listTasks(WorkflowState, ToolProxy): Promise~object~
        +startImplementation(WorkflowState, ToolProxy, data): Promise~object~
        +completeImplementation(WorkflowState, ToolProxy, data): Promise~object~
    }
    
    class FileOperationHandlers {
        <<static>>
        +trackFileRead(WorkflowState, ToolProxy, data): Promise~object~
        +trackFileEdit(WorkflowState, ToolProxy, data): Promise~object~
    }
    
    %% Planning Handler Classes
    class SessionHandlers {
        <<static>>
        +startPlanningSession(WorkflowState, ToolProxy, data): Promise~object~
    }
    
    class SearchHandlers {
        <<static>>
        +searchCode(WorkflowState, ToolProxy, data): Promise~object~
    }
    
    class RoadmapManagementHandlers {
        <<static>>
        +createRoadmap(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
        +getRoadmap(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
        +listRoadmaps(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
        +addTimeframe(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
        +addInitiative(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
        +addRoadmapItem(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
    }
    
    class RoadmapNoteHandlers {
        <<static>>
        +createRoadmapNote(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
        +getRoadmapNote(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
        +updateRoadmapNote(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
        +listRoadmapNotes(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
        +deleteRoadmapNote(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
    }
    
    class RoadmapComponentHandlers {
        <<static>>
        +updateRoadmapItem(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
        +removeRoadmapItem(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
        +updateInitiative(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
        +removeInitiative(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
        +updateTimeframe(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
        +removeTimeframe(WorkflowState, ToolProxy, RoadmapService, data): Promise~object~
    }
    
    class SprintHandlers {
        <<static>>
        +createSprint(WorkflowState, sprintData): Promise~object~
        +getSprintInfo(WorkflowState, data): Promise~object~
        +updateSprintStatus(WorkflowState, data): Promise~object~
    }
    
    %% Version Control Handlers
    class VersionControlHandlers {
        <<static>>
        +commitChanges(WorkflowState, ToolProxy, data): Promise~object~
        +createBranch(WorkflowState, ToolProxy, data): Promise~object~
        +createPullRequest(WorkflowState, ToolProxy, data): Promise~object~
    }
    
    %% Relationships - Domain
    Entity <|-- Goal
    Entity <|-- Todo
    Entity <|-- ThinkingProcess
    Entity <|-- Roadmap
    Entity <|-- RoadmapTimeframe
    Entity <|-- RoadmapInitiative
    Entity <|-- RoadmapItem
    Entity <|-- RoadmapNote
    
    Goal "1" <-- "1" ImplementationPlan
    ImplementationPlan "1" *-- "many" Todo
    ThinkingProcess "1" *-- "many" Thought
    ThinkingProcess --> "0..1" Goal
    Roadmap "1" *-- "many" RoadmapTimeframe
    RoadmapTimeframe "1" *-- "many" RoadmapInitiative
    RoadmapInitiative "1" *-- "many" RoadmapItem
    
    %% Domain Events and Value Objects
    DomainEvent <|-- RoadmapItemStatusChanged
    DomainEvent <|-- RoadmapInitiativePriorityChanged
    EventDispatcher --> DomainEvent : dispatches
    RoadmapItem --> Status : uses
    RoadmapInitiative --> Priority : uses
    RoadmapInitiative --> Category : uses
    RoadmapNote --> Priority : uses
    RoadmapNote --> Category : uses
    
    %% Domain Services
    RoadmapPriorityService --> Roadmap : provides services for
    RoadmapPriorityService --> Priority : manages
    RoadmapTimeframeService --> Roadmap : provides services for
    RoadmapTimeframeService --> RoadmapTimeframe : manages
    RoadmapValidationService --> Roadmap : validates
    RoadmapValidationService --> RoadmapTimeframe : validates
    RoadmapValidationService --> RoadmapInitiative : validates
    RoadmapValidationService --> RoadmapItem : validates
    
    %% Relationships - Repositories
    GoalRepository <|.. JsonFileStorage : implements
    ImplementationPlanRepository <|.. JsonFileStorage : implements
    ThinkingProcessRepository <|.. InMemoryThinkingProcessRepository : implements
    ThinkingProcessRepository <|.. JsonFileThinkingProcessRepository : implements
    RoadmapRepository <|.. JsonFileRoadmapRepository : implements
    RoadmapNoteRepository <|.. JsonFileRoadmapNoteRepository : implements
    
    %% Relationships - Application Services
    PlanningApplicationService --> GoalRepository : uses
    PlanningApplicationService --> ImplementationPlanRepository : uses
    
    %% CQRS Roadmap Services
    RoadmapApplicationService --> RoadmapCommandService : uses
    RoadmapApplicationService --> RoadmapQueryService : uses
    RoadmapCommandService --> RoadmapRepository : uses
    RoadmapCommandService --> RoadmapNoteRepository : uses
    RoadmapCommandService --> RoadmapValidationService : uses
    RoadmapCommandService --> RoadmapPriorityService : uses
    RoadmapCommandService --> RoadmapTimeframeService : uses
    RoadmapCommandService --> EventDispatcher : uses
    RoadmapQueryService --> RoadmapRepository : uses
    RoadmapQueryService --> RoadmapNoteRepository : uses
    
    ThinkingApplicationService --> ThinkingProcessRepository : uses
    DocumentationApplicationService --> TemplateService : uses
    
    %% Relationships - Governance Server
    GovernanceServer --> WorkflowState : uses
    GovernanceServer --> GovernanceToolProxy : uses
    
    %% Document Handler Relationships
    GovernanceServer --> RequirementsHandlers : uses
    GovernanceServer --> UserStoryHandlers : uses
    GovernanceServer --> ResearchHandlers : uses
    RequirementsHandlers --> DocumentationApplicationService : uses
    UserStoryHandlers --> DocumentationApplicationService : uses
    ResearchHandlers --> DocumentationApplicationService : uses
    
    %% Task Handler Relationships
    GovernanceServer --> TaskCreationHandlers : uses
    GovernanceServer --> TaskManagementHandlers : uses
    GovernanceServer --> FileOperationHandlers : uses
    TaskCreationHandlers --> PlanningApplicationService : uses
    TaskManagementHandlers --> PlanningApplicationService : uses
    FileOperationHandlers --> PlanningApplicationService : uses
    
    %% Planning Handler Relationships
    GovernanceServer --> SessionHandlers : uses
    GovernanceServer --> SearchHandlers : uses
    GovernanceServer --> RoadmapManagementHandlers : uses
    GovernanceServer --> RoadmapNoteHandlers : uses
    GovernanceServer --> RoadmapComponentHandlers : uses
    GovernanceServer --> SprintHandlers : uses
    SessionHandlers --> PlanningApplicationService : uses
    SessionHandlers --> ThinkingApplicationService : uses
    RoadmapManagementHandlers --> RoadmapApplicationService : uses
    RoadmapNoteHandlers --> RoadmapApplicationService : uses
    RoadmapComponentHandlers --> RoadmapApplicationService : uses
    SprintHandlers --> DocumentationApplicationService : uses
    SearchHandlers --> GovernanceToolProxy : uses
    
    %% Version Control Handler Relationships
    GovernanceServer --> VersionControlHandlers : uses
    VersionControlHandlers --> VersionControlService : uses
```

## Domain Model Analysis

For a detailed analysis of our domain model and recommendations for improving our DDD implementation, refer to the [Domain Model Analysis](domain_model_analysis.md) document.

## Guiding Principles

Our architecture is guided by these core principles:

- **Bounded Contexts**: The system is divided into distinct contexts (Planning, Documentation, Version Control, Thinking), each with its own Application Service.

- **API-Driven Workflow**: The agent interacts with high-level use cases exposed as MCP tools that map directly to methods on the Application Services.

- **Repository-Owned State**: Core domain state (Goals, Todos, etc.) is managed within the repository via Infrastructure implementations.

- **Application Layer Governance**: Workflow rules and document interactions are orchestrated within the Application Services, ensuring consistency.

- **Thin Transport Layer**: The MCP server (governance-server.ts) acts primarily as a router, delegating requests to the appropriate Application Service.

- **Domain-Driven Design**: Rich domain model with value objects, domain events, and domain services to encapsulate business rules.

## Governance Architecture and Workflow

This project implements a governance server that acts as the intermediary between Claude Code and all other tools. This ensures structured workflow enforcement by controlling key interactions through a single point of access.

### Hybrid Approach

We use a hybrid approach that combines governance control with direct tool access:
- Governance server manages workflow state and enforces phase transitions
- Claude can directly use file tools for immediate feedback
- Key operations are tracked through the governance server
- All operations occur within a well-defined workflow phase

This balanced approach provides:
- **Workflow Structure**: Clear phase transitions and state tracking
- **Direct File Operations**: Native tool access for efficiency
- **Audit Trail**: Key workflow transitions are logged
- **Controlled Freedom**: Structure without excessive restrictions

### User Journey & Interaction Patterns

Here's the workflow enforced by the Governance Server:

1. **Task Assignment**:
   - User provides task description with PRD reference
   - Agent consults documentation and PRD/sprint plans

2. **Planning Initiation**:
   ```
   Tool Call: mcp__governance__start_planning_session
   Arguments: { 
     "prdId": "PRD-EM-01", 
     "title": "Implement Eisenhower Matrix feature",
     "sprintId": "2025-05-06"
   }
   ```
   - Governance server validates the request
   - Updates workflow state to PLANNING phase
   - Loads PRD document for reference
   - Associates with the specified sprint
   - Calls PlanningApplicationService.startPlanningSession()

3. **Guided Planning & Task Breakdown**:
   - Recording thinking process:
   ```
   Tool Call: mcp__governance__add_planning_thought
   Arguments: { 
     "thought": "User confirmed need for is_urgent/is_important fields..."
   }
   ```
   - Creating epics, stories, and tasks with appropriate tools

4. **Implementation**:
   - Starting task implementation:
   ```
   Tool Call: mcp__governance__start_implementation
   Arguments: { "taskId": "TASK-102" }
   ```
   - Reading/editing files with tracking:
   ```
   Tool Call: View
   Arguments: { "file_path": "/path/to/file.ts" }
   
   Tool Call: mcp__governance__track_file_read
   Arguments: { "filePath": "/path/to/file.ts" }
   ```

5. **Task Completion**:
   ```
   Tool Call: mcp__governance__complete_implementation
   Arguments: { 
     "taskId": "TASK-102",
     "summaryPoints": [
       "Added is_urgent/is_important boolean fields to Task model",
       "Updated database schema with new fields",
       "Added field validation in API"
     ]
   }
   ```
   - Updates state to REVIEW_AND_COMMIT phase
   - Updates task status to "done"
   - Updates sprint documents

6. **Committing Work**:
   - Creating branches and commits:
   ```
   Tool Call: mcp__governance__commit_changes
   Arguments: { 
     "taskId": "TASK-102",
     "message": "Added is_urgent/is_important fields..."
   }
   ```
   - Creating pull requests
   - Updates state to COMPLETED phase

### Application Services to Tool Mapping

The governance tools map directly to application service methods:
- `mcp__governance__start_planning_session` → PlanningApplicationService.startPlanningSession
- `mcp__governance__add_planning_thought` → ThinkingApplicationService.addThought
- `mcp__governance__create_task` → PlanningApplicationService.addTodoToCurrentPlan
- `mcp__governance__complete_implementation` → PlanningApplicationService.completeTask

## Handler-based Architecture

The Software Planning Tool has evolved to follow a unified handler-based architecture that better aligns with Domain-Driven Design principles:

## Bounded Contexts in Detail

### Planning Context:
- **Domain**: 
  - **Entities**: 
    - `PRD`: Product Requirements Document with ID (e.g., PRD-EM-01) and sections
    - `Epic`: Large initiative that may span multiple sprints
    - `Story`: User-focused feature description
    - `Task`: Implementation task
    - `Subtask`: Smaller unit of work within a Task
    - `Sprint`: Time-boxed collection of Stories and Tasks
    - `Goal`: Overall objective
    - `ImplementationPlan`: Collection of Tasks for a Goal/PRD
    - `Roadmap`: Strategic product roadmap with timeframes, initiatives, and items
    - `RoadmapNote`: Supplementary planning information
  - **Value Objects**:
    - `Priority`: High, medium, low priorities
    - `Status`: Planned, in-progress, completed, canceled
    - `Category`: Feature, enhancement, bug, architecture, etc.
  - **Interfaces**: 
    - IPRDRepository, IEpicRepository, IStoryRepository
    - ITaskRepository, ISprintRepository, IGoalRepository
    - IRoadmapRepository, IRoadmapNoteRepository
    
- **Application**: 
  - PlanningApplicationService
    - Handles PRD, Epic, Story, Task, Subtask management
    - Sprint planning and task allocation
    - Task status updates
  - RoadmapApplicationService
    - Manages roadmaps and roadmap notes
    - Handles timeframes, initiatives, and roadmap items
    
- **Infrastructure**: 
  - JsonFilePRDRepository, JsonFileEpicRepository, JsonFileStoryRepository
  - JsonFileTaskRepository, JsonFileSprintRepository
  - JsonFileRoadmapRepository, JsonFileRoadmapNoteRepository

### Thinking Context:
- **Domain**: ThinkingProcess, Thought entities; IThinkingProcessRepository interface.
- **Application**: ThinkingApplicationService (Handles add_thought, get_thinking_history).
- **Infrastructure**: JsonFileThinkingProcessRepository (interacting with JSON storage).

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
    
- **Application**:
  - VersionControlApplicationService:
    - Task-based commit creation
    - Branch management based on tasks/PRDs
    - Pull request creation and management
    
- **Infrastructure**:
  - GitInfrastructureService:
    - Wraps Git CLI commands (commit, branch, merge, status)
    - Manages Git operations with proper formatting

## Handler Architecture

1. **GovernanceServer**: Acts as the main entry point and orchestrator, handling MCP requests and enforcing workflow rules.

2. **Unified ActionHandler**: Core handler class that serves as the central coordination point for all operations, following the Command pattern.

3. **Specialized Handlers**: Domain-specific handlers organized by bounded context with fine-grained responsibilities:

   **Document Handlers:**
   - **RequirementsHandlers**: Manages PRD and Epic document creation
   - **UserStoryHandlers**: Handles user story creation and management
   - **ResearchHandlers**: Manages spike creation and research documentation

   **Task Handlers:**
   - **TaskCreationHandlers**: Handles task and subtask creation operations
   - **TaskManagementHandlers**: Manages task lifecycle and status updates
   - **FileOperationHandlers**: Tracks file reads and edits during implementation

   **Planning Handlers:**
   - **SessionHandlers**: Manages planning sessions, thought recording, and command execution
   - **SearchHandlers**: Provides code searching capabilities
   - **RoadmapManagementHandlers**: Handles roadmap creation and querying
   - **RoadmapNoteHandlers**: Manages roadmap notes
   - **RoadmapComponentHandlers**: Handles roadmap component operations
   - **SprintHandlers**: Handles sprint creation and management

   **Version Control Handlers:**
   - **VersionControlHandlers**: Manages git operations like branches, commits, and PRs

4. **WorkflowState**: Maintains the current state of the workflow including phase, active goal, and tracking information.

5. **GovernanceToolProxy**: Provides controlled access to external tools and commands.

This unified handler architecture with specialized sub-handlers improves the system by:
- Centralizing request handling while maintaining separation of concerns
- Organizing code by bounded context and specific responsibility
- Providing cleaner boundaries between different domains
- Enabling focused, domain-specific validation and business rules
- Creating a natural mapping between MCP tools and domain operations
- Following the Command pattern for consistent operation handling
- Making the system more maintainable and extensible
- Simplifying the process of adding new functionality

## Domain Events and Services

Our architecture now incorporates domain events and domain services to better align with DDD principles:

1. **Domain Events**:
   - Event objects that represent important domain occurrences
   - Used for cross-aggregate communication
   - Handled by centralized EventDispatcher
   - Examples: RoadmapItemStatusChanged, RoadmapInitiativePriorityChanged

2. **Domain Services**:
   - Services encapsulating operations that don't belong to a single entity
   - Focus on business rules and domain logic
   - Examples: RoadmapPriorityService, RoadmapTimeframeService, RoadmapValidationService

3. **Value Objects**:
   - Immutable objects representing domain concepts
   - Contain validation and behavior
   - Used in place of primitive types
   - Examples: Priority, Status, Category

These architectural elements enable a richer domain model that better captures business rules and domain knowledge.