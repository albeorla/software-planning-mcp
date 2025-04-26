/**
 * Value object representing status in the domain
 */
export class Status {
  private constructor(private readonly value: string) {
    if (!['planned', 'in-progress', 'completed', 'canceled'].includes(value.toLowerCase())) {
      throw new Error(`Invalid status value: ${value}`);
    }
  }
  
  public static readonly PLANNED = new Status('planned');
  public static readonly IN_PROGRESS = new Status('in-progress');
  public static readonly COMPLETED = new Status('completed');
  public static readonly CANCELED = new Status('canceled');
  
  public static fromString(value: string): Status {
    const normalizedValue = value.toLowerCase();
    if (normalizedValue === 'planned') return Status.PLANNED;
    if (normalizedValue === 'in-progress') return Status.IN_PROGRESS;
    if (normalizedValue === 'completed') return Status.COMPLETED;
    if (normalizedValue === 'canceled') return Status.CANCELED;
    throw new Error(`Invalid status value: ${value}`);
  }
  
  public equals(other: Status): boolean {
    return this.value === other.value;
  }
  
  public toString(): string {
    return this.value;
  }
  
  public get isActive(): boolean {
    return this.value === 'planned' || this.value === 'in-progress';
  }
  
  public get isCompleted(): boolean {
    return this.value === 'completed';
  }
  
  public get isCanceled(): boolean {
    return this.value === 'canceled';
  }
}