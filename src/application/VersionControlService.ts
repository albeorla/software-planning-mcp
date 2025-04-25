import { exec } from "child_process";
import { promisify } from "util";
import { PlanningApplicationService } from "./PlanningService.js";

const execAsync = promisify(exec);

/**
 * Application service that handles version control operations.
 * This includes committing changes, checking status, etc.
 */
export class VersionControlApplicationService {
  constructor(private readonly planningService?: PlanningApplicationService) {}

  /**
   * Commits changes associated with a specific task.
   * 
   * @param todoId The ID of the todo item
   * @param message The commit message
   * @returns Result of the git commit operation
   */
  public async commitTaskChanges(todoId: string, message: string): Promise<{success: boolean; output: string}> {
    try {
      // Validate commit message format
      this.validateCommitMessage(message);
      
      // Execute git status to check for changes
      const statusResult = await execAsync('git status --porcelain');
      if (!statusResult.stdout.trim()) {
        return {
          success: false,
          output: "No changes to commit. Working tree clean."
        };
      }
      
      // Execute git commit
      const commitResult = await execAsync(`git commit -am "${message}"`);
      
      return {
        success: true,
        output: commitResult.stdout
      };
    } catch (error) {
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Validates that the commit message follows the required format.
   * In a real implementation, this would check for PRD ID, proper formatting, etc.
   */
  private validateCommitMessage(message: string): void {
    // Simple validation: Check if message is too short
    if (message.length < 10) {
      throw new Error("Commit message is too short. It should contain a proper description.");
    }
    
    // Check for a pattern like [PRD-XX-YY] or (T-123)
    const hasPrdId = /\[PRD-[A-Z]+-\d+\]/.test(message);
    const hasTodoId = /\(T-\d+\)/.test(message);
    
    if (!hasPrdId && !hasTodoId) {
      throw new Error("Commit message must include a PRD ID like [PRD-AB-01] and/or a Task ID like (T-123)");
    }
  }

  /**
   * Gets the current git status
   */
  public async getStatus(): Promise<string> {
    try {
      const { stdout } = await execAsync('git status');
      return stdout;
    } catch (error) {
      throw new Error(`Failed to get git status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets recent commit history
   */
  public async getCommitHistory(count: number = 5): Promise<string> {
    try {
      const { stdout } = await execAsync(`git log -n ${count} --oneline`);
      return stdout;
    } catch (error) {
      throw new Error(`Failed to get commit history: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}