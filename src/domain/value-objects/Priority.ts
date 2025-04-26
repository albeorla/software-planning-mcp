/**
 * Value object representing priority levels in the domain
 */
export class Priority {
  private constructor(private readonly value: string) {
    if (!['high', 'medium', 'low'].includes(value.toLowerCase())) {
      throw new Error(`Invalid priority value: ${value}`);
    }
  }
  
  public static readonly HIGH = new Priority('high');
  public static readonly MEDIUM = new Priority('medium');
  public static readonly LOW = new Priority('low');
  
  public static fromString(value: string): Priority {
    const normalizedValue = value.toLowerCase();
    if (normalizedValue === 'high') return Priority.HIGH;
    if (normalizedValue === 'medium') return Priority.MEDIUM;
    if (normalizedValue === 'low') return Priority.LOW;
    throw new Error(`Invalid priority value: ${value}`);
  }
  
  public equals(other: Priority): boolean {
    return this.value === other.value;
  }
  
  public toString(): string {
    return this.value;
  }
  
  public get isHigh(): boolean {
    return this.value === 'high';
  }
  
  public get isMedium(): boolean {
    return this.value === 'medium';
  }
  
  public get isLow(): boolean {
    return this.value === 'low';
  }
}