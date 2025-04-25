import { Goal } from "../entities/Goal.js";

/**
 * Abstraction in line with the *Repository* pattern (GoF) that hides the
 * details of persisting {@link Goal} instances from the domain layer.
 */
export interface GoalRepository {
  save(goal: Goal): Promise<void>;
  findById(id: string): Promise<Goal | null>;
}
