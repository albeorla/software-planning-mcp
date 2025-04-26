# Domain Services

## Overview

This document explains how domain services have been implemented in our software planning tool to encapsulate business logic that doesn't naturally belong to any single entity. Domain services are a key pattern in Domain-Driven Design for handling operations that span multiple entities or enforce domain-wide invariants.

## What Are Domain Services?

Domain services contain domain logic that doesn't naturally fit within an entity or value object:

1. They operate on multiple domain objects
2. They enforce domain rules that span aggregate boundaries
3. They have no identity or state of their own
4. They are stateless and behavior-focused
5. They express significant domain concepts and processes

## When to Use Domain Services

Use domain services when:

1. The operation does not conceptually belong to any specific entity
2. The operation involves multiple entities or aggregates
3. The operation enforces a domain invariant that spans entities
4. The operation represents a significant domain concept
5. The operation would make entities too complex or tightly coupled

## Implemented Domain Services

Our system currently implements the following domain services:

### 1. RoadmapPriorityService

Manages and enforces priority-related business rules across the roadmap:

```typescript
export class RoadmapPriorityService {
  // Maximum allowed high-priority initiatives per roadmap
  private readonly MAX_HIGH_PRIORITY_INITIATIVES = 5;
  
  // Validates that a roadmap follows priority constraints
  public validatePriorities(roadmap: Roadmap): { valid: boolean; message?: string } { /* ... */ }
  
  // Counts high-priority initiatives in a roadmap
  private countHighPriorityInitiatives(roadmap: Roadmap): number { /* ... */ }
  
  // Rebalances initiative priorities to adhere to constraints
  public rebalancePriorities(roadmap: Roadmap): Roadmap { /* ... */ }
}
```

### 2. RoadmapTimeframeService

Manages timeframe-related business rules:

```typescript
export class RoadmapTimeframeService {
  // Maximum allowed timeframes per roadmap
  private readonly MAX_TIMEFRAMES = 10;
  
  // Validates the timeframes of a roadmap
  public validateTimeframes(roadmap: Roadmap): { valid: boolean; message?: string } { /* ... */ }
  
  // Reorders timeframes to ensure sequential order without gaps
  public normalizeTimeframeOrdering(roadmap: Roadmap): Roadmap { /* ... */ }
  
  // Suggests optimal timeframe structure based on initiatives
  public suggestTimeframeStructure(roadmap: Roadmap): { /* ... */ } { /* ... */ }
}
```

### 3. RoadmapValidationService

Provides comprehensive validation across the entire roadmap:

```typescript
export class RoadmapValidationService {
  // Validates an entire roadmap against all domain rules
  public validateRoadmap(roadmap: Roadmap): { valid: boolean; errors: string[] } { /* ... */ }
  
  // Normalizes a roadmap to fix inconsistencies
  public normalizeRoadmap(roadmap: Roadmap): Roadmap { /* ... */ }
}
```

## How Domain Services Are Used

### In Application Services

Application services use domain services to enforce business rules:

```typescript
export class RoadmapCommandService {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly validationService: RoadmapValidationService
  ) {}
  
  public async createRoadmap(/* ... */): Promise<Roadmap> {
    // Create the roadmap with initial data
    const roadmap = Roadmap.create(/* ... */);
    
    // Validate the roadmap against domain rules
    const validation = this.validationService.validateRoadmap(roadmap);
    if (!validation.valid) {
      throw new Error(`Roadmap validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Normalize the roadmap to ensure consistency
    const normalizedRoadmap = this.validationService.normalizeRoadmap(roadmap);
    
    // Save and return the normalized roadmap
    await this.roadmapRepository.save(normalizedRoadmap);
    return normalizedRoadmap;
  }
}
```

### For Complex Domain Operations

Domain services encapsulate complex operations spanning multiple entities:

```typescript
// Rebalance initiative priorities to ensure we don't have too many high-priority initiatives
public rebalancePriorities(roadmap: Roadmap): Roadmap {
  const highPriorityCount = this.countHighPriorityInitiatives(roadmap);
  
  // If we're under the limit, no rebalancing needed
  if (highPriorityCount <= this.MAX_HIGH_PRIORITY_INITIATIVES) {
    return roadmap;
  }
  
  // Create a mutable working copy of the roadmap
  let updatedRoadmap = roadmap;
  
  // We need to downgrade (highPriorityCount - MAX) initiatives
  const downgradeCount = highPriorityCount - this.MAX_HIGH_PRIORITY_INITIATIVES;
  
  // Score initiatives and downgrade the least important ones
  // ... implementation details ...
  
  return updatedRoadmap;
}
```

## Domain Services vs. Application Services

It's important to understand the difference between domain and application services:

1. **Domain Services**
   - Part of the domain layer
   - Contain pure domain logic
   - Stateless and focus on behavior
   - No knowledge of persistence, UI, or external systems
   - Express significant domain concepts

2. **Application Services**
   - Part of the application layer
   - Orchestrate use cases with domain objects
   - Manage transactions and persistence
   - Interface with external systems
   - Don't contain domain rules or logic

## Implementation Guidelines

When implementing domain services:

1. **Keep them stateless**:
   - Domain services should not store state
   - They should operate on the parameters provided to them

2. **Name them after domain activities**:
   - Use names that reflect domain processes (e.g., `RoadmapPriorityService`)
   - Avoid technical/implementation names

3. **Express domain concepts clearly**:
   - Use domain terminology in method names and parameters
   - Make domain rules explicit in the code

4. **Avoid technical concerns**:
   - Domain services should have no knowledge of persistence, UI, etc.
   - Separate these concerns into application services

5. **Keep interfaces focused**:
   - Each domain service should have a clear, specific purpose
   - If a service grows too large, consider splitting it

## Benefits of Domain Services

Domain services provide several benefits:

1. **Cleaner Entities**: Keep entities focused on their core responsibilities
2. **Domain Rule Enforcement**: Central place for domain rules spanning multiple entities
3. **Explicit Domain Processes**: Make important domain processes explicit
4. **Reduced Coupling**: Avoid tight coupling between entities
5. **Better Testability**: Services with clear inputs and outputs are easy to test

## Conclusion

Domain services are a powerful tool for modeling complex domain behavior that spans multiple entities. By moving this logic into dedicated services, we create a cleaner, more expressive, and more maintainable domain model.