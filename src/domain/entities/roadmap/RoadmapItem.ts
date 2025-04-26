import { Status } from '../../value-objects/Status.js';
import { Entity } from '../Entity.js';
import { RoadmapItemStatusChanged } from '../../events/RoadmapEvents.js';

/**
 * Represents an item in a roadmap initiative
 */
export class RoadmapItem extends Entity {
  /**
   * Unique identifier for the item
   */
  public readonly id: string;
  
  /**
   * Title of the item
   */
  public readonly title: string;
  
  /**
   * Description of the item
   */
  public readonly description: string;
  
  /**
   * Status of the item (e.g., Planned, In Progress, Completed)
   */
  public readonly status: Status;
  
  /**
   * References to related entities (e.g., story IDs, task IDs)
   */
  public readonly relatedEntities: string[];
  
  /**
   * Additional notes about the item
   */
  public readonly notes: string;

  /**
   * Creates a new RoadmapItem
   */
  private constructor(
    id: string,
    title: string,
    description: string,
    status: Status,
    relatedEntities: string[],
    notes: string
  ) {
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.relatedEntities = relatedEntities;
    this.notes = notes;
  }

  /**
   * Factory method to create a new RoadmapItem
   */
  public static create(
    title: string,
    description: string,
    status: Status | string = Status.PLANNED,
    relatedEntities: string[] = [],
    notes: string = ""
  ): RoadmapItem {
    const id = `roadmap-item-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    const statusValue = typeof status === 'string' ? Status.fromString(status) : status;
    
    return new RoadmapItem(
      id,
      title,
      description,
      statusValue,
      relatedEntities,
      notes
    );
  }

  /**
   * Factory method to recreate a RoadmapItem from persistence
   */
  public static fromPersistence(data: any): RoadmapItem {
    return new RoadmapItem(
      data.id,
      data.title,
      data.description,
      typeof data.status === 'string' ? Status.fromString(data.status) : data.status,
      data.relatedEntities || [],
      data.notes || ""
    );
  }

  /**
   * Updates this item with new values
   */
  public update(updates: {
    title?: string;
    description?: string;
    status?: Status | string;
    relatedEntities?: string[];
    notes?: string;
  }, context?: {
    roadmapId?: string;
    timeframeId?: string;
    initiativeId?: string;
  }): RoadmapItem {
    let statusValue = this.status;
    if (updates.status !== undefined) {
      statusValue = typeof updates.status === 'string' 
        ? Status.fromString(updates.status) 
        : updates.status;
    }

    const updatedItem = new RoadmapItem(
      this.id,
      updates.title ?? this.title,
      updates.description ?? this.description,
      statusValue,
      updates.relatedEntities ?? this.relatedEntities,
      updates.notes ?? this.notes
    );

    // If status changed and we have context information, register an event
    if (context && updates.status !== undefined && !this.status.equals(statusValue)) {
      const { roadmapId, timeframeId, initiativeId } = context;
      if (roadmapId && timeframeId && initiativeId) {
        const event = new RoadmapItemStatusChanged(
          roadmapId,
          timeframeId,
          initiativeId,
          this.id,
          this.status,
          statusValue
        );
        updatedItem.registerEvent(event);
      }
    }

    return updatedItem;
  }
  
  /**
   * Updates the status of this item
   * @param newStatus The new status
   * @param context The context information for event generation
   * @returns A new RoadmapItem with updated status
   */
  public updateStatus(
    newStatus: Status | string,
    context: {
      roadmapId: string;
      timeframeId: string;
      initiativeId: string;
    }
  ): RoadmapItem {
    const statusValue = typeof newStatus === 'string' 
      ? Status.fromString(newStatus) 
      : newStatus;
      
    // If status hasn't changed, return this item
    if (this.status.equals(statusValue)) {
      return this;
    }
    
    // Create new item with updated status
    const updatedItem = new RoadmapItem(
      this.id,
      this.title,
      this.description,
      statusValue,
      this.relatedEntities,
      this.notes
    );
    
    // Register the status changed event
    const event = new RoadmapItemStatusChanged(
      context.roadmapId,
      context.timeframeId,
      context.initiativeId,
      this.id,
      this.status,
      statusValue
    );
    
    updatedItem.registerEvent(event);
    return updatedItem;
  }

  /**
   * Adds a related entity to this item
   */
  public addRelatedEntity(entityId: string): RoadmapItem {
    if (this.relatedEntities.includes(entityId)) {
      return this;
    }
    
    const newRelatedEntities = [...this.relatedEntities, entityId];
    
    return new RoadmapItem(
      this.id,
      this.title,
      this.description,
      this.status,
      newRelatedEntities,
      this.notes
    );
  }

  /**
   * Removes a related entity from this item
   */
  public removeRelatedEntity(entityId: string): RoadmapItem {
    if (!this.relatedEntities.includes(entityId)) {
      return this;
    }
    
    const newRelatedEntities = this.relatedEntities.filter(id => id !== entityId);
    
    return new RoadmapItem(
      this.id,
      this.title,
      this.description,
      this.status,
      newRelatedEntities,
      this.notes
    );
  }

  /**
   * Serializes the item for persistence
   */
  public toJSON(): any {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status.toString(),
      relatedEntities: this.relatedEntities,
      notes: this.notes
    };
  }
}