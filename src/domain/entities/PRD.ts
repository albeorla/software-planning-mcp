/**
 * Domain Entity representing a Product Requirements Document (PRD)
 * that captures business and technical requirements for a feature or project.
 */
export class PRD {
  /** Immutable unique identifier */
  public readonly id: string;
  
  /** Title of the PRD */
  public title: string;
  
  /** Detailed description including requirements */
  public description: string;
  
  /** ISO-8601 timestamp of when the PRD was created */
  public readonly createdAt: string;
  
  /** ISO-8601 timestamp of when the PRD was last updated */
  public updatedAt: string;

  private constructor(params: {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  }) {
    this.id = params.id;
    this.title = params.title;
    this.description = params.description;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  /**
   * Factory method to create a new PRD
   */
  public static create(params: {
    title: string;
    description: string;
  }): PRD {
    const now = new Date().toISOString();
    return new PRD({
      id: `PRD-${Date.now()}`,
      title: params.title,
      description: params.description,
      createdAt: now,
      updatedAt: now
    });
  }

  /**
   * Factory method to reconstruct a PRD from persistence
   */
  public static fromPersistence(data: {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  }): PRD {
    return new PRD(data);
  }

  /**
   * Updates the PRD description and updates the updatedAt timestamp
   */
  public updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Updates the PRD title and updates the updatedAt timestamp
   */
  public updateTitle(title: string): void {
    this.title = title;
    this.updatedAt = new Date().toISOString();
  }
}