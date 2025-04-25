import { ThinkingProcessRepository } from "../domain/repositories/ThinkingProcessRepository.js";
import { ThinkingProcess } from "../domain/entities/ThinkingProcess.js";
import { Thought } from "../domain/entities/Thought.js";

export class ThinkingService {
  constructor(private readonly repo: ThinkingProcessRepository) {}

  /**
   * Ensure there is a {@link ThinkingProcess} for the specified goal and append
   * the provided thought.  Returns the updated process so that the caller can
   * inspect history or id if needed.
   */
  public async addThought(goalId: string, content: string): Promise<ThinkingProcess> {
    let process = await this.repo.findByGoalId(goalId);
    if (!process) {
      process = ThinkingProcess.create(goalId);
    }

    process.addThought(Thought.create(content));
    await this.repo.save(process);
    return process;
  }
}
