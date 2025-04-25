/**
 * Domain Entity representing a Task, which is a specific unit of work
 * that needs to be completed to implement a User Story.
 */
export class Task {
  /** Immutable unique identifier */
  public readonly id: string;
  
  /** Title of the Task */
  public title: string;
  
  /** Detailed description of the task */
  public description: string;
  
  /** ID of the parent Story */
  public storyId: string;
  
  /** Complexity score (1-8) */
  public complexity: number;
  
  /** Optional code example */
  public codeExample?: string;
  
  /** Current status of the task */
  public status: 'todo' | 'in-progress' | 'blocked' | 'done';
  
  /** Optional description of what's blocking the task */
  public blockerDescription?: string;
  
  /** ISO-8601 timestamp of when the Task was created */
  public readonly createdAt: string;
  
  /** ISO-8601 timestamp of when the Task was last updated */
  public updatedAt: string;

  private constructor(params: {
    id: string;
    title: string;
    description: string;
    storyId: string;
    complexity: number;
    codeExample?: string;
    status: 'todo' | 'in-progress' | 'blocked' | 'done';
    blockerDescription?: string;
    createdAt: string;
    updatedAt: string;
  }) {
    this.id = params.id;
    this.title = params.title;
    this.description = params.description;
    this.storyId = params.storyId;
    this.complexity = params.complexity;
    this.codeExample = params.codeExample;
    this.status = params.status;
    this.blockerDescription = params.blockerDescription;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  /**
   * Factory method to create a new Task
   */
  public static create(params: {
    title: string;
    description: string;
    storyId: string;
    complexity: number;
    codeExample?: string;
  }): Task {
    const now = new Date().toISOString();
    return new Task({
      id: `TASK-${Date.now()}`,
      title: params.title,
      description: params.description,
      storyId: params.storyId,
      complexity: params.complexity,
      codeExample: params.codeExample,
      status: 'todo',
      createdAt: now,
      updatedAt: now
    });
  }

  /**
   * Factory method to reconstruct a Task from persistence
   */
  public static fromPersistence(data: {
    id: string;
    title: string;
    description: string;
    storyId: string;
    complexity: number;
    codeExample?: string;
    status: 'todo' | 'in-progress' | 'blocked' | 'done';
    blockerDescription?: string;
    createdAt: string;
    updatedAt: string;
  }): Task {
    return new Task(data);
  }

  /**
   * Marks the task as in progress
   */
  public markInProgress(): void {
    this.status = 'in-progress';
    this.blockerDescription = undefined;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Marks the task as blocked
   */
  public markBlocked(blockerDescription: string): void {
    this.status = 'blocked';
    this.blockerDescription = blockerDescription;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Marks the task as complete
   */
  public markComplete(): void {
    this.status = 'done';
    this.blockerDescription = undefined;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Updates the task complexity
   */
  public updateComplexity(complexity: number): void {
    this.complexity = complexity;
    this.updatedAt = new Date().toISOString();
  }
}