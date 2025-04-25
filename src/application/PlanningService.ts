import { Goal } from "../domain/entities/Goal.js";
import { ImplementationPlan } from "../domain/entities/ImplementationPlan.js";
import { Todo } from "../domain/entities/Todo.js";
import { GoalRepository } from "../domain/repositories/GoalRepository.js";
import { ImplementationPlanRepository } from "../domain/repositories/ImplementationPlanRepository.js";

/**
 * Application-level service that exposes *use cases* required by the CLI / MCP
 * layer.  This keeps the transport code entirely decoupled from persistence
 * concerns and enables unit-testing of the core behaviour in isolation.
 */
export class PlanningApplicationService {
  constructor(
    private readonly goals: GoalRepository,
    private readonly plans: ImplementationPlanRepository,
    private readonly parser: import("./PlanParser.js").PlanParser,
  ) {}

  // ------------------------------------------------------------------
  // Public API used by the server
  // ------------------------------------------------------------------

  /**
   * Starts a new planning session with the specified goal description.
   * Creates a Goal entity and an empty ImplementationPlan.
   */
  public async startPlanningSession(description: string): Promise<Goal> {
    const goal = Goal.create(description);
    await this.goals.save(goal);

    // Proactively create an empty plan so that downstream operations can rely
    // on its existence.
    const plan = new ImplementationPlan(goal.id);
    await this.plans.savePlan(plan);

    return goal;
  }

  public async getPlan(goalId: string): Promise<ImplementationPlan | null> {
    return this.plans.findByGoalId(goalId);
  }

  /**
   * Adds a new todo item to the current implementation plan.
   */
  public async addTodoToCurrentPlan(goalId: string, params: { title: string; description: string; complexity: number; codeExample?: string }): Promise<Todo> {
    const plan = await this.requirePlan(goalId);
    const todo = Todo.create(params);
    plan.addTodo(todo);
    await this.plans.savePlan(plan);
    return todo;
  }

  /**
   * Bulk-import plan text and convert to individual todos using the injected
   * {@link PlanParser}.  Returns the amount of todos imported.
   */
  public async importPlan(goalId: string, planText: string): Promise<number> {
    const parsed = this.parser.parse(planText);
    for (const todoData of parsed) {
      await this.addTodoToCurrentPlan(goalId, todoData);
    }
    return parsed.length;
  }

  /**
   * Removes a todo item from the current implementation plan.
   */
  public async removeTodo(goalId: string, todoId: string): Promise<void> {
    const plan = await this.requirePlan(goalId);
    const removed = plan.removeTodo(todoId);
    if (!removed) {
      throw new Error(`No todo with id ${todoId}`);
    }
    await this.plans.savePlan(plan);
  }

  /**
   * Returns all todos in the current implementation plan.
   */
  public async getCurrentTodos(goalId: string): Promise<Todo[]> {
    const plan = await this.requirePlan(goalId);
    return plan.todos;
  }

  /**
   * Updates the status of a todo item.
   */
  public async updateTodoStatus(goalId: string, todoId: string, isComplete: boolean): Promise<Todo> {
    const plan = await this.requirePlan(goalId);
    const todo = plan.todos.find((t) => t.id === todoId);
    if (!todo) {
      throw new Error(`No todo with id ${todoId}`);
    }
    isComplete ? todo.markComplete() : todo.markIncomplete();
    await this.plans.savePlan(plan);
    return todo;
  }

  /**
   * Completes a task and handles all side effects (documentation updates, etc.)
   * This is an orchestration method that delegates to other services.
   */
  public async completeTask(goalId: string, todoId: string, summaryPoints: string[]): Promise<Todo> {
    // Mark the todo as complete in our repository
    const todo = await this.updateTodoStatus(goalId, todoId, true);
    
    // In a full implementation, we would call:
    // this.documentationService.updateSprintTaskStatus(todoId, "done");
    // this.documentationService.appendWorkSummary(new Date(), summaryPoints);
    // this.documentationService.updateDashboardMetrics();
    
    return todo;
  }

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  private async requirePlan(goalId: string): Promise<ImplementationPlan> {
    const plan = await this.plans.findByGoalId(goalId);
    if (!plan) {
      throw new Error(`No implementation plan for goal ${goalId}`);
    }
    return plan;
  }
}
