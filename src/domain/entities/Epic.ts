/**
 * Domain Entity representing an Epic, which is a large body of work
 * that can be broken down into specific User Stories.
 */
export class Epic {
  /** Immutable unique identifier */
  public readonly id: string;
  
  /** Title of the Epic */
  public title: string;
  
  /** Detailed description of the Epic */
  public description: string;
  
  /** IDs of related PRDs */
  public prdIds: string[];
  
  /** ISO-8601 timestamp of when the Epic was created */
  public readonly createdAt: string;
  
  /** ISO-8601 timestamp of when the Epic was last updated */
  public updatedAt: string;

  private constructor(params: {
    id: string;
    title: string;
    description: string;
    prdIds: string[];
    createdAt: string;
    updatedAt: string;
  }) {
    this.id = params.id;
    this.title = params.title;
    this.description = params.description;
    this.prdIds = params.prdIds;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  /**
   * Factory method to create a new Epic
   */
  public static create(params: {
    title: string;
    description: string;
    prdIds: string[];
  }): Epic {
    const now = new Date().toISOString();
    return new Epic({
      id: `EPIC-${Date.now()}`,
      title: params.title,
      description: params.description,
      prdIds: params.prdIds,
      createdAt: now,
      updatedAt: now
    });
  }

  /**
   * Factory method to reconstruct an Epic from persistence
   */
  public static fromPersistence(data: {
    id: string;
    title: string;
    description: string;
    prdIds: string[];
    createdAt: string;
    updatedAt: string;
  }): Epic {
    return new Epic(data);
  }

  /**
   * Updates the Epic description and updates the updatedAt timestamp
   */
  public updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Updates the Epic title and updates the updatedAt timestamp
   */
  public updateTitle(title: string): void {
    this.title = title;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Adds a PRD to the Epic's related PRDs
   */
  public addPRD(prdId: string): void {
    if (!this.prdIds.includes(prdId)) {
      this.prdIds.push(prdId);
      this.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Removes a PRD from the Epic's related PRDs
   */
  public removePRD(prdId: string): void {
    const index = this.prdIds.indexOf(prdId);
    if (index !== -1) {
      this.prdIds.splice(index, 1);
      this.updatedAt = new Date().toISOString();
    }
  }
}