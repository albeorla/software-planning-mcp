import { BaseTemplateService } from './BaseTemplateService.js';
import { SPRINT_TEMPLATE, DAILY_WORK_LOG_TEMPLATE } from '../index.js';

/**
 * Service for generating sprint planning and work log documents
 */
export class SprintTemplateService extends BaseTemplateService {
  /**
   * Generates a Sprint plan based on available stories and tasks
   */
  public async generateSprint(
    sprintId: string,
    startDate: string,
    endDate: string,
    teamMembers: string[],
    availableTasks: { id: string; title: string; complexity: number }[]
  ): Promise<{
    id: string;
    content: string;
    sections: Record<string, string>;
  }> {
    // Mock LLM response
    const content = this.fillSprintTemplate(sprintId, startDate, endDate, teamMembers, availableTasks);
    
    // Parse sections
    const sections = this.parseSections(content);
    
    return {
      id: sprintId,
      content,
      sections
    };
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
  ): Promise<{
    content: string;
    sections: Record<string, string>;
  }> {
    // Mock LLM response
    const content = this.fillWorkLogTemplate(date, tasksWorkedOn, detailedSummary, blockers, nextSteps);
    
    // Parse sections
    const sections = this.parseSections(content);
    
    return {
      content,
      sections
    };
  }
  
  /**
   * Fills in the Sprint template with values
   */
  private fillSprintTemplate(
    sprintId: string,
    startDate: string, 
    endDate: string,
    teamMembers: string[],
    availableTasks: { id: string; title: string; complexity: number }[]
  ): string {
    // Calculate total complexity for capacity planning
    const totalComplexity = availableTasks.reduce((sum, task) => sum + task.complexity, 0);
    
    // Organize tasks by type (assuming tasks are named with conventions)
    const storiesAndTasks: Record<string, any[]> = {};
    
    // Simple mock organization of tasks by story ID (assuming task IDs contain story IDs)
    availableTasks.forEach(task => {
      const storyMatch = task.id.match(/STORY-(\w+)/);
      const storyId = storyMatch ? `STORY-${storyMatch[1]}` : 'Unassigned';
      
      if (!storiesAndTasks[storyId]) {
        storiesAndTasks[storyId] = [];
      }
      
      storiesAndTasks[storyId].push(task);
    });
    
    // Format the committed stories and tasks section
    let tasksSection = '';
    
    for (const [storyId, tasks] of Object.entries(storiesAndTasks)) {
      tasksSection += `* **[${storyId}] Story Title** (Complexity: 5)\n`;
      
      tasks.forEach(task => {
        tasksSection += `    * [ ] [${task.id}] ${task.title} (Complexity: ${task.complexity})\n`;
      });
    }
    
    return SPRINT_TEMPLATE
      .replace('{sprint_id}', sprintId)
      .replace('{start_date}', startDate)
      .replace('{end_date}', endDate)
      .replace('{sprint_goal}', 'Complete key features and improve system reliability')
      .replace('{team_members_list}', teamMembers.join(', '))
      .replace('{capacity_points}', (totalComplexity * 1.2).toFixed(0)) // Simple capacity calculation
      .replace('* **[STORY-AA] {Story A Title}** (Complexity: {points})\n    * [ ] [TASK-101] {Task 1 Title} (Complexity: {points})\n    * [ ] [TASK-102] {Task 2 Title} (Complexity: {points})\n* **[STORY-BB] {Story B Title}** (Complexity: {points})\n    * [ ] [TASK-201] {Task 3 Title} (Complexity: {points})', tasksSection.trim())
      .replace('{total_committed_points}', totalComplexity.toString())
      .replace('{risks_list}', '* Integration with third-party API\n* Team member scheduled PTO')
      .replace('{dependencies_list}', '* Database schema update must be completed first\n* Design assets delivery from external team')
      .replace('{success_metrics_list}', '* All high-priority stories completed\n* No regression bugs\n* Performance metrics within established thresholds');
  }
  
  /**
   * Fills in the Work Log template with values
   */
  private fillWorkLogTemplate(
    date: string,
    tasksWorkedOn: { id: string; title: string; progress: string }[],
    detailedSummary: string,
    blockers: string[] = [],
    nextSteps: string[] = []
  ): string {
    // Format tasks worked on section
    const tasksSection = tasksWorkedOn
      .map(task => `* **[${task.id}] ${task.title}:** ${task.progress}`)
      .join('\n');
    
    // Format blockers section
    const blockersSection = blockers.length > 0
      ? blockers.map(blocker => `* ${blocker}`).join('\n')
      : '* None';
    
    // Format next steps section
    const nextStepsSection = nextSteps.length > 0
      ? nextSteps.map(step => `* ${step}`).join('\n')
      : '* Continue implementation\n* Address feedback';
    
    return DAILY_WORK_LOG_TEMPLATE
      .replace('{date}', date)
      .replace('* **[TASK-ID] {Task Title}:** {Brief progress update, e.g., "Completed implementation", "Debugging issue X", "Blocked by Y"}', tasksSection)
      .replace('{detailed_summary_paragraph}', detailedSummary)
      .replace('* {blocker_1}\n* {blocker_2}\n* (or "None")', blockersSection)
      .replace('* {next_step_1}\n* {next_step_2}', nextStepsSection);
  }
}