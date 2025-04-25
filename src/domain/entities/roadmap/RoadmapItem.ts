/**
 * Represents an item in a roadmap initiative
 */
export class RoadmapItem {
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
   * Status of the item (e.g., "Planned", "In Progress", "Completed")
   */
  public readonly status: string;
  
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
    status: string,
    relatedEntities: string[],
    notes: string
  ) {
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
    status: string = "Planned",
    relatedEntities: string[] = [],
    notes: string = ""
  ): RoadmapItem {
    const id = `roadmap-item-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    return new RoadmapItem(
      id,
      title,
      description,
      status,
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
      data.status,
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
    status?: string;
    relatedEntities?: string[];
    notes?: string;
  }): RoadmapItem {
    return new RoadmapItem(
      this.id,
      updates.title ?? this.title,
      updates.description ?? this.description,
      updates.status ?? this.status,
      updates.relatedEntities ?? this.relatedEntities,
      updates.notes ?? this.notes
    );
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
      status: this.status,
      relatedEntities: this.relatedEntities,
      notes: this.notes
    };
  }
}