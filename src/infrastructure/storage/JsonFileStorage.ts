import { promises as fs } from "fs";
import path from "path";
import os from "os";

import { Goal } from "../../domain/entities/Goal.js";
import { Todo } from "../../domain/entities/Todo.js";
import { ImplementationPlan } from "../../domain/entities/ImplementationPlan.js";
import { GoalRepository } from "../../domain/repositories/GoalRepository.js";
import { ImplementationPlanRepository } from "../../domain/repositories/ImplementationPlanRepository.js";

/**
 * Thin infrastructure-layer adapter that persists the domain state as a
 * prettified JSON file in the user home directory.  This implementation is
 * intentionally simple – in a production environment one would swap it out
 * for a relational/NoSQL database without touching the domain logic thanks to
 * the repository abstractions.
 */
export class JsonFileStorage implements GoalRepository, ImplementationPlanRepository {
  private readonly storageFile: string;

  private _data: {
    goals: Record<string, ReturnType<typeof JsonFileStorage.serializeGoal>>;
    plans: Record<
      string,
      {
        updatedAt: string;
        todos: Array<ReturnType<typeof JsonFileStorage.serializeTodo>>;
      }
    >;
  } = {
    goals: {},
    plans: {},
  };

  constructor() {
    // Persist data inside a hidden ".docs" folder located in the *current
    // working directory* (i.e. the project root where the CLI is executed).
    //
    // Storing the file alongside the project keeps all planning artefacts
    // self-contained and avoids polluting the user‘s home directory. This also
    // mirrors common conventions used by many developer tools (e.g. Terraform)
    // that place state into hidden folders inside the workspace.
    const dir = path.join(process.cwd(), ".docs");

    // Retain the legacy fallback inside the OS home folder for backwards
    // compatibility – if the tool is executed outside of a normal project
    // context (e.g. directly from the user‘s home directory) we still want a
    // valid location. We only fall back when CWD === homedir to avoid creating
    // a sibling "~/.docs" folder for casual invocations.
    const isAtHomeDir = process.cwd() === os.homedir();
    const storageDir = isAtHomeDir ? path.join(os.homedir(), ".software-planning-tool") : dir;

    this.storageFile = path.join(storageDir, "data.json");
  }

  /** Lazily initialises the data file, idempotent. */
  public async initialise(): Promise<void> {
    const dir = path.dirname(this.storageFile);
    await fs.mkdir(dir, { recursive: true });

    try {
      const raw = await fs.readFile(this.storageFile, "utf8");
      this._data = JSON.parse(raw);
    } catch {
      // File does not exist yet – store initial empty structure
      await this.flush();
    }
  }

  // ---------------------------------------------------------------------
  // GoalRepository implementation
  // ---------------------------------------------------------------------

  public async save(goal: Goal): Promise<void> {
    this._data.goals[goal.id] = JsonFileStorage.serializeGoal(goal);
    await this.flush();
  }

  public async findById(id: string): Promise<Goal | null> {
    const raw = this._data.goals[id];
    return raw ? JsonFileStorage.deserializeGoal(raw) : null;
  }

  // ---------------------------------------------------------------------
  // ImplementationPlanRepository implementation
  // ---------------------------------------------------------------------

  public async savePlan(plan: ImplementationPlan): Promise<void> {
    this._data.plans[plan.goalId] = {
      updatedAt: plan.updatedAt,
      todos: plan.todos.map(JsonFileStorage.serializeTodo),
    };
    await this.flush();
  }

  public async findByGoalId(goalId: string): Promise<ImplementationPlan | null> {
    const raw = this._data.plans[goalId];
    if (!raw) {
      return null;
    }

    const plan = new ImplementationPlan(
      goalId,
      raw.todos.map(JsonFileStorage.deserializeTodo),
      raw.updatedAt,
    );
    return plan;
  }

  // ---------------------------------------------------------------------
  // (Private) Utility helpers
  // ---------------------------------------------------------------------

  private async flush(): Promise<void> {
    await fs.writeFile(this.storageFile, JSON.stringify(this._data, null, 2));
  }

  private static serializeGoal(goal: Goal) {
    return {
      id: goal.id,
      description: goal.description,
      createdAt: goal.createdAt,
    };
  }

  private static deserializeGoal(data: { id: string; description: string; createdAt: string }): Goal {
    return Goal.fromPersistence(data);
  }

  private static serializeTodo(todo: Todo) {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      complexity: todo.complexity,
      codeExample: todo.codeExample,
      isComplete: todo.isComplete,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };
  }

  private static deserializeTodo(
    data: {
      id: string;
      title: string;
      description: string;
      complexity: number;
      codeExample?: string;
      isComplete: boolean;
      createdAt: string;
      updatedAt: string;
    },
  ): Todo {
    return Todo.fromPersistence(data);
  }
}
