import { ThinkingProcess } from "../../domain/entities/ThinkingProcess.js";
import { ThinkingProcessRepository } from "../../domain/repositories/ThinkingProcessRepository.js";

/**
 * Simple in-memory repository – suitable for a CLI/stdio server where
 * processes live only for the lifetime of the Node.js process.  Can later be
 * replaced by a JSON-file or database backed implementation without touching
 * the application layer.
 */
export class InMemoryThinkingProcessRepository implements ThinkingProcessRepository {
  private readonly store = new Map<string, ThinkingProcess>();

  async save(process: ThinkingProcess): Promise<void> {
    this.store.set(process.goalId ?? process.id, process);
  }

  async findByGoalId(goalId: string): Promise<ThinkingProcess | null> {
    return this.store.get(goalId) ?? null;
  }
}
