import { RoadmapItem } from './RoadmapItem.js';
import { Category } from '../../value-objects/Category.js';
import { Priority } from '../../value-objects/Priority.js';

/**
 * Represents an initiative in a roadmap timeframe
 */
export class RoadmapInitiative {
  /**
   * Unique identifier for the initiative
   */
  public readonly id: string;
  
  /**
   * Title of the initiative
   */
  public readonly title: string;
  
  /**
   * Description of the initiative
   */
  public readonly description: string;
  
  /**
   * Category of the initiative (e.g., Feature, Architecture, Tech Debt)
   */
  public readonly category: Category;
  
  /**
   * Priority of the initiative (e.g., High, Medium, Low)
   */
  public readonly priority: Priority;
  
  /**
   * The items within this initiative
   */
  private readonly _items: Map<string, RoadmapItem>;

  /**
   * Creates a new RoadmapInitiative
   */
  private constructor(
    id: string,
    title: string,
    description: string,
    category: Category,
    priority: Priority,
    items: Map<string, RoadmapItem>
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.category = category;
    this.priority = priority;
    this._items = items;
  }

  /**
   * Factory method to create a new RoadmapInitiative
   */
  public static create(
    title: string,
    description: string,
    category: Category | string,
    priority: Priority | string,
    initialItems: RoadmapItem[] = []
  ): RoadmapInitiative {
    const id = `initiative-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    const categoryValue = typeof category === 'string' ? Category.fromString(category) : category;
    const priorityValue = typeof priority === 'string' ? Priority.fromString(priority) : priority;
    
    const itemsMap = new Map<string, RoadmapItem>();
    initialItems.forEach(item => {
      itemsMap.set(item.id, item);
    });
    
    return new RoadmapInitiative(
      id,
      title,
      description,
      categoryValue,
      priorityValue,
      itemsMap
    );
  }

  /**
   * Factory method to recreate a RoadmapInitiative from persistence
   */
  public static fromPersistence(data: any): RoadmapInitiative {
    const itemsMap = new Map<string, RoadmapItem>();
    
    if (Array.isArray(data.items)) {
      data.items.forEach((item: any) => {
        const roadmapItem = RoadmapItem.fromPersistence(item);
        itemsMap.set(roadmapItem.id, roadmapItem);
      });
    }
    
    const categoryValue = typeof data.category === 'string' ? Category.fromString(data.category) : data.category;
    const priorityValue = typeof data.priority === 'string' ? Priority.fromString(data.priority) : data.priority;
    
    return new RoadmapInitiative(
      data.id,
      data.title,
      data.description,
      categoryValue,
      priorityValue,
      itemsMap
    );
  }

  /**
   * Adds an item to this initiative
   */
  public addItem(item: RoadmapItem): RoadmapInitiative {
    const updatedItems = new Map(this._items);
    updatedItems.set(item.id, item);
    
    return new RoadmapInitiative(
      this.id,
      this.title,
      this.description,
      this.category,
      this.priority,
      updatedItems
    );
  }

  /**
   * Removes an item from this initiative
   */
  public removeItem(itemId: string): RoadmapInitiative {
    if (!this._items.has(itemId)) {
      throw new Error(`Item with ID ${itemId} not found in initiative`);
    }
    
    const updatedItems = new Map(this._items);
    updatedItems.delete(itemId);
    
    return new RoadmapInitiative(
      this.id,
      this.title,
      this.description,
      this.category,
      this.priority,
      updatedItems
    );
  }

  /**
   * Returns all items in this initiative
   */
  public get items(): RoadmapItem[] {
    return Array.from(this._items.values());
  }

  /**
   * Gets an item by ID
   */
  public getItem(itemId: string): RoadmapItem | undefined {
    return this._items.get(itemId);
  }

  /**
   * Updates this initiative with new values
   */
  public update(updates: {
    title?: string;
    description?: string;
    category?: Category | string;
    priority?: Priority | string;
  }): RoadmapInitiative {
    let categoryValue = this.category;
    if (updates.category !== undefined) {
      categoryValue = typeof updates.category === 'string' 
        ? Category.fromString(updates.category) 
        : updates.category;
    }

    let priorityValue = this.priority;
    if (updates.priority !== undefined) {
      priorityValue = typeof updates.priority === 'string' 
        ? Priority.fromString(updates.priority) 
        : updates.priority;
    }

    return new RoadmapInitiative(
      this.id,
      updates.title ?? this.title,
      updates.description ?? this.description,
      categoryValue,
      priorityValue,
      this._items
    );
  }

  /**
   * Serializes the initiative for persistence
   */
  public toJSON(): any {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category.toString(),
      priority: this.priority.toString(),
      items: this.items.map(item => item.toJSON())
    };
  }
}