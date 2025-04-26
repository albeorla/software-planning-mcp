import { RoadmapItem } from './RoadmapItem.js';
import { RoadmapItemAdded } from '../../events/RoadmapEvents.js';
import { Entity } from '../Entity.js';

/**
 * Manages the collection of items within a RoadmapInitiative
 * Encapsulates operations for adding, removing, and retrieving items
 */
export class InitiativeItemManager extends Entity {
  /**
   * The items within this initiative
   */
  private readonly _items: Map<string, RoadmapItem>;

  /**
   * Creates a new InitiativeItemManager
   */
  constructor(items: Map<string, RoadmapItem> = new Map()) {
    super();
    this._items = items;
  }

  /**
   * Factory method to create a manager from an array of items
   */
  public static fromItems(items: RoadmapItem[]): InitiativeItemManager {
    const itemsMap = new Map<string, RoadmapItem>();
    items.forEach(item => {
      itemsMap.set(item.id, item);
    });
    
    return new InitiativeItemManager(itemsMap);
  }

  /**
   * Factory method to recreate a manager from persistence
   */
  public static fromPersistence(itemsData: any[]): InitiativeItemManager {
    const itemsMap = new Map<string, RoadmapItem>();
    
    if (Array.isArray(itemsData)) {
      itemsData.forEach((item: any) => {
        const roadmapItem = RoadmapItem.fromPersistence(item);
        itemsMap.set(roadmapItem.id, roadmapItem);
      });
    }
    
    return new InitiativeItemManager(itemsMap);
  }

  /**
   * Adds an item to this manager
   * @param item The item to add
   * @param context Optional context information for event generation
   */
  public addItem(
    item: RoadmapItem, 
    context?: { 
      roadmapId?: string; 
      timeframeId?: string;
      initiativeId?: string; 
    }
  ): InitiativeItemManager {
    const updatedItems = new Map(this._items);
    updatedItems.set(item.id, item);
    
    const updatedManager = new InitiativeItemManager(updatedItems);
    
    // Register event if context is provided
    if (context?.roadmapId && context?.timeframeId && context?.initiativeId) {
      const event = new RoadmapItemAdded(
        context.roadmapId,
        context.timeframeId,
        context.initiativeId,
        item.id,
        item.title,
        item.status
      );
      updatedManager.registerEvent(event);
      
      // Transfer any events from the item to this manager
      const itemEvents = item.domainEvents;
      itemEvents.forEach(event => updatedManager.registerEvent(event));
    }
    
    return updatedManager;
  }

  /**
   * Removes an item from this manager
   */
  public removeItem(itemId: string): InitiativeItemManager {
    if (!this._items.has(itemId)) {
      throw new Error(`Item with ID ${itemId} not found in initiative`);
    }
    
    const updatedItems = new Map(this._items);
    updatedItems.delete(itemId);
    
    return new InitiativeItemManager(updatedItems);
  }

  /**
   * Returns all items managed by this manager
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
   * Returns true if the manager contains an item with the given ID
   */
  public hasItem(itemId: string): boolean {
    return this._items.has(itemId);
  }

  /**
   * Returns the number of items in this manager
   */
  public get count(): number {
    return this._items.size;
  }

  /**
   * Serializes the items for persistence
   */
  public toJSON(): any[] {
    return this.items.map(item => item.toJSON());
  }
}