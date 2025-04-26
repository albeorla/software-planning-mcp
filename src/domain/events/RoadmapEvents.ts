import { DomainEvent } from './DomainEvent.js';
import { Status } from '../value-objects/Status.js';
import { Priority } from '../value-objects/Priority.js';
import { Category } from '../value-objects/Category.js';

/**
 * Event fired when a roadmap is created
 */
export class RoadmapCreated implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'RoadmapCreated';
  
  constructor(
    public readonly roadmapId: string,
    public readonly title: string,
    public readonly version: string
  ) {
    this.occurredOn = new Date();
  }
}

/**
 * Event fired when a roadmap item's status changes
 */
export class RoadmapItemStatusChanged implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'RoadmapItemStatusChanged';
  
  constructor(
    public readonly roadmapId: string,
    public readonly timeframeId: string,
    public readonly initiativeId: string,
    public readonly itemId: string,
    public readonly oldStatus: Status,
    public readonly newStatus: Status
  ) {
    this.occurredOn = new Date();
  }
}

/**
 * Event fired when an initiative's priority changes
 */
export class RoadmapInitiativePriorityChanged implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'RoadmapInitiativePriorityChanged';
  
  constructor(
    public readonly roadmapId: string,
    public readonly timeframeId: string,
    public readonly initiativeId: string,
    public readonly oldPriority: Priority,
    public readonly newPriority: Priority
  ) {
    this.occurredOn = new Date();
  }
}

/**
 * Event fired when an initiative's category changes
 */
export class RoadmapInitiativeCategoryChanged implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'RoadmapInitiativeCategoryChanged';
  
  constructor(
    public readonly roadmapId: string,
    public readonly timeframeId: string,
    public readonly initiativeId: string,
    public readonly oldCategory: Category,
    public readonly newCategory: Category
  ) {
    this.occurredOn = new Date();
  }
}

/**
 * Event fired when a new timeframe is added to a roadmap
 */
export class RoadmapTimeframeAdded implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'RoadmapTimeframeAdded';
  
  constructor(
    public readonly roadmapId: string,
    public readonly timeframeId: string,
    public readonly title: string,
    public readonly startDate: string,
    public readonly endDate: string
  ) {
    this.occurredOn = new Date();
  }
}

/**
 * Event fired when a new initiative is added to a timeframe
 */
export class RoadmapInitiativeAdded implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'RoadmapInitiativeAdded';
  
  constructor(
    public readonly roadmapId: string,
    public readonly timeframeId: string,
    public readonly initiativeId: string,
    public readonly title: string,
    public readonly category: Category,
    public readonly priority: Priority
  ) {
    this.occurredOn = new Date();
  }
}

/**
 * Event fired when a new item is added to an initiative
 */
export class RoadmapItemAdded implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'RoadmapItemAdded';
  
  constructor(
    public readonly roadmapId: string,
    public readonly timeframeId: string,
    public readonly initiativeId: string,
    public readonly itemId: string,
    public readonly title: string,
    public readonly status: Status
  ) {
    this.occurredOn = new Date();
  }
}