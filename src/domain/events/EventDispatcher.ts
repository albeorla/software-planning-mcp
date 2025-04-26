import { DomainEvent } from './DomainEvent.js';

/**
 * Type for event handlers
 */
type EventHandler = (event: DomainEvent) => void;

/**
 * Dispatches domain events to registered handlers
 * Implemented as a singleton to provide global event handling across the application
 */
export class EventDispatcher {
  /**
   * Singleton instance
   */
  private static instance: EventDispatcher;
  
  /**
   * Map of event types to handlers
   */
  private handlers: Map<string, EventHandler[]> = new Map();
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}
  
  /**
   * Gets the singleton instance
   */
  public static getInstance(): EventDispatcher {
    if (!EventDispatcher.instance) {
      EventDispatcher.instance = new EventDispatcher();
    }
    return EventDispatcher.instance;
  }
  
  /**
   * Registers a handler for a specific event type
   * @param eventType The type of event to handle
   * @param handler The handler function
   */
  public register(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }
  
  /**
   * Dispatches an event to all registered handlers
   * @param event The event to dispatch
   */
  public dispatch(event: DomainEvent): void {
    const handlers = this.handlers.get(event.eventType) || [];
    handlers.forEach(handler => handler(event));
  }
  
  /**
   * Dispatches multiple events in sequence
   * @param events The events to dispatch
   */
  public dispatchAll(events: DomainEvent[]): void {
    events.forEach(event => this.dispatch(event));
  }
  
  /**
   * Clears all registered handlers (primarily for testing)
   */
  public clearHandlers(): void {
    this.handlers.clear();
  }
}