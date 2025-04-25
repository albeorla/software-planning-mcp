/**
 * Represents a note on the product roadmap
 * 
 * Roadmap notes can be used to document high-level strategic direction,
 * future features, or architectural decisions that aren't immediately
 * actionable but should be recorded for future planning cycles.
 */
export class RoadmapNote {
  /**
   * Unique identifier for the roadmap note
   */
  public readonly id: string;
  
  /**
   * Title of the roadmap note
   */
  public readonly title: string;
  
  /**
   * Detailed content of the roadmap note
   */
  public readonly content: string;
  
  /**
   * Category of the roadmap note (e.g., 'feature', 'architecture', 'tech-debt')
   */
  public readonly category: string;
  
  /**
   * Priority level of the roadmap note (e.g., 'high', 'medium', 'low')
   */
  public readonly priority: string;
  
  /**
   * Estimated timeline for implementation (e.g., 'Q1 2023', 'future')
   */
  public readonly timeline: string;
  
  /**
   * List of related items (PRDs, epics, stories, or other roadmap notes)
   */
  public readonly relatedItems: string[];
  
  /**
   * Creation timestamp
   */
  public readonly createdAt: string;
  
  /**
   * Last update timestamp
   */
  public readonly updatedAt: string;

  /**
   * Creates a new RoadmapNote
   */
  private constructor(
    id: string,
    title: string,
    content: string,
    category: string,
    priority: string,
    timeline: string,
    relatedItems: string[],
    createdAt: string,
    updatedAt: string
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.category = category;
    this.priority = priority;
    this.timeline = timeline;
    this.relatedItems = relatedItems;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Factory method to create a new RoadmapNote
   */
  public static create(
    title: string,
    content: string,
    category: string,
    priority: string,
    timeline: string,
    relatedItems: string[] = []
  ): RoadmapNote {
    const id = `roadmap-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const timestamp = new Date().toISOString();
    
    return new RoadmapNote(
      id,
      title,
      content,
      category,
      priority,
      timeline,
      relatedItems,
      timestamp,
      timestamp
    );
  }

  /**
   * Factory method to recreate a RoadmapNote from persistence
   */
  public static fromPersistence(data: Record<string, any>): RoadmapNote {
    return new RoadmapNote(
      data.id,
      data.title,
      data.content,
      data.category,
      data.priority,
      data.timeline,
      data.relatedItems || [],
      data.createdAt,
      data.updatedAt
    );
  }
  
  /**
   * Creates an updated version of this roadmap note with modified fields
   */
  public update(updates: {
    title?: string;
    content?: string;
    category?: string;
    priority?: string;
    timeline?: string;
    relatedItems?: string[];
  }): RoadmapNote {
    return new RoadmapNote(
      this.id,
      updates.title ?? this.title,
      updates.content ?? this.content,
      updates.category ?? this.category,
      updates.priority ?? this.priority,
      updates.timeline ?? this.timeline,
      updates.relatedItems ?? this.relatedItems,
      this.createdAt,
      new Date().toISOString()
    );
  }
}