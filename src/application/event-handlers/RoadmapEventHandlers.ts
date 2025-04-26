import { 
  RoadmapCreated, 
  RoadmapItemStatusChanged, 
  RoadmapInitiativePriorityChanged,
  RoadmapInitiativeCategoryChanged
} from '../../domain/events/RoadmapEvents.js';
import { EventDispatcher } from '../../domain/events/EventDispatcher.js';
import { DomainEvent } from '../../domain/events/DomainEvent.js';
import { Status } from '../../domain/value-objects/Status.js';

/**
 * Handles roadmap domain events
 */
export class RoadmapEventHandlers {
  private readonly dispatcher: EventDispatcher;
  
  /**
   * Creates a new RoadmapEventHandlers instance and registers handlers
   */
  constructor() {
    this.dispatcher = EventDispatcher.getInstance();
    this.registerHandlers();
  }
  
  /**
   * Registers all event handlers
   */
  private registerHandlers(): void {
    // Register handlers for each event type
    this.dispatcher.register('RoadmapCreated', 
      (event: DomainEvent) => this.handleRoadmapCreated(event as RoadmapCreated));
    this.dispatcher.register('RoadmapItemStatusChanged', 
      (event: DomainEvent) => this.handleItemStatusChanged(event as RoadmapItemStatusChanged));
    this.dispatcher.register('RoadmapInitiativePriorityChanged', 
      (event: DomainEvent) => this.handleInitiativePriorityChanged(event as RoadmapInitiativePriorityChanged));
    this.dispatcher.register('RoadmapInitiativeCategoryChanged', 
      (event: DomainEvent) => this.handleInitiativeCategoryChanged(event as RoadmapInitiativeCategoryChanged));
  }
  
  /**
   * Handles the RoadmapCreated event
   * @param event The RoadmapCreated event
   */
  private handleRoadmapCreated(event: RoadmapCreated): void {
    console.log(`[EVENT] Roadmap created: ${event.title} (${event.roadmapId})`);
    
    // Additional business logic could be implemented here:
    // - Notify users
    // - Log the creation
    // - Update dashboards
    // - etc.
  }
  
  /**
   * Handles the RoadmapItemStatusChanged event
   * Example of cross-aggregate coordination
   * @param event The RoadmapItemStatusChanged event
   */
  private handleItemStatusChanged(event: RoadmapItemStatusChanged): void {
    console.log(`[EVENT] Item status changed: ${event.itemId} ${event.oldStatus} -> ${event.newStatus}`);
    
    // Example: Special handling for completed items
    if (event.newStatus.equals(Status.COMPLETED)) {
      console.log(`[ACTION] Item ${event.itemId} completed - updating related entities`);
      
      // Here we would:
      // 1. Find related tasks in other aggregates
      // 2. Update their status accordingly
      // 3. Save the changes
      
      // Example pseudocode:
      // const relatedTasks = taskRepository.findByRoadmapItemId(event.itemId);
      // for (const task of relatedTasks) {
      //   const updatedTask = task.markAsComplete();
      //   await taskRepository.save(updatedTask);
      // }
    }
  }
  
  /**
   * Handles the RoadmapInitiativePriorityChanged event
   * @param event The RoadmapInitiativePriorityChanged event
   */
  private handleInitiativePriorityChanged(event: RoadmapInitiativePriorityChanged): void {
    console.log(`[EVENT] Initiative priority changed: ${event.initiativeId} ${event.oldPriority} -> ${event.newPriority}`);
    
    // Example: If priority increases to high, we could trigger notifications
    if (event.newPriority.isHigh && !event.oldPriority.isHigh) {
      console.log(`[ACTION] Initiative ${event.initiativeId} escalated to high priority - sending notifications`);
      
      // Here we would:
      // 1. Identify stakeholders who need to be notified
      // 2. Send notifications
      // 3. Update dashboards
    }
  }
  
  /**
   * Handles the RoadmapInitiativeCategoryChanged event
   * @param event The RoadmapInitiativeCategoryChanged event
   */
  private handleInitiativeCategoryChanged(event: RoadmapInitiativeCategoryChanged): void {
    console.log(`[EVENT] Initiative category changed: ${event.initiativeId} ${event.oldCategory} -> ${event.newCategory}`);
    
    // Example: If category changes to tech-debt, update tech debt metrics
    if (event.newCategory.isTechDebt && !event.oldCategory.isTechDebt) {
      console.log(`[ACTION] Initiative ${event.initiativeId} categorized as tech debt - updating metrics`);
      
      // Here we would:
      // 1. Update tech debt metrics
      // 2. Notify engineering leads
      // 3. Add to tech debt backlog
    }
  }
}