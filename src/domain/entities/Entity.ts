import { DomainEvent } from '../events/DomainEvent.js';

/**
 * Base class for all domain entities that can raise events
 */
export abstract class Entity {
  private _domainEvents: DomainEvent[] = [];
  
  /**
   * Register an event to be dispatched later
   * @param event The domain event
   */
  protected registerEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
  
  /**
   * Get all registered domain events
   */
  public get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }
  
  /**
   * Clear all registered domain events and return them
   * This is typically called after dispatching events
   */
  public clearEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }
}