# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Build: `pnpm run build`
- Watch mode: `pnpm run watch`
- Test with MCP inspector: `pnpm run inspector`
- Governance server: `pnpm run governance`
- Install dependencies: `pnpm install`

## Design and Architecture

This project implements a software planning tool following Domain-Driven Design (DDD) and SOLID principles. The architecture consists of:

1. **Domain Layer**: Contains entities, value objects, and repository interfaces
2. **Application Layer**: Contains application services that orchestrate use cases
3. **Infrastructure Layer**: Contains implementations of repository interfaces
4. **Presentation Layer**: The Governance MCP server that exposes tools to Claude

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

## Implementation Status

**Status: In Progress**

- [x] DocumentationService - Added methods to create PRDs, Epics, Stories, Tasks
- [x] Enhanced DocumentTemplates with improved templates and role-based prompts
- [x] Added API endpoints for all required governance tools in GovernanceServer
- [x] Added Spike support for research and exploration tasks
- [ ] Version Control Context - GitInfrastructureService needs implementation
- [ ] Planning Context - Need to complete entity and repository implementations
- [ ] Infrastructure Implementation - Need repository implementations
- [ ] Integration Between Contexts - Need to connect governance tools to application services

### Next Implementation Tasks (Priority Order)

1. Implement API handlers in GovernanceServer.ts to connect tool endpoints to the DocumentationService
2. Complete repositories for PRD, Epic, Story, Task entities
3. Create GitInfrastructureService for version control operations
4. Implement logging and status updates for tasks and sprints

## Required Implementation Tasks

### Documentation Context
- [x] Add methods to DocumentationService for creating PRDs, Epics, Stories, Tasks
- [ ] Implement PRDDocument, SprintDocument, DailyLog entities
- [ ] Add document section management to MarkdownFileService
- [ ] Implement Sprint document creation and updating
- [ ] Add task status tracking across documents
- [ ] Implement dashboard metrics calculation and visualization
- [ ] Add work summary logging to daily logs

### Planning Context
- [ ] Complete implementation of PRD, Epic, Story, Task entities
- [ ] Implement interfaces for repositories (IPRDRepository, IEpicRepository, etc.)
- [ ] Create PlanningApplicationService with complete functionality
- [ ] Implement sprint planning and task allocation

### Thinking Context
- [ ] Enhance ThinkingProcess entity with additional metadata
- [ ] Complete ThinkingApplicationService implementation

### Version Control Context
- [ ] Implement Commit, Branch, PullRequest entities
- [ ] Create CommitMessage, GitStatus, FileChange value objects
- [ ] Implement GitInfrastructureService for Git operations
- [ ] Add methods for branch management and PR creation

### Governance Server
- [ ] Add missing tools to GovernanceServer:
  - [ ] mcp__governance__create_epic
  - [ ] mcp__governance__create_story
  - [ ] mcp__governance__create_subtask
  - [ ] mcp__governance__create_sprint
  - [ ] mcp__governance__get_sprint_info
  - [ ] mcp__governance__update_task_status
  - [ ] mcp__governance__log_daily_work
  - [ ] mcp__governance__start_code_review
  - [ ] mcp__governance__create_branch
  - [ ] mcp__governance__create_pull_request
  - [ ] mcp__governance__update_sprint_status

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