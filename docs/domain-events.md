# Domain Events

## Overview

This document explains how domain events have been implemented in our software planning tool to enable loosely coupled communication between different parts of the system. Domain events are a key pattern in Domain-Driven Design for propagating state changes and coordinating actions across bounded contexts.

## What Are Domain Events?

Domain events represent something significant that has happened in the domain. They:

- Represent past occurrences (they are immutable facts about something that happened)
- Are named with a verb in past tense (e.g., "ItemStatusChanged")
- Contain all relevant information about the event
- Are used to maintain consistency across aggregates and bounded contexts
- Enable decoupling of components through publish-subscribe patterns

## Core Components

Our domain events implementation consists of these key components:

### 1. DomainEvent Interface

The base interface that all domain events implement:

```typescript
export interface DomainEvent {
  readonly occurredOn: Date;
  readonly eventType: string;
}
```

### 2. EventDispatcher

A singleton service that manages event registration and dispatching:

```typescript
export class EventDispatcher {
  private static instance: EventDispatcher;
  private handlers: Map<string, EventHandler[]> = new Map();
  
  // Get singleton instance
  public static getInstance(): EventDispatcher { /* ... */ }
  
  // Register a handler for an event type
  public register(eventType: string, handler: EventHandler): void { /* ... */ }
  
  // Dispatch an event to all registered handlers
  public dispatch(event: DomainEvent): void { /* ... */ }
  
  // Dispatch multiple events
  public dispatchAll(events: DomainEvent[]): void { /* ... */ }
}
```

### 3. Entity Base Class

A base class for all entities that can raise events:

```typescript
export abstract class Entity {
  private _domainEvents: DomainEvent[] = [];
  
  // Register an event
  protected registerEvent(event: DomainEvent): void { /* ... */ }
  
  // Get all events
  public get domainEvents(): DomainEvent[] { /* ... */ }
  
  // Clear events and return them
  public clearEvents(): DomainEvent[] { /* ... */ }
}
```

### 4. Event Handlers

Classes that contain logic for responding to events:

```typescript
export class RoadmapEventHandlers {
  constructor() {
    const dispatcher = EventDispatcher.getInstance();
    dispatcher.register('RoadmapItemStatusChanged', this.handleItemStatusChanged.bind(this));
    // Register more handlers...
  }
  
  private handleItemStatusChanged(event: RoadmapItemStatusChanged): void {
    // Handle the event...
  }
}
```

## Implemented Domain Events

Our system currently implements the following domain events:

### Roadmap Events

1. **RoadmapCreated**  
   Triggered when a new roadmap is created.

2. **RoadmapItemStatusChanged**  
   Triggered when an item's status changes (e.g., from "planned" to "in-progress").

3. **RoadmapInitiativePriorityChanged**  
   Triggered when an initiative's priority changes.

4. **RoadmapInitiativeCategoryChanged**  
   Triggered when an initiative's category changes.

5. **RoadmapTimeframeAdded**  
   Triggered when a new timeframe is added to a roadmap.

6. **RoadmapInitiativeAdded**  
   Triggered when a new initiative is added to a timeframe.

7. **RoadmapItemAdded**  
   Triggered when a new item is added to an initiative.

## How Domain Events Are Used

### 1. Raising Events in Entities

Entities raise events by registering them during state changes:

```typescript
public updateStatus(newStatus: Status, context: { roadmapId: string; timeframeId: string; initiativeId: string; }): RoadmapItem {
  // Create new item with updated status
  const updatedItem = new RoadmapItem(/* ... */);
  
  // Register the status changed event
  const event = new RoadmapItemStatusChanged(
    context.roadmapId,
    context.timeframeId,
    context.initiativeId,
    this.id,
    this.status,
    newStatus
  );
  
  updatedItem.registerEvent(event);
  return updatedItem;
}
```

### 2. Dispatching Events in Application Services

Application services dispatch events after successful operations:

```typescript
public async updateItem(roadmapId: string, timeframeId: string, initiativeId: string, itemId: string, updates: { /* ... */ }): Promise<Roadmap | null> {
  // Update the item...
  
  // Save changes
  await this.roadmapRepository.save(updatedRoadmap);
  
  // Dispatch events
  const events = updatedItem.domainEvents;
  this.eventDispatcher.dispatchAll(events);
  
  return updatedRoadmap;
}
```

### 3. Handling Events for Cross-Aggregate Coordination

Event handlers implement business logic that spans multiple aggregates:

```typescript
private handleItemStatusChanged(event: RoadmapItemStatusChanged): void {
  if (event.newStatus.equals(Status.COMPLETED)) {
    // Update related tasks in other aggregates
    const relatedTasks = taskRepository.findByRoadmapItemId(event.itemId);
    for (const task of relatedTasks) {
      const updatedTask = task.markAsComplete();
      taskRepository.save(updatedTask);
    }
  }
}
```

## Benefits of Domain Events

1. **Decoupling**: Components communicate without direct dependencies
2. **Cross-Aggregate Consistency**: Maintain consistency across aggregate boundaries
3. **Separation of Concerns**: Core domain logic remains focused while cross-cutting concerns are handled by event handlers
4. **Extensibility**: New behavior can be added without modifying existing code
5. **Auditability**: Events provide a record of all significant state changes

## Implementation Guidelines

When implementing new domain events:

1. **Create the Event Class**:
   - Define a new class that implements DomainEvent
   - Name it with a verb in past tense
   - Include all relevant information about the event

2. **Modify Entity Classes**:
   - Update relevant entity methods to register events during state changes
   - Ensure context information is provided for event creation

3. **Update Application Services**:
   - Modify services to dispatch events after successful operations
   - Collect events from all modified entities

4. **Implement Event Handlers**:
   - Create handler methods for the new event
   - Register handlers with the EventDispatcher
   - Implement cross-aggregate coordination as needed

## Event Sourcing and Event Store (Future Considerations)

In the future, we may consider implementing:

1. **Event Store**: Persist all domain events for auditing and replay
2. **Event Sourcing**: Reconstruct entity state by replaying events
3. **Read Models**: Create specialized read models optimized for specific queries
4. **Integration Events**: Exchange events with external systems

These enhancements would provide even more benefits for debugging, auditing, and system integration.

## Conclusion

Domain events are a powerful mechanism for implementing loosely coupled, event-driven architectures. By capturing and propagating significant state changes as events, we enable more maintainable, extensible, and robust software designs.