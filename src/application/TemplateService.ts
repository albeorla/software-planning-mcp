import {
  RequirementTemplateService,
  StoryTemplateService,
  TaskTemplateService,
  SprintTemplateService
} from './templates/services/index.js';

/**
 * Service responsible for generating structured content based on templates.
 * This service combines specialized template services for different document types.
 * In a production environment, this would integrate with an LLM API.
 */
export class TemplateService {
  private readonly requirementService: RequirementTemplateService;
  private readonly storyService: StoryTemplateService;
  private readonly taskService: TaskTemplateService;
  private readonly sprintService: SprintTemplateService;
  
  constructor() {
    this.requirementService = new RequirementTemplateService();
    this.storyService = new StoryTemplateService();
    this.taskService = new TaskTemplateService();
    this.sprintService = new SprintTemplateService();
  }
  
  // ---------- PRD and Epic Methods ----------
  
  /**
   * Generates a Product Requirements Document (PRD) from a title and description
   */
  public async generatePRD(title: string, description: string) {
    return this.requirementService.generatePRD(title, description);
  }
  
  /**
   * Generates an Epic based on PRD and requirements
   */
  public async generateEpic(title: string, description: string, prdIds: string[]) {
    return this.requirementService.generateEpic(title, description, prdIds);
  }
  
  // ---------- User Story Methods ----------
  
  /**
   * Generates a User Story based on Epic and requirements
   */
  public async generateUserStory(
    title: string, 
    userType: string,
    action: string,
    benefit: string,
    epicId: string
  ) {
    return this.storyService.generateUserStory(title, userType, action, benefit, epicId);
  }
  
  // ---------- Task and Spike Methods ----------
  
  /**
   * Generates an Implementation Task based on a User Story
   */
  public async generateTask(
    title: string,
    description: string,
    storyId: string,
    complexity: number
  ) {
    return this.taskService.generateTask(title, description, storyId, complexity);
  }
  
  /**
   * Generates a Spike document for research and exploration
   */
  public async generateSpike(
    title: string,
    objective: string,
    questions: string[],
    timeBox: string,
    parentReference?: string,
    background?: string,
    researchApproach?: string,
    acceptanceCriteria?: string[],
    deliverables?: string[]
  ) {
    return this.taskService.generateSpike(
      title, 
      objective, 
      questions, 
      timeBox, 
      parentReference,
      background,
      researchApproach,
      acceptanceCriteria,
      deliverables
    );
  }
  
  // ---------- Sprint and Work Log Methods ----------
  
  /**
   * Generates a Sprint plan based on available stories and tasks
   */
  public async generateSprint(
    sprintId: string,
    startDate: string,
    endDate: string,
    teamMembers: string[],
    availableTasks: { id: string; title: string; complexity: number }[]
  ) {
    return this.sprintService.generateSprint(
      sprintId, 
      startDate, 
      endDate, 
      teamMembers, 
      availableTasks
    );
  }
  
  /**
   * Generates a work log entry
   */
  public async generateWorkLog(
    date: string,
    tasksWorkedOn: { id: string; title: string; progress: string }[],
    detailedSummary: string,
    blockers: string[] = [],
    nextSteps: string[] = []
  ) {
    return this.sprintService.generateWorkLog(
      date,
      tasksWorkedOn,
      detailedSummary,
      blockers,
      nextSteps
    );
  }
}