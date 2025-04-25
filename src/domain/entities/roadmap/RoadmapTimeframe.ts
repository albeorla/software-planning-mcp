import { RoadmapInitiative } from './RoadmapInitiative.js';

/**
 * Represents a timeframe in a roadmap (e.g., "Current Quarter", "Next Quarter", "Future")
 */
export class RoadmapTimeframe {
  /**
   * Unique identifier for the timeframe
   */
  public readonly id: string;
  
  /**
   * Name of the timeframe (e.g., "Q3 2023", "Next 6 Months", "Long-term")
   */
  public readonly name: string;
  
  /**
   * Order of this timeframe in the roadmap sequence
   */
  public readonly order: number;
  
  /**
   * The initiatives within this timeframe
   */
  private readonly _initiatives: Map<string, RoadmapInitiative>;

  /**
   * Creates a new RoadmapTimeframe
   */
  private constructor(
    id: string,
    name: string,
    order: number,
    initiatives: Map<string, RoadmapInitiative>
  ) {
    this.id = id;
    this.name = name;
    this.order = order;
    this._initiatives = initiatives;
  }

  /**
   * Factory method to create a new RoadmapTimeframe
   */
  public static create(
    name: string,
    order: number,
    initialInitiatives: RoadmapInitiative[] = []
  ): RoadmapTimeframe {
    const id = `timeframe-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    const initiativesMap = new Map<string, RoadmapInitiative>();
    initialInitiatives.forEach(initiative => {
      initiativesMap.set(initiative.id, initiative);
    });
    
    return new RoadmapTimeframe(
      id,
      name,
      order,
      initiativesMap
    );
  }

  /**
   * Factory method to recreate a RoadmapTimeframe from persistence
   */
  public static fromPersistence(data: any): RoadmapTimeframe {
    const initiativesMap = new Map<string, RoadmapInitiative>();
    
    if (Array.isArray(data.initiatives)) {
      data.initiatives.forEach((initiative: any) => {
        const roadmapInitiative = RoadmapInitiative.fromPersistence(initiative);
        initiativesMap.set(roadmapInitiative.id, roadmapInitiative);
      });
    }
    
    return new RoadmapTimeframe(
      data.id,
      data.name,
      data.order,
      initiativesMap
    );
  }

  /**
   * Adds an initiative to this timeframe
   */
  public addInitiative(initiative: RoadmapInitiative): RoadmapTimeframe {
    const updatedInitiatives = new Map(this._initiatives);
    updatedInitiatives.set(initiative.id, initiative);
    
    return new RoadmapTimeframe(
      this.id,
      this.name,
      this.order,
      updatedInitiatives
    );
  }

  /**
   * Removes an initiative from this timeframe
   */
  public removeInitiative(initiativeId: string): RoadmapTimeframe {
    if (!this._initiatives.has(initiativeId)) {
      throw new Error(`Initiative with ID ${initiativeId} not found in timeframe`);
    }
    
    const updatedInitiatives = new Map(this._initiatives);
    updatedInitiatives.delete(initiativeId);
    
    return new RoadmapTimeframe(
      this.id,
      this.name,
      this.order,
      updatedInitiatives
    );
  }

  /**
   * Returns all initiatives in this timeframe
   */
  public get initiatives(): RoadmapInitiative[] {
    return Array.from(this._initiatives.values());
  }

  /**
   * Gets an initiative by ID
   */
  public getInitiative(initiativeId: string): RoadmapInitiative | undefined {
    return this._initiatives.get(initiativeId);
  }

  /**
   * Updates an initiative in this timeframe
   */
  public updateInitiative(
    initiativeId: string,
    updates: {
      title?: string;
      description?: string;
      category?: string;
      priority?: string;
    }
  ): RoadmapTimeframe {
    const initiative = this._initiatives.get(initiativeId);
    if (!initiative) {
      throw new Error(`Initiative with ID ${initiativeId} not found in timeframe`);
    }
    
    const updatedInitiative = initiative.update(updates);
    const updatedInitiatives = new Map(this._initiatives);
    updatedInitiatives.set(initiativeId, updatedInitiative);
    
    return new RoadmapTimeframe(
      this.id,
      this.name,
      this.order,
      updatedInitiatives
    );
  }

  /**
   * Updates this timeframe with new values
   */
  public update(updates: {
    name?: string;
    order?: number;
  }): RoadmapTimeframe {
    return new RoadmapTimeframe(
      this.id,
      updates.name ?? this.name,
      updates.order ?? this.order,
      this._initiatives
    );
  }

  /**
   * Serializes the timeframe for persistence
   */
  public toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      order: this.order,
      initiatives: this.initiatives.map(initiative => initiative.toJSON())
    };
  }
}