import { ImplementationPlan } from "../entities/ImplementationPlan.js";

/**
 * Repository abstraction for {@link ImplementationPlan} aggregates.  Provides
 * only the operations that the domain actually requires – adhering to the
 * Interface Segregation Principle (ISP).
 */
export interface ImplementationPlanRepository {
  savePlan(plan: ImplementationPlan): Promise<void>;
  findByGoalId(goalId: string): Promise<ImplementationPlan | null>;
}
