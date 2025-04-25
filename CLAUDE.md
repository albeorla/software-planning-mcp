# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Build: `pnpm run build`
- Watch mode: `pnpm run watch`
- Test with MCP inspector: `pnpm run inspector`
- Governance server: `pnpm run governance`
- Generate metrics: `pnpm run metrics`
- Install dependencies: `pnpm install`

## Governance Workflow

Claude must follow the structured workflow enforced by the governance server. 
This means using specific tools at each stage of development:

1. **Planning Phase:**
   - Use `mcp__governance__start_planning_session` to begin a planning session
   - Use `mcp__governance__add_planning_thought` to record thoughts during planning
   - Use `mcp__governance__create_prd`, `mcp__governance__create_epic`, etc. to create documentation
   - Use `mcp__governance__create_task` to define implementation tasks

2. **Implementation Phase:**
   - Use `mcp__governance__start_implementation` to begin implementing a task
   - When reading files, always call `mcp__governance__track_file_read` before using View
   - When modifying files, always call `mcp__governance__track_file_edit` before using Edit
   - Use `mcp__governance__update_task_status` to update task status
   - Use `mcp__governance__log_daily_work` to log progress
   - Use `mcp__governance__complete_implementation` when finished

3. **Review and Commit Phase:**
   - Use `mcp__governance__start_code_review` for code review
   - Use `mcp__governance__create_branch` to create git branches
   - Use `mcp__governance__commit_changes` to commit work
   - Use `mcp__governance__create_pull_request` to create PRs

4. **Completed Phase:**
   - Use `mcp__governance__update_sprint_status` to update sprint status

IMPORTANT: Claude must NEVER use standard file operations (View, Edit, etc.) without first calling the corresponding governance tracking tool.

## Design and Architecture

This project implements a software planning tool following Domain-Driven Design (DDD) and SOLID principles. The architecture consists of:

1. **Domain Layer**: Contains entities, value objects, and repository interfaces
2. **Application Layer**: Contains application services that orchestrate use cases
3. **Infrastructure Layer**: Contains implementations of repository interfaces
4. **Presentation Layer**: The Governance MCP server that exposes tools to Claude

### Domain-Driven Design Implementation

This project follows DDD principles closely, with continuous refinement of the domain model:

- **Rich Domain Models**: Entities with behavior instead of anemic models
- **Aggregates & Aggregate Roots**: Proper encapsulation of related entities 
- **Repository Pattern**: Clean abstraction for persistence concerns
- **Bounded Contexts**: Clear separation between Planning, Thinking, Documentation, and Version Control
- **Domain Language**: Ubiquitous language throughout the codebase

For a comprehensive analysis of our domain model implementation and ongoing improvements, see the [Domain Model Analysis document](/docs/domain_model_analysis.md).

### Bounded Contexts

The application is divided into these bounded contexts:

1. **Planning Context**: Manages PRDs, Epics, Stories, Tasks, and Sprint planning
2. **Documentation Context**: Handles generating and updating markdown documentation
3. **Thinking Context**: Manages sequential thinking processes for planning
4. **Version Control Context**: Coordinates Git operations and connects tasks to commits

### Workflow Phases

The governance server enforces these workflow phases:
- **Planning**: Creating PRDs, Epics, Stories, Tasks
- **Implementation**: Executing tasks and modifying code
- **Review and Commit**: Code review and committing changes
- **Completed**: Finished tasks

## Code Organization Guidelines

- **Modular Configuration**: Tool definitions must be organized by category in separate files under `src/governance/config/`
- **File Size Limits**: No single file should exceed 400 lines of code
- **Metrics Monitoring**: Run `pnpm run metrics` regularly to identify files that need refactoring

## Implementation Status

**Status: In Progress**

- [x] Documentation Architecture - Added comprehensive class diagrams in `/docs/architecture.md`
- [x] Workflow Process Documentation - Created workflow diagrams in `/docs/workflow.md`
- [x] Claude Code Integration - Added detailed integration instructions in `/docs/claude-integration.md`
- [x] Demo Guide - Created step-by-step demo walkthrough in `/docs/demo.md`
- [x] DocumentationService - Implemented document creation for PRDs, Epics, Stories, Tasks, Subtasks, and Spikes
- [x] GovernanceServer - Refactored to use specialized handlers organized by bounded context
- [x] Enhanced DocumentTemplates with improved templates and role-based prompts
- [x] Handler-based Architecture - Implemented fine-grained handlers for better separation of concerns
- [ ] Sprint Management - Need to implement sprint creation and status tracking
- [ ] Version Control Context - GitInfrastructureService needs implementation
- [x] Planning Context - Implemented RoadmapNote entity and repository
- [ ] Planning Context - Need to complete remaining entity and repository implementations
- [ ] Work Logging - Need to implement daily work logging functionality

### Handler-based Architecture Progress

The code has been refactored to use specialized handlers organized by bounded context:

1. **Document Handlers:**
   - ✅ RequirementsHandlers - For PRD and Epic creation
   - ✅ UserStoryHandlers - For user story management
   - ✅ ResearchHandlers - For spikes and research documentation

2. **Task Handlers:**
   - ✅ TaskCreationHandlers - For task and subtask creation
   - ✅ TaskManagementHandlers - For task lifecycle management
   - ✅ FileOperationHandlers - For tracking file reads and edits

3. **Planning Handlers:**
   - ✅ SessionHandlers - For planning sessions and thought recording
   - ✅ SearchHandlers - For code search operations
   - ✅ RoadmapHandlers - For roadmap note management
   - ✅ SprintHandlers - For sprint management (API only, needs implementation)

4. **Version Control Handlers:**
   - ✅ VersionControlHandlers - For Git operations (API only, needs implementation)

### Next Implementation Tasks (Priority Order)

1. **Domain Model Refinement**: Implement recommendations from domain_model_analysis.md
   - ✅ Split Roadmap.ts into separate entity files (COMPLETED)
   - ✅ Split RoadmapHandlers.ts into focused handler classes (COMPLETED)
     - ✅ Created RoadmapManagementHandlers and RoadmapNoteHandlers
     - ✅ Added specialized RoadmapJsonFileStorage class
     - ✅ Implemented backward compatibility with deprecation notices
   - ✅ Split RoadmapService.ts (597 lines) into more focused service classes (COMPLETED)
     - ✅ Created RoadmapQueryService for read operations
     - ✅ Created RoadmapCommandService for write operations  
     - ✅ Created RoadmapApplicationService as a facade combining both services
     - ✅ Applied CQRS pattern to separate read/write operations
     - ✅ Maintained backward compatibility with deprecation notices
   - Create value objects for Priority, Status, etc.
   - Implement domain events for cross-aggregate communication
   - Add domain services for cross-entity operations

2. **Refactor Other Large Files**: Continue to split large files (>300 lines) according to metrics
3. Implement GitInfrastructureService for version control operations
4. Complete Sprint management functionality
5. Implement daily work logging and tracking
6. Enhance task status tracking across documents

## Required Implementation Tasks

### Documentation Context
- [x] Add methods to DocumentationService for creating PRDs, Epics, Stories, Tasks, Subtasks, and Spikes
- [x] Create document templates and structure for all document types
- [x] Implement MarkdownFileService for document generation
- [ ] Implement Sprint document creation and updating
- [ ] Add task status tracking across documents
- [ ] Implement dashboard metrics calculation and visualization
- [ ] Add work summary logging to daily logs

### Planning Context
- [x] Implement basic Goal and Todo entity management
- [x] Create PlanningService for adding/retrieving tasks
- [x] Implement comprehensive Product Roadmap domain model:
  - [x] Create Roadmap aggregate root with nested entities (Timeframes, Initiatives, Items)
  - [x] Create RoadmapNote entity for supplementary planning notes
  - [x] Implement IRoadmapRepository and IRoadmapNoteRepository interfaces
  - [x] Implement JsonFileRoadmapRepository and JsonFileRoadmapNoteRepository
  - [x] Create RoadmapApplicationService with full roadmap management capabilities
  - [x] Add RoadmapHandlers with governance tools for roadmap operations
- [ ] Implement interfaces for specialized repositories (IPRDRepository, IEpicRepository, etc.)
- [ ] Create comprehensive PlanningApplicationService for sprint management
- [ ] Implement sprint planning and task allocation

### Thinking Context
- [x] Implement ThinkingProcess and Thought entities
- [x] Create ThinkingService for recording sequential thoughts
- [ ] Enhance ThinkingProcess entity with additional metadata
- [ ] Improve ThinkingApplicationService implementation

### Version Control Context
- [ ] Implement Commit, Branch, PullRequest entities
- [ ] Create CommitMessage, GitStatus, FileChange value objects
- [ ] Implement GitInfrastructureService for Git operations
- [ ] Add methods for branch management and PR creation

### Governance Server
- [x] Set up GovernanceServer with workflow state enforcement
- [x] Refactor to unified handler architecture:
  - [x] Implemented ActionHandler as central command coordinator
  - [x] Document handlers (RequirementsHandlers, UserStoryHandlers, ResearchHandlers)
  - [x] Task handlers (TaskCreationHandlers, TaskManagementHandlers, FileOperationHandlers)
  - [x] Planning handlers (SessionHandlers with command execution, SearchHandlers, SprintHandlers)
  - [x] Version control handlers (VersionControlHandlers)
- [x] Implement planning phase tools:
  - [x] mcp__governance__start_planning_session (SessionHandlers)
  - [x] mcp__governance__add_planning_thought (SessionHandlers)
  - [x] mcp__governance__run_command (SessionHandlers)
  - [x] mcp__governance__create_prd (RequirementsHandlers)
  - [x] mcp__governance__create_epic (RequirementsHandlers)
  - [x] mcp__governance__create_story (UserStoryHandlers)
  - [x] mcp__governance__create_task (TaskCreationHandlers)
  - [x] mcp__governance__create_subtask (TaskCreationHandlers)
  - [x] mcp__governance__create_spike (ResearchHandlers)
  - [x] Roadmap planning tools:
    - [x] mcp__governance__create_roadmap (RoadmapHandlers)
    - [x] mcp__governance__get_roadmap (RoadmapHandlers)
    - [x] mcp__governance__list_roadmaps (RoadmapHandlers)
    - [x] mcp__governance__add_timeframe (RoadmapHandlers)
    - [x] mcp__governance__add_initiative (RoadmapHandlers)
    - [x] mcp__governance__add_roadmap_item (RoadmapHandlers)
    - [x] mcp__governance__create_roadmap_note (RoadmapHandlers)
    - [x] mcp__governance__get_roadmap_note (RoadmapHandlers)
    - [x] mcp__governance__update_roadmap_note (RoadmapHandlers)
    - [x] mcp__governance__list_roadmap_notes (RoadmapHandlers)
- [ ] Implement sprint management tools:
  - [x] API framework for mcp__governance__create_sprint (SprintHandlers)
  - [x] API framework for mcp__governance__get_sprint_info (SprintHandlers)
  - [x] API framework for mcp__governance__update_sprint_status (SprintHandlers)
  - [ ] Complete backend implementation for sprint management
- [ ] Implement implementation phase tools:
  - [x] mcp__governance__start_implementation (TaskManagementHandlers)
  - [x] mcp__governance__track_file_read (FileOperationHandlers)
  - [x] mcp__governance__track_file_edit (FileOperationHandlers)
  - [x] API framework for mcp__governance__update_task_status
  - [x] API framework for mcp__governance__log_daily_work
  - [ ] Complete backend implementation for task management
- [ ] Implement review and commit phase tools:
  - [x] mcp__governance__complete_implementation (TaskManagementHandlers)
  - [x] API framework for mcp__governance__start_code_review
  - [x] API framework for mcp__governance__create_branch
  - [x] API framework for mcp__governance__create_pull_request
  - [x] mcp__governance__commit_changes (VersionControlHandlers)
  - [ ] Complete backend implementation for version control

## Code Quality Standards

### SOLID Principles
1. **Single Responsibility Principle**: Classes have only one reason to change
   - Example: DocumentationService handles only documentation concerns
   - Separate services for planning, thinking, and version control

2. **Open/Closed Principle**: Open for extension, closed for modification
   - Use interfaces to allow implementing new repository types
   - Extend functionality through composition, not modification

3. **Liskov Substitution Principle**: Subtypes must be substitutable for base types
   - Repository implementations must fulfill interface contracts
   - No unexpected exceptions or side effects in derived classes

4. **Interface Segregation Principle**: Clients depend only on methods they use
   - Use specific repository interfaces like ITaskRepository
   - Split large interfaces into smaller, focused ones

5. **Dependency Inversion Principle**: High-level modules don't depend on low-level modules
   - Application services depend on repository interfaces, not implementations
   - Use constructor injection for dependencies

### Design Patterns
- **Repository Pattern**: Data access abstraction (already implemented)
- **Factory Method**: For creating complex entities
- **Strategy Pattern**: For swappable algorithms
- **Command Pattern**: For encapsulating actions
- **Observer Pattern**: For event notifications between bounded contexts
- **Proxy Pattern**: As implemented in GovernanceToolProxy

### Style Guidelines
- **Naming**:
  - PascalCase for interfaces, classes, and types
  - camelCase for methods, properties, and variables
  - Descriptive, intention-revealing names
  - Interface names prefixed with 'I' (e.g., ITaskRepository)

- **File Organization**:
  - One class per file (with exceptions for related small classes)
  - Organize files by bounded context, then by layer
  - Group related components together

- **Methods**:
  - Small, focused functions with a single responsibility
  - Clear parameter and return types
  - Async/await for asynchronous operations
  - Validate parameters at the beginning

- **Comments**:
  - Use JSDoc for public methods and classes
  - Document parameters, return values, and thrown exceptions
  - Comment on "why", not "what" (code should be self-explanatory)
  - Update comments when code changes

## Code Review Checklist

When implementing new features or reviewing code, check:

### Domain-Driven Design
- [ ] Code respects bounded context boundaries
- [ ] Uses domain terminology consistently
- [ ] Proper separation of layers (domain, application, infrastructure)
- [ ] Rich domain models with behavior, not anemic models

### SOLID and OOP
- [ ] Classes have a single responsibility
- [ ] Interfaces used for abstractions
- [ ] Dependencies injected, not created internally
- [ ] No unnecessary inheritance

### Error Handling
- [ ] Specific error types used
- [ ] Error messages are descriptive
- [ ] Edge cases considered
- [ ] Async errors properly handled

### Testing
- [ ] Unit tests for core business logic
- [ ] Tests for error cases
- [ ] Mocks used appropriately for dependencies
- [ ] Tests are independent and repeatable

## Example Implementation Pattern

Application services should follow this pattern:

```typescript
/**
 * Application service that orchestrates a specific use case.
 */
export class ExampleApplicationService {
  /**
   * Creates a new service instance with its dependencies.
   */
  constructor(
    private readonly repository: IExampleRepository,
    private readonly otherService: OtherService
  ) {}

  /**
   * Executes a use case with clear input and output.
   * 
   * @param params Input parameters
   * @returns Result of the operation
   * @throws SpecificError if something goes wrong
   */
  public async executeUseCase(params: UseCaseParams): Promise<Result> {
    // 1. Validate input
    this.validateParams(params);
    
    // 2. Retrieve or create domain entities
    const entity = await this.repository.findById(params.id) ||
                   new Entity(params);
    
    // 3. Execute domain logic
    entity.performAction(params.data);
    
    // 4. Persist changes
    await this.repository.save(entity);
    
    // 5. Return result
    return {
      id: entity.id,
      status: entity.status,
      timestamp: new Date()
    };
  }
  
  /**
   * Validates input parameters.
   * @throws ValidationError if validation fails
   */
  private validateParams(params: UseCaseParams): void {
    if (!params.id) {
      throw new ValidationError('ID is required');
    }
    // Additional validation...
  }
}
```
