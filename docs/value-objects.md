# Value Objects in Domain-Driven Design

## Overview

This document explains how value objects have been implemented in our software planning tool to enhance domain model expressiveness, type safety, and business rule enforcement. It serves as a guide for using and extending the value object pattern in our codebase.

## What Are Value Objects?

In Domain-Driven Design, value objects are immutable objects that describe characteristics of domain concepts. Unlike entities, value objects:

- Have no identity (two value objects with the same properties are equal)
- Are immutable (cannot be changed after creation)
- Encapsulate domain validation and business rules
- Can contain behavior related to the concept they represent

## Implemented Value Objects

Our codebase currently implements the following value objects:

### Priority

Represents priority levels in roadmap initiatives and items:

```typescript
export class Priority {
  private constructor(private readonly value: string) { /* ... */ }
  
  public static readonly HIGH = new Priority('high');
  public static readonly MEDIUM = new Priority('medium');
  public static readonly LOW = new Priority('low');
  
  public static fromString(value: string): Priority { /* ... */ }
  
  // Comparison methods
  public equals(other: Priority): boolean { /* ... */ }
  
  // Type guards
  public get isHigh(): boolean { /* ... */ }
  public get isMedium(): boolean { /* ... */ }
  public get isLow(): boolean { /* ... */ }
  
  // Serialization
  public toString(): string { /* ... */ }
}
```

### Status

Represents the status of roadmap items:

```typescript
export class Status {
  private constructor(private readonly value: string) { /* ... */ }
  
  public static readonly PLANNED = new Status('planned');
  public static readonly IN_PROGRESS = new Status('in-progress');
  public static readonly COMPLETED = new Status('completed');
  public static readonly CANCELED = new Status('canceled');
  
  public static fromString(value: string): Status { /* ... */ }
  
  // Comparison methods
  public equals(other: Status): boolean { /* ... */ }
  
  // Type guards and state helpers
  public get isActive(): boolean { /* ... */ }
  public get isCompleted(): boolean { /* ... */ }
  public get isCanceled(): boolean { /* ... */ }
  
  // Serialization
  public toString(): string { /* ... */ }
}
```

### Category

Represents the category of roadmap initiatives:

```typescript
export class Category {
  private constructor(private readonly value: string) { /* ... */ }
  
  public static readonly FEATURE = new Category('feature');
  public static readonly ENHANCEMENT = new Category('enhancement');
  public static readonly BUG = new Category('bug');
  public static readonly ARCHITECTURE = new Category('architecture');
  public static readonly TECH_DEBT = new Category('tech-debt');
  public static readonly RESEARCH = new Category('research');
  public static readonly DOCUMENTATION = new Category('documentation');
  public static readonly OTHER = new Category('other');
  
  public static fromString(value: string): Category { /* ... */ }
  
  // Comparison methods
  public equals(other: Category): boolean { /* ... */ }
  
  // Type guards
  public get isFeature(): boolean { /* ... */ }
  public get isEnhancement(): boolean { /* ... */ }
  // ... other type guards
  
  // Serialization
  public toString(): string { /* ... */ }
}
```

## Implementation Pattern

Our value objects follow a consistent implementation pattern:

1. **Private Constructor**: Prevents direct instantiation and ensures validation
2. **Static Factory Methods**: Creates instances with validation
3. **Static Constants**: Pre-defined instances for common values (enum-like)
4. **Type Guards**: Methods to check state in a type-safe way
5. **Equality Comparison**: Methods to compare value objects
6. **Serialization**: Methods for persistence and display

## Using Value Objects

### In Domain Entities

```typescript
// Example: RoadmapItem with Status value object
export class RoadmapItem {
  public readonly id: string;
  public readonly title: string;
  public readonly status: Status; // Value object instead of string
  
  // Methods can now leverage the value object's behavior
  public isInProgress(): boolean {
    return this.status.equals(Status.IN_PROGRESS);
  }
  
  public isActiveOrCompleted(): boolean {
    return this.status.isActive || this.status.isCompleted;
  }
}
```

### In Application Services

```typescript
// Example: Command service accepting value objects
public async updateItemStatus(
  itemId: string, 
  newStatus: Status | string // Accepts either value object or string
): Promise<void> {
  // Convert string to value object if needed
  const statusValue = typeof newStatus === 'string' 
    ? Status.fromString(newStatus) 
    : newStatus;
    
  // The rest of the method uses the value object
}
```

### Persistence Considerations

Value objects are serialized to primitive types for storage and deserialized when loading from persistence:

```typescript
// Serialization
public toJSON(): any {
  return {
    // ...
    status: this.status.toString(), // Convert value object to string
    // ...
  };
}

// Deserialization
public static fromPersistence(data: any): RoadmapItem {
  return new RoadmapItem(
    // ...
    Status.fromString(data.status), // Convert string to value object
    // ...
  );
}
```

## Benefits of Value Objects

1. **Type Safety**: Prevents invalid values through constructor validation
2. **Domain Logic Encapsulation**: Business rules are defined in one place
3. **Self-Documentation**: Code clearly expresses domain concepts
4. **Immutability**: Prevents unexpected side effects
5. **Rich Behavior**: Domain operations belong with the data they operate on

## Adding New Value Objects

To add a new value object to the codebase:

1. Create a new file in `src/domain/value-objects/`
2. Follow the established pattern (private constructor, factory methods, etc.)
3. Add the export to `src/domain/value-objects/index.ts`
4. Update entity classes to use the new value object
5. Update application services to handle the value object

## Future Extensions

Value objects can be extended with additional functionality:

1. **Conversion methods**: Transform between related value objects
2. **Domain operations**: Add methods that embody domain rules
3. **Validation enrichment**: More sophisticated validation rules
4. **Metadata**: Add descriptive information for UI display

## Conclusion

Value objects are a powerful DDD pattern that improves code quality by replacing primitive types with domain-specific types that encapsulate validation and behavior. Our implementation follows best practices for immutability, factory creation, and consistent API design.