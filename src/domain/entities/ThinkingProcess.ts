import { Thought } from "./Thought.js";

/**
 * Aggregate Root that groups a chain (or tree) of {@link Thought} instances
 * belonging to a single planning session / goal.
 */
export class ThinkingProcess {
  /** Unique identifier of the thinking process. */
  public readonly id: string;

  /** Optional link back to the {@link Goal.id} this thinking process belongs to. */
  public readonly goalId: string | null;

  private readonly _history: Thought[] = [];

  /** Timestamp of last modification – handy for optimistic caching. */
  public updatedAt: string;

  private constructor(params: { id: string; goalId: string | null; thoughts?: Thought[]; updatedAt?: string }) {
    this.id = params.id;
    this.goalId = params.goalId;
    if (params.thoughts) {
      this._history.push(...params.thoughts);
    }
    this.updatedAt = params.updatedAt ?? new Date().toISOString();
  }

  // ------------------------------------------------------------------
  // Domain behaviour
  // ------------------------------------------------------------------

  /** Append a new {@link Thought} to the history. */
  public addThought(thought: Thought): void {
    this._history.push(thought);
    this.touch();
  }

  /** Read-only copy of the history to preserve encapsulation. */
  public get history(): Thought[] {
    return [...this._history];
  }

  // ------------------------------------------------------------------
  // Factory helpers
  // ------------------------------------------------------------------

  public static create(goalId: string | null = null): ThinkingProcess {
    return new ThinkingProcess({ id: Date.now().toString(), goalId });
  }

  public static fromPersistence(raw: {
    id: string;
    goalId: string | null;
    updatedAt: string;
    thoughts: Array<{ id: string; content: string; createdAt: string }>;
  }): ThinkingProcess {
    return new ThinkingProcess({
      id: raw.id,
      goalId: raw.goalId,
      updatedAt: raw.updatedAt,
      thoughts: raw.thoughts.map(Thought.fromPersistence),
    });
  }

  // ------------------------------------------------------------------
  // Internals
  // ------------------------------------------------------------------

  private touch(): void {
    this.updatedAt = new Date().toISOString();
  }
}
