import { ThinkingProcess } from "../entities/ThinkingProcess.js";

/**
 * Repository abstraction for {@link ThinkingProcess} aggregates.
 */
export interface ThinkingProcessRepository {
  save(process: ThinkingProcess): Promise<void>;
  findByGoalId(goalId: string): Promise<ThinkingProcess | null>;
}
