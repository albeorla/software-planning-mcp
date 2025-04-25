/**
 * Domain Entity representing a high-level business objective that a set of
 * implementation tasks (todos) will attempt to satisfy.
 *
 * In Domain-Driven Design (DDD) an *Entity* is defined primarily by its
 * identity rather than by its attributes. Consequently the {@link Goal} class
 * exposes a read-only `id` property that uniquely identifies it for the
 * lifetime of the system. Additional data such as `description` or timestamps
 * can evolve over time without affecting equality – two `Goal` instances are
 * considered equal when (and only when) their identifiers are equal.
 */
export class Goal {
  /** Immutable unique identifier. */
  public readonly id: string;

  /** Free-form description provided by the end user. */
  public description: string;

  /** ISO-8601 timestamp capturing the creation moment. */
  public readonly createdAt: string;

  private constructor(params: { id: string; description: string; createdAt: string }) {
    this.id = params.id;
    this.description = params.description;
    this.createdAt = params.createdAt;
  }

  /**
   * Factory helper that generates a brand-new {@link Goal} instance.
   *
   * A production-grade implementation would rely on UUIDs/ULIDs or a database
   * sequence.  For demonstration purposes we fallback to `Date.now()` so that
   * the code remains infrastructure-agnostic.
   */
  public static create(description: string): Goal {
    return new Goal({ id: Date.now().toString(), description, createdAt: new Date().toISOString() });
  }

  /** Factory used by infrastructure layer to *reconstitute* an entity that
   * already exists in persistence. */
  public static fromPersistence(raw: { id: string; description: string; createdAt: string }): Goal {
    return new Goal(raw);
  }

  /** Equality based on identifier – convenient for data structures. */
  public equals(other: Goal): boolean {
    return this.id === other.id;
  }
}
