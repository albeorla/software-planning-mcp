import { RoadmapTimeframe } from './RoadmapTimeframe.js';

/**
 * Represents a product roadmap that organizes strategic initiatives
 * over different time horizons. A roadmap contains multiple roadmap items
 * and provides a high-level view of the product's direction.
 */
export class Roadmap {
  /**
   * Unique identifier for the roadmap
   */
  public readonly id: string;
  
  /**
   * Title of the roadmap
   */
  public readonly title: string;
  
  /**
   * Description of the roadmap's purpose and scope
   */
  public readonly description: string;
  
  /**
   * Version of the roadmap (e.g., "2023-Q2")
   */
  public readonly version: string;
  
  /**
   * Owner of the roadmap
   */
  public readonly owner: string;
  
  /**
   * The items in this roadmap, organized by timeframe
   */
  private readonly _timeframes: Map<string, RoadmapTimeframe>;
  
  /**
   * Creation timestamp
   */
  public readonly createdAt: string;
  
  /**
   * Last update timestamp
   */
  public readonly updatedAt: string;

  /**
   * Creates a new Roadmap
   */
  private constructor(
    id: string,
    title: string,
    description: string,
    version: string,
    owner: string,
    timeframes: Map<string, RoadmapTimeframe>,
    createdAt: string,
    updatedAt: string
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.version = version;
    this.owner = owner;
    this._timeframes = timeframes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Factory method to create a new Roadmap
   */
  public static create(
    title: string,
    description: string,
    version: string,
    owner: string,
    initialTimeframes: RoadmapTimeframe[] = []
  ): Roadmap {
    const id = `roadmap-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();
    
    const timeframesMap = new Map<string, RoadmapTimeframe>();
    initialTimeframes.forEach(timeframe => {
      timeframesMap.set(timeframe.id, timeframe);
    });
    
    return new Roadmap(
      id,
      title,
      description,
      version,
      owner,
      timeframesMap,
      now,
      now
    );
  }

  /**
   * Factory method to recreate a Roadmap from persistence
   */
  public static fromPersistence(data: any): Roadmap {
    const timeframesMap = new Map<string, RoadmapTimeframe>();
    
    if (Array.isArray(data.timeframes)) {
      data.timeframes.forEach((tf: any) => {
        const timeframe = RoadmapTimeframe.fromPersistence(tf);
        timeframesMap.set(timeframe.id, timeframe);
      });
    }
    
    return new Roadmap(
      data.id,
      data.title,
      data.description,
      data.version,
      data.owner,
      timeframesMap,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Adds a timeframe to the roadmap
   */
  public addTimeframe(timeframe: RoadmapTimeframe): Roadmap {
    const updatedTimeframes = new Map(this._timeframes);
    updatedTimeframes.set(timeframe.id, timeframe);
    
    return new Roadmap(
      this.id,
      this.title,
      this.description,
      this.version,
      this.owner,
      updatedTimeframes,
      this.createdAt,
      new Date().toISOString()
    );
  }

  /**
   * Removes a timeframe from the roadmap
   */
  public removeTimeframe(timeframeId: string): Roadmap {
    if (!this._timeframes.has(timeframeId)) {
      throw new Error(`Timeframe with ID ${timeframeId} not found in roadmap`);
    }
    
    const updatedTimeframes = new Map(this._timeframes);
    updatedTimeframes.delete(timeframeId);
    
    return new Roadmap(
      this.id,
      this.title,
      this.description,
      this.version,
      this.owner,
      updatedTimeframes,
      this.createdAt,
      new Date().toISOString()
    );
  }

  /**
   * Returns all timeframes in this roadmap
   */
  public get timeframes(): RoadmapTimeframe[] {
    return Array.from(this._timeframes.values())
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Gets a timeframe by ID
   */
  public getTimeframe(timeframeId: string): RoadmapTimeframe | undefined {
    return this._timeframes.get(timeframeId);
  }

  /**
   * Updates a timeframe in this roadmap
   */
  public updateTimeframe(
    timeframeId: string,
    updates: {
      name?: string;
      order?: number;
    }
  ): Roadmap {
    const timeframe = this._timeframes.get(timeframeId);
    if (!timeframe) {
      throw new Error(`Timeframe with ID ${timeframeId} not found in roadmap`);
    }
    
    const updatedTimeframe = timeframe.update(updates);
    const updatedTimeframes = new Map(this._timeframes);
    updatedTimeframes.set(timeframeId, updatedTimeframe);
    
    return new Roadmap(
      this.id,
      this.title,
      this.description,
      this.version,
      this.owner,
      updatedTimeframes,
      this.createdAt,
      new Date().toISOString()
    );
  }

  /**
   * Updates roadmap with new values
   */
  public update(updates: {
    title?: string;
    description?: string;
    version?: string;
    owner?: string;
  }): Roadmap {
    return new Roadmap(
      this.id,
      updates.title ?? this.title,
      updates.description ?? this.description,
      updates.version ?? this.version,
      updates.owner ?? this.owner,
      this._timeframes,
      this.createdAt,
      new Date().toISOString()
    );
  }

  /**
   * Adds a new initiative to a timeframe
   */
  public addInitiativeToTimeframe(
    timeframeId: string,
    initiative: any
  ): Roadmap {
    const timeframe = this._timeframes.get(timeframeId);
    if (!timeframe) {
      throw new Error(`Timeframe with ID ${timeframeId} not found in roadmap`);
    }
    
    const updatedTimeframe = timeframe.addInitiative(initiative);
    const updatedTimeframes = new Map(this._timeframes);
    updatedTimeframes.set(timeframeId, updatedTimeframe);
    
    return new Roadmap(
      this.id,
      this.title,
      this.description,
      this.version,
      this.owner,
      updatedTimeframes,
      this.createdAt,
      new Date().toISOString()
    );
  }

  /**
   * Gets all initiatives across all timeframes
   */
  public getAllInitiatives(): { timeframeId: string; initiative: any }[] {
    const result: { timeframeId: string; initiative: any }[] = [];
    
    this.timeframes.forEach(timeframe => {
      timeframe.initiatives.forEach(initiative => {
        result.push({
          timeframeId: timeframe.id,
          initiative
        });
      });
    });
    
    return result;
  }

  /**
   * Serializes the roadmap for persistence
   */
  public toJSON(): any {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      version: this.version,
      owner: this.owner,
      timeframes: this.timeframes.map(tf => tf.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}