/**
 * Value object representing category in the domain
 */
export class Category {
  private constructor(private readonly value: string) {
    if (!['feature', 'enhancement', 'bug', 'architecture', 'tech-debt', 'research', 'documentation', 'other'].includes(value.toLowerCase())) {
      throw new Error(`Invalid category value: ${value}`);
    }
  }
  
  public static readonly FEATURE = new Category('feature');
  public static readonly ENHANCEMENT = new Category('enhancement');
  public static readonly BUG = new Category('bug');
  public static readonly ARCHITECTURE = new Category('architecture');
  public static readonly TECH_DEBT = new Category('tech-debt');
  public static readonly RESEARCH = new Category('research');
  public static readonly DOCUMENTATION = new Category('documentation');
  public static readonly OTHER = new Category('other');
  
  public static fromString(value: string): Category {
    const normalizedValue = value.toLowerCase();
    if (normalizedValue === 'feature') return Category.FEATURE;
    if (normalizedValue === 'enhancement') return Category.ENHANCEMENT;
    if (normalizedValue === 'bug') return Category.BUG;
    if (normalizedValue === 'architecture') return Category.ARCHITECTURE;
    if (normalizedValue === 'tech-debt') return Category.TECH_DEBT;
    if (normalizedValue === 'research') return Category.RESEARCH;
    if (normalizedValue === 'documentation') return Category.DOCUMENTATION;
    if (normalizedValue === 'other') return Category.OTHER;
    throw new Error(`Invalid category value: ${value}`);
  }
  
  public equals(other: Category): boolean {
    return this.value === other.value;
  }
  
  public toString(): string {
    return this.value;
  }
  
  public get isFeature(): boolean {
    return this.value === 'feature';
  }
  
  public get isEnhancement(): boolean {
    return this.value === 'enhancement';
  }
  
  public get isBug(): boolean {
    return this.value === 'bug';
  }
  
  public get isArchitecture(): boolean {
    return this.value === 'architecture';
  }
  
  public get isTechDebt(): boolean {
    return this.value === 'tech-debt';
  }
  
  public get isResearch(): boolean {
    return this.value === 'research';
  }
  
  public get isDocumentation(): boolean {
    return this.value === 'documentation';
  }
}