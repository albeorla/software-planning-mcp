import { WorkflowPhase } from '../WorkflowState.js';

/**
 * Validates commands to ensure they are allowed in the current workflow phase
 */
export class CommandValidator {
  // Whitelist of commands for each phase
  private static readonly ALLOWED_COMMANDS: Record<WorkflowPhase, RegExp[]> = {
    [WorkflowPhase.IDLE]: [
      /^ls/, 
      /^pwd/, 
      /^echo/
    ],
    [WorkflowPhase.PLANNING]: [
      /^ls/, 
      /^pwd/, 
      /^echo/, 
      /^npm (list|ll|la)/, 
      /^node -v/, 
      /^cat package\.json/
    ],
    [WorkflowPhase.IMPLEMENTATION]: [
      /^ls/, 
      /^pwd/, 
      /^echo/, 
      /^npm (list|ll|la|run)/, 
      /^node/, 
      /^git (status|diff|log)/, 
      /^cd /
    ],
    [WorkflowPhase.REVIEW_AND_COMMIT]: [
      /^ls/, 
      /^pwd/, 
      /^echo/, 
      /^git (status|diff|add|commit|log)/, 
      /^npm test/
    ],
    [WorkflowPhase.COMPLETED]: [
      /^ls/, 
      /^pwd/, 
      /^echo/, 
      /^git (status|log|push)/
    ]
  };

  /**
   * Validates whether a command is allowed in the current workflow phase
   * @param command The command to check
   * @param purpose The stated purpose for running the command
   * @param currentPhase The current workflow phase
   * @returns boolean indicating if the command is allowed
   */
  static isCommandAllowedInCurrentPhase(
    command: string, 
    purpose: string, 
    currentPhase: WorkflowPhase
  ): boolean {
    // Check if the command matches any allowed pattern for the current phase
    const currentPhasePatterns = this.ALLOWED_COMMANDS[currentPhase];
    return currentPhasePatterns.some(pattern => pattern.test(command));
  }
}