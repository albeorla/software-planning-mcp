import { RoadmapEventHandlers } from '../../application/event-handlers/RoadmapEventHandlers.js';

/**
 * Bootstraps event handlers for the application
 */
export class EventHandlerBootstrap {
  /**
   * Initializes all event handlers
   */
  public static initialize(): void {
    console.log('Initializing event handlers...');
    
    // Initialize roadmap event handlers
    new RoadmapEventHandlers();
    
    // Additional event handlers can be initialized here
    
    console.log('Event handlers initialized');
  }
}