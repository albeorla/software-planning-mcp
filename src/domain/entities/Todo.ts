/**
 * Domain Entity representing a concrete, actionable task that must be
 * executed in order to fulfil a {@link Goal}.  It is persisted as part of an
 * {@link ImplementationPlan} but modelled independently so that eventual
 * behaviour (e.g. `markComplete`) can live close to the data it acts upon.
 */
export class Todo {
  public readonly id: string;
  public title: string;
  public description: string;
  public complexity: number;
  public codeExample?: string;
  public isComplete: boolean;
  public readonly createdAt: string;
  public updatedAt: string;

  private constructor(params: {
    id: string;
    title: string;
    description: string;
    complexity: number;
    codeExample?: string;
    isComplete: boolean;
    createdAt: string;
    updatedAt: string;
  }) {
    this.id = params.id;
    this.title = params.title;
    this.description = params.description;
    this.complexity = params.complexity;
    this.codeExample = params.codeExample;
    this.isComplete = params.isComplete;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  /** Factory method to generate a new *incomplete* `Todo`. */
  public static create(params: {
    title: string;
    description: string;
    complexity: number;
    codeExample?: string;
  }): Todo {
    const now = new Date().toISOString();
    return new Todo({
      id: Date.now().toString(),
      title: params.title,
      description: params.description,
      complexity: params.complexity,
      codeExample: params.codeExample,
      isComplete: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Reconstitute todo from persistence layer. */
  public static fromPersistence(params: {
    id: string;
    title: string;
    description: string;
    complexity: number;
    codeExample?: string;
    isComplete: boolean;
    createdAt: string;
    updatedAt: string;
  }): Todo {
    return new Todo(params);
  }

  /** Mark the todo as complete and update modification timestamp. */
  public markComplete(): void {
    this.isComplete = true;
    this.updatedAt = new Date().toISOString();
  }

  /** Mark the todo as incomplete and update modification timestamp. */
  public markIncomplete(): void {
    this.isComplete = false;
    this.updatedAt = new Date().toISOString();
  }
}
