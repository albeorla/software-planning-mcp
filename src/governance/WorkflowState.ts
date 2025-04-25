import { Todo } from '../domain/entities/Todo.js';

/**
 * Enum representing the different phases of the workflow
 */
export enum WorkflowPhase {
  IDLE = 'IDLE',                     // No active planning or implementation
  PLANNING = 'PLANNING',             // Planning phase - creating tasks, thinking
  IMPLEMENTATION = 'IMPLEMENTATION', // Implementation phase - editing files
  REVIEW_AND_COMMIT = 'REVIEW_AND_COMMIT', // Review and commit phase
  COMPLETED = 'COMPLETED'            // Task completed and committed
}

/**
 * Class representing the state of the workflow.
 * This tracks the current phase, active task, accesses files, etc.
 */
export class WorkflowState {
  // Current phase of the workflow
  public currentPhase: WorkflowPhase = WorkflowPhase.IDLE;
  
  // Goal information
  public goalDescription: string | null = null;
  public goalId: string | null = null;
  
  // Tasks
  public tasks: Todo[] = [];
  public currentTask: Todo | null = null;
  
  // Planning phase data
  public thoughts: string[] = [];
  
  // Implementation phase data
  public fileAccesses: Array<{
    path: string;
    operation: 'read' | 'write';
    timestamp: string;
  }> = [];
  
  /**
   * Start a new planning session
   */
  public startPlanningSession(goalDescription: string): void {
    this.currentPhase = WorkflowPhase.PLANNING;
    this.goalDescription = goalDescription;
    this.thoughts = [];
    this.tasks = [];
    this.currentTask = null;
    this.fileAccesses = [];
  }
  
  /**
   * Add a thought to the planning session
   */
  public addThought(thought: string): void {
    if (this.currentPhase !== WorkflowPhase.PLANNING) {
      throw new Error(`Cannot add thought in ${this.currentPhase} phase`);
    }
    
    this.thoughts.push(thought);
  }
  
  /**
   * Add a task to the planning session
   */
  public addTask(task: Todo): void {
    this.tasks.push(task);
  }
  
  /**
   * Update tasks with a fresh list from the repository
   */
  public updateTasks(tasks: Todo[]): void {
    this.tasks = tasks;
  }
  
  /**
   * Start implementing a specific task
   */
  public startImplementation(taskId: string, task: Todo): void {
    this.currentPhase = WorkflowPhase.IMPLEMENTATION;
    this.currentTask = task;
    this.fileAccesses = []; // Reset file accesses for new implementation
  }
  
  /**
   * Record file access during implementation
   */
  public addFileAccess(path: string, operation: 'read' | 'write'): void {
    this.fileAccesses.push({
      path,
      operation,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Complete implementation and move to review phase
   */
  public completeImplementation(): void {
    if (!this.currentTask) {
      throw new Error('No current task to complete');
    }
    
    this.currentPhase = WorkflowPhase.REVIEW_AND_COMMIT;
  }
  
  /**
   * Complete commit phase and reset to COMPLETED state
   */
  public completeCommit(): void {
    this.currentPhase = WorkflowPhase.COMPLETED;
  }
  
  /**
   * Extract PRD ID from goal description if available
   * Handles formats like "PRD-XX-YY" or similar
   */
  public extractPrdId(): string {
    if (!this.goalDescription) {
      return 'UNKNOWN';
    }
    
    // Try to match formats like PRD-XX-YY, PRD-XX-01, etc.
    const match = this.goalDescription.match(/\b([A-Z]+-[A-Z]+-\d+)\b/i);
    if (match) {
      return match[1].toUpperCase();
    }
    
    // If no match but we have a current task, see if it has PRD info
    if (this.currentTask && this.currentTask.title) {
      const taskMatch = this.currentTask.title.match(/\b([A-Z]+-[A-Z]+-\d+)\b/i);
      if (taskMatch) {
        return taskMatch[1].toUpperCase();
      }
    }
    
    return 'UNKNOWN';
  }
  
  /**
   * Get a summary of modifications made during implementation
   */
  public getImplementationSummary(): string[] {
    const summary: string[] = [];
    
    // Count unique files modified
    const uniqueFiles = new Set(this.fileAccesses.map(access => access.path));
    summary.push(`Modified ${uniqueFiles.size} files`);
    
    // Count writes vs reads
    const writes = this.fileAccesses.filter(access => access.operation === 'write').length;
    summary.push(`Made ${writes} file edits`);
    
    // Add task info
    if (this.currentTask) {
      summary.push(`Implemented "${this.currentTask.title}"`);
    }
    
    return summary;
  }
  
  /**
   * Reset the workflow state to IDLE
   */
  public reset(): void {
    this.currentPhase = WorkflowPhase.IDLE;
    this.goalDescription = null;
    this.goalId = null;
    this.tasks = [];
    this.currentTask = null;
    this.thoughts = [];
    this.fileAccesses = [];
  }
}