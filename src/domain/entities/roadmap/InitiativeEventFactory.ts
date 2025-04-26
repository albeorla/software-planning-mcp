import { Category } from '../../value-objects/Category.js';
import { Priority } from '../../value-objects/Priority.js';
import { 
  RoadmapInitiativePriorityChanged, 
  RoadmapInitiativeCategoryChanged 
} from '../../events/RoadmapEvents.js';

/**
 * Factory for creating domain events related to RoadmapInitiatives
 * Encapsulates event creation logic to keep the main entity class cleaner
 */
export class InitiativeEventFactory {
  /**
   * Creates a priority changed event if the priority has changed
   */
  public static createPriorityChangedEvent(
    currentPriority: Priority,
    newPriority: Priority,
    context: {
      roadmapId: string;
      timeframeId: string;
      initiativeId: string;
    }
  ): RoadmapInitiativePriorityChanged | null {
    // If priority hasn't changed, return null
    if (currentPriority.equals(newPriority)) {
      return null;
    }
    
    // Create the priority changed event
    return new RoadmapInitiativePriorityChanged(
      context.roadmapId,
      context.timeframeId,
      context.initiativeId,
      currentPriority,
      newPriority
    );
  }
  
  /**
   * Creates a category changed event if the category has changed
   */
  public static createCategoryChangedEvent(
    currentCategory: Category,
    newCategory: Category,
    context: {
      roadmapId: string;
      timeframeId: string;
      initiativeId: string;
    }
  ): RoadmapInitiativeCategoryChanged | null {
    // If category hasn't changed, return null
    if (currentCategory.equals(newCategory)) {
      return null;
    }
    
    // Create the category changed event
    return new RoadmapInitiativeCategoryChanged(
      context.roadmapId,
      context.timeframeId,
      context.initiativeId,
      currentCategory,
      newCategory
    );
  }
}