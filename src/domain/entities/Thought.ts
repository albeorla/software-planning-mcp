/**
 * Value Object representing an individual thinking step ("thought").
 *
 * Kept intentionally minimal for now – additional metadata like `branchId`
 * or `parentId` can be added later without affecting callers.
 */
export class Thought {
  /** Stable identifier so that thoughts can be referenced later on (branching, edits, …). */
  public readonly id: string;

  /** Free-form text that captures the actual thought. */
  public readonly content: string;

  /** ISO-8601 timestamp (creation time). */
  public readonly createdAt: string;

  private constructor(params: { id: string; content: string; createdAt: string }) {
    this.id = params.id;
    this.content = params.content;
    this.createdAt = params.createdAt;
  }

  /** Factory helper that creates a brand-new {@link Thought} instance. */
  public static create(content: string): Thought {
    return new Thought({ id: Date.now().toString(), content, createdAt: new Date().toISOString() });
  }

  /** Hydrate a {@link Thought} from persistence without triggering business logic. */
  public static fromPersistence(raw: { id: string; content: string; createdAt: string }): Thought {
    return new Thought(raw);
  }
}
