/**
 * Domain Entity representing a User Story, which describes a software feature
 * from an end user's perspective, typically following the format:
 * "As a [user type], I want to [action], so that [benefit]"
 */
export class Story {
  /** Immutable unique identifier */
  public readonly id: string;
  
  /** Title of the Story */
  public title: string;
  
  /** The type of user this story is for */
  public userType: string;
  
  /** The action the user wants to perform */
  public action: string;
  
  /** The benefit the user receives */
  public benefit: string;
  
  /** The ID of the Epic this story belongs to */
  public epicId: string;
  
  /** Complexity score (1-8) */
  public complexity: number;
  
  /** ISO-8601 timestamp of when the Story was created */
  public readonly createdAt: string;
  
  /** ISO-8601 timestamp of when the Story was last updated */
  public updatedAt: string;

  private constructor(params: {
    id: string;
    title: string;
    userType: string;
    action: string;
    benefit: string;
    epicId: string;
    complexity: number;
    createdAt: string;
    updatedAt: string;
  }) {
    this.id = params.id;
    this.title = params.title;
    this.userType = params.userType;
    this.action = params.action;
    this.benefit = params.benefit;
    this.epicId = params.epicId;
    this.complexity = params.complexity;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  /**
   * Factory method to create a new Story
   */
  public static create(params: {
    title: string;
    userType: string;
    action: string;
    benefit: string;
    epicId: string;
    complexity: number;
  }): Story {
    const now = new Date().toISOString();
    return new Story({
      id: `STORY-${Date.now()}`,
      title: params.title,
      userType: params.userType,
      action: params.action,
      benefit: params.benefit,
      epicId: params.epicId,
      complexity: params.complexity,
      createdAt: now,
      updatedAt: now
    });
  }

  /**
   * Factory method to reconstruct a Story from persistence
   */
  public static fromPersistence(data: {
    id: string;
    title: string;
    userType: string;
    action: string;
    benefit: string;
    epicId: string;
    complexity: number;
    createdAt: string;
    updatedAt: string;
  }): Story {
    return new Story(data);
  }

  /**
   * Gets the full user story in "As a X, I want Y, so that Z" format
   */
  public getUserStoryFormat(): string {
    return `As a ${this.userType}, I want to ${this.action}, so that ${this.benefit}`;
  }
  
  /**
   * Updates the complexity and updates the updatedAt timestamp
   */
  public updateComplexity(complexity: number): void {
    this.complexity = complexity;
    this.updatedAt = new Date().toISOString();
  }
}