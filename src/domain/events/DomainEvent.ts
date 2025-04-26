/**
 * Base interface for all domain events
 * Domain events represent significant occurrences within the domain
 */
export interface DomainEvent {
  /**
   * When the event occurred
   */
  readonly occurredOn: Date;
  
  /**
   * The type of event (used for routing to handlers)
   */
  readonly eventType: string;
}