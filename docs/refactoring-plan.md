# Command Service Refactoring Plan

## Current Issues

1. **CompositeRoadmapCommandService.ts** (374 lines)
   - Acts as a facade for multiple specialized services
   - Contains many public methods that delegate to other services
   - Large number of method signatures creates a bulky file

2. **RoadmapCommandService.ts** (371 lines)
   - Contains core implementation logic for roadmap commands
   - Has long, complex methods with business rule enforcement
   - Responsibilities overlap with specialized service implementations

## Refactoring Strategy

### 1. Extract Command Pattern Implementation

Create a proper command pattern implementation to replace the current approach:

1. Create a `Command` interface and base class
2. Extract each operation into a dedicated command class
3. Implement a command factory for creating command instances
4. Create a streamlined dispatcher for executing commands

### 2. Reorganize CompositeRoadmapCommandService

1. Convert CompositeRoadmapCommandService into a thin facade using command pattern
2. Move detailed method implementations to dedicated command classes
3. Use a command registry to map method calls to command instances
4. Reduce the facade to <300 lines by eliminating redundant method signatures

### 3. Split RoadmapCommandService

1. Extract validation logic into dedicated validators:
   - RoadmapValidator
   - TimeframeValidator
   - InitiativeValidator
   - ItemValidator

2. Extract common helper methods into utility classes:
   - EntityFinder
   - EntityMapper
   - RepositoryOperations

3. Create more specialized service components:
   - RoadmapTransformer
   - RoadmapValidator
   - EventManager

## Implementation Steps

### Phase 1: Command Pattern Infrastructure

1. Create `src/application/roadmap/commands/pattern/` directory
2. Implement basic command pattern classes:
   - `Command.ts` (interface and base class)
   - `CommandFactory.ts` (creates command instances)
   - `CommandRegistry.ts` (maps command types to implementations)
   - `CommandDispatcher.ts` (executes commands)

### Phase 2: Extract CompositeRoadmapCommandService Commands

1. Create specific command implementations:
   - `CreateRoadmapCommand.ts`
   - `UpdateRoadmapCommand.ts`
   - `DeleteRoadmapCommand.ts`
   - (and so on for each operation)

2. Refactor CompositeRoadmapCommandService to use commands:
   - Simplify method implementations to use command pattern
   - Reduce duplication by leveraging common command infrastructure
   - Maintain backward compatibility in the public API

### Phase 3: Refactor RoadmapCommandService

1. Extract validation logic into dedicated validators
2. Create utility classes for common operations
3. Refactor service methods to use the extracted components
4. Reduce overall size and complexity of each method

## Expected Outcomes

1. Reduced file sizes (under 300 lines per file)
2. Better separation of concerns
3. Improved testability of individual components
4. Cleaner composition model through command pattern
5. Maintained backward compatibility with public APIs