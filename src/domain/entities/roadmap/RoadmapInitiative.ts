import { RoadmapItem } from './RoadmapItem.js';
import { Category } from '../../value-objects/Category.js';
import { Priority } from '../../value-objects/Priority.js';
import { Entity } from '../Entity.js';
import { InitiativeItemManager } from './InitiativeItemManager.js';
import { InitiativeEventFactory } from './InitiativeEventFactory.js';

/**
 * Represents an initiative in a roadmap timeframe
 */
export class RoadmapInitiative extends Entity {
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
   * Manager for the items within this initiative
   */
  private readonly _itemManager: InitiativeItemManager;

  /**
   * Creates a new RoadmapInitiative
   */
  private constructor(
    id: string,
    title: string,
    description: string,
    category: Category,
    priority: Priority,
    itemManager: InitiativeItemManager
  ) {
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.category = category;
    this.priority = priority;
    this._itemManager = itemManager;
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
    
    const itemManager = InitiativeItemManager.fromItems(initialItems);
    
    return new RoadmapInitiative(
      id,
      title,
      description,
      categoryValue,
      priorityValue,
      itemManager
    );
  }

  /**
   * Factory method to recreate a RoadmapInitiative from persistence
   */
  public static fromPersistence(data: any): RoadmapInitiative {
    const itemManager = InitiativeItemManager.fromPersistence(data.items || []);
    
    const categoryValue = typeof data.category === 'string' ? Category.fromString(data.category) : data.category;
    const priorityValue = typeof data.priority === 'string' ? Priority.fromString(data.priority) : data.priority;
    
    return new RoadmapInitiative(
      data.id,
      data.title,
      data.description,
      categoryValue,
      priorityValue,
      itemManager
    );
  }

  /**
   * Returns all items in this initiative
   */
  public get items(): RoadmapItem[] {
    return this._itemManager.items;
  }

  /**
   * Gets an item by ID
   */
  public getItem(itemId: string): RoadmapItem | undefined {
    return this._itemManager.getItem(itemId);
  }

  /**
   * Adds an item to this initiative
   * @param item The item to add
   * @param context Optional context information for event generation
   */
  public addItem(
    item: RoadmapItem, 
    context?: { 
      roadmapId?: string; 
      timeframeId?: string; 
    }
  ): RoadmapInitiative {
    const itemContext = context ? {
      ...context,
      initiativeId: this.id
    } : undefined;
    
    const updatedItemManager = this._itemManager.addItem(item, itemContext);
    
    const updatedInitiative = new RoadmapInitiative(
      this.id,
      this.title,
      this.description,
      this.category,
      this.priority,
      updatedItemManager
    );
    
    // Transfer events from the item manager to the initiative
    updatedItemManager.domainEvents.forEach(event => {
      updatedInitiative.registerEvent(event);
    });
    
    return updatedInitiative;
  }

  /**
   * Removes an item from this initiative
   */
  public removeItem(itemId: string): RoadmapInitiative {
    const updatedItemManager = this._itemManager.removeItem(itemId);
    
    return new RoadmapInitiative(
      this.id,
      this.title,
      this.description,
      this.category,
      this.priority,
      updatedItemManager
    );
  }

  /**
   * Updates this initiative with new values
   * @param updates The fields to update
   * @param context Optional context information for event generation
   */
  public update(
    updates: {
      title?: string;
      description?: string;
      category?: Category | string;
      priority?: Priority | string;
    },
    context?: {
      roadmapId?: string;
      timeframeId?: string;
    }
  ): RoadmapInitiative {
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

    const updatedInitiative = new RoadmapInitiative(
      this.id,
      updates.title ?? this.title,
      updates.description ?? this.description,
      categoryValue,
      priorityValue,
      this._itemManager
    );
    
    // Register events if context is provided
    if (context?.roadmapId && context?.timeframeId) {
      const eventContext = {
        roadmapId: context.roadmapId,
        timeframeId: context.timeframeId,
        initiativeId: this.id
      };
      
      // Check for priority change
      if (updates.priority !== undefined) {
        const priorityEvent = InitiativeEventFactory.createPriorityChangedEvent(
          this.priority,
          priorityValue,
          eventContext
        );
        if (priorityEvent) {
          updatedInitiative.registerEvent(priorityEvent);
        }
      }
      
      // Check for category change
      if (updates.category !== undefined) {
        const categoryEvent = InitiativeEventFactory.createCategoryChangedEvent(
          this.category,
          categoryValue,
          eventContext
        );
        if (categoryEvent) {
          updatedInitiative.registerEvent(categoryEvent);
        }
      }
    }

    return updatedInitiative;
  }
  
  /**
   * Updates the priority of this initiative
   * @param newPriority The new priority
   * @param context The context information for event generation
   */
  public updatePriority(
    newPriority: Priority | string,
    context: {
      roadmapId: string;
      timeframeId: string;
    }
  ): RoadmapInitiative {
    return this.update({ priority: newPriority }, context);
  }
  
  /**
   * Updates the category of this initiative
   * @param newCategory The new category
   * @param context The context information for event generation
   */
  public updateCategory(
    newCategory: Category | string,
    context: {
      roadmapId: string;
      timeframeId: string;
    }
  ): RoadmapInitiative {
    return this.update({ category: newCategory }, context);
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
      items: this._itemManager.toJSON()
    };
  }
}