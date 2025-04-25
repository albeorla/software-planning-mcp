import { Todo } from "./Todo.js";

/**
 * Aggregate Root that groups {@link Todo} items for a single {@link Goal}.
 *
 * In DDD terms the *ImplementationPlan* is the aggregate boundary – external
 * consumers are not allowed to interact with `Todo` instances directly but
 * must always go through the plan so that invariants (e.g. uniqueness of
 * identifiers) are preserved.
 */
export class ImplementationPlan {
  /** Identifier of the *parent* goal (stored here to keep the aggregate small). */
  public readonly goalId: string;

  private readonly _todos: Todo[] = [];

  /** Timestamp of last modification – handy for optimistic caching. */
  public updatedAt: string;

  constructor(goalId: string, todos: Todo[] = [], updatedAt: string = new Date().toISOString()) {
    this.goalId = goalId;
    this._todos.push(...todos);
    this.updatedAt = updatedAt;
  }

  // ----------------------------------------------------------------
  // Domain behaviour
  // ----------------------------------------------------------------

  /** Adds a new todo item to the plan and updates *updatedAt*. */
  public addTodo(todo: Todo): void {
    this._todos.push(todo);
    this.touch();
  }

  /** Remove a todo by identifier.  Returns *true* when something was removed. */
  public removeTodo(todoId: string): boolean {
    const initialLength = this._todos.length;
    const index = this._todos.findIndex((t) => t.id === todoId);
    if (index !== -1) {
      this._todos.splice(index, 1);
      this.touch();
    }
    return this._todos.length !== initialLength;
  }

  /** Retrieve a *shallow copy* of the todo list to maintain encapsulation. */
  public get todos(): Todo[] {
    return [...this._todos];
  }

  /** Updates the *updatedAt* timestamp to *now*. */
  private touch(): void {
    this.updatedAt = new Date().toISOString();
  }
}
