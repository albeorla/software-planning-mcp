import { promises as fs } from "fs";
import * as path from "path";
import { TemplateService } from "./TemplateService.js";

/**
 * Application service that handles the management of documentation files.
 * This includes tasks like updating sprint files, tracking work summaries,
 * and maintaining dashboard metrics.
 */
export class DocumentationApplicationService {
  private readonly docsBasePath: string;
  private readonly templateService: TemplateService;

  constructor(templateService?: TemplateService) {
    // Store documentation in the .docs directory in the project root
    this.docsBasePath = path.join(process.cwd(), ".docs");
    this.templateService = templateService || new TemplateService();
  }

  /**
   * Initialize the documentation directory structure if it doesn't exist
   */
  public async initialize(): Promise<void> {
    // Create main docs directory
    await fs.mkdir(this.docsBasePath, { recursive: true });
    
    // Create subdirectories
    await fs.mkdir(path.join(this.docsBasePath, "planning"), { recursive: true });
    await fs.mkdir(path.join(this.docsBasePath, "planning/sprints"), { recursive: true });
    await fs.mkdir(path.join(this.docsBasePath, "reports"), { recursive: true });
  }

  /**
   * Updates the status of a task in a sprint document
   */
  public async updateSprintTaskStatus(todoId: string, status: "todo" | "in-progress" | "done" | "blocked"): Promise<void> {
    // In a real implementation, this would:
    // 1. Find the appropriate sprint file that contains the todoId
    // 2. Update the status marker for the task
    // 3. Save the file
    
    const sprintsDir = path.join(this.docsBasePath, "planning/sprints");
    try {
      const files = await fs.readdir(sprintsDir);
      for (const filename of files) {
        if (filename.endsWith(".md")) {
          const filePath = path.join(sprintsDir, filename);
          const content = await fs.readFile(filePath, "utf-8");
          
          // Simple regex pattern to find and replace task status
          // In a real implementation, this would be more sophisticated
          const pattern = new RegExp(`- \\[([ x])\\] (${todoId})`);
          
          if (pattern.test(content)) {
            let updatedContent: string;
            if (status === 'done') {
              updatedContent = content.replace(pattern, `- [x] $2`);
            } else {
              updatedContent = content.replace(pattern, `- [ ] $2`);
            }
            
            await fs.writeFile(filePath, updatedContent);
            break;
          }
        }
      }
    } catch (error) {
      // If directory doesn't exist yet, just return
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return;
      }
      throw error;
    }
  }

  /**
   * Appends a work summary to the appropriate report file
   */
  public async appendWorkSummary(date: Date, summaryPoints: string[]): Promise<void> {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const reportPath = path.join(this.docsBasePath, "reports", `${dateString}.md`);
    
    // Create or append to the report file
    try {
      // Check if file exists
      await fs.access(reportPath);
      
      // File exists, append to it
      const content = await fs.readFile(reportPath, "utf-8");
      const appendContent = "\n\n## Work Summary Addition\n" + 
        summaryPoints.map(point => `- ${point}`).join("\n");
      
      await fs.writeFile(reportPath, content + appendContent);
    } catch (error) {
      // File doesn't exist, create it
      const initialContent = `# Work Report for ${dateString}\n\n## Work Summary\n` + 
        summaryPoints.map(point => `- ${point}`).join("\n");
      
      await fs.writeFile(reportPath, initialContent);
    }
  }

  /**
   * Updates metrics in the dashboard file
   */
  public async updateDashboardMetrics(): Promise<void> {
    const dashboardPath = path.join(this.docsBasePath, "dashboard.md");
    
    try {
      // In a real implementation, this would:
      // 1. Read current metrics from sprint files
      // 2. Calculate new metrics (tasks completed, story points, etc.)
      // 3. Update the dashboard file
      
      // Basic implementation: Create a simple dashboard if it doesn't exist
      try {
        await fs.access(dashboardPath);
      } catch (error) {
        // File doesn't exist, create a basic template
        const template = `# Project Dashboard

## Sprint Progress
| Sprint | Completed | In Progress | Backlog | Total |
|--------|-----------|-------------|---------|-------|
| Current Sprint | 0 | 0 | 0 | 0 |

## Recent Activity
_Updated automatically by the system_

`;
        await fs.writeFile(dashboardPath, template);
      }
      
      // In a real implementation, we would now update the metrics
      // This would involve parsing sprint files, counting tasks by status, etc.
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a Product Requirements Document (PRD) and saves it to the docs directory
   */
  public async createPRD(title: string, description: string): Promise<{
    id: string;
    filePath: string;
  }> {
    // Create document directory if it doesn't exist
    const prdsDir = path.join(this.docsBasePath, "planning/prds");
    await fs.mkdir(prdsDir, { recursive: true });

    // Generate PRD content using the template service
    const { id, content } = await this.templateService.generatePRD(title, description);
    
    // Save the PRD to a file
    const fileName = `${id.toLowerCase()}.md`;
    const filePath = path.join(prdsDir, fileName);
    await fs.writeFile(filePath, content);
    
    return { id, filePath };
  }

  /**
   * Creates an Epic document and saves it to the docs directory
   */
  public async createEpic(title: string, description: string, prdIds: string[]): Promise<{
    id: string;
    filePath: string;
  }> {
    // Create directory if it doesn't exist
    const epicsDir = path.join(this.docsBasePath, "planning/epics");
    await fs.mkdir(epicsDir, { recursive: true });

    // Generate Epic content
    const { id, content } = await this.templateService.generateEpic(title, description, prdIds);
    
    // Save the Epic to a file
    const fileName = `${id.toLowerCase()}.md`;
    const filePath = path.join(epicsDir, fileName);
    await fs.writeFile(filePath, content);
    
    return { id, filePath };
  }

  /**
   * Creates a User Story document and saves it to the docs directory
   */
  public async createUserStory(
    title: string,
    userType: string,
    action: string,
    benefit: string,
    epicId: string
  ): Promise<{
    id: string;
    filePath: string;
  }> {
    // Create directory if it doesn't exist
    const storiesDir = path.join(this.docsBasePath, "planning/stories");
    await fs.mkdir(storiesDir, { recursive: true });

    // Generate User Story content
    const { id, content } = await this.templateService.generateUserStory(
      title, userType, action, benefit, epicId
    );
    
    // Save the User Story to a file
    const fileName = `${id.toLowerCase()}.md`;
    const filePath = path.join(storiesDir, fileName);
    await fs.writeFile(filePath, content);
    
    return { id, filePath };
  }

  /**
   * Creates a Task document and saves it to the docs directory
   */
  public async createTask(
    title: string,
    description: string,
    storyId: string,
    complexity: number
  ): Promise<{
    id: string;
    filePath: string;
  }> {
    // Create directory if it doesn't exist
    const tasksDir = path.join(this.docsBasePath, "planning/tasks");
    await fs.mkdir(tasksDir, { recursive: true });

    // Generate Task content
    const { id, content } = await this.templateService.generateTask(
      title, description, storyId, complexity
    );
    
    // Save the Task to a file
    const fileName = `${id.toLowerCase()}.md`;
    const filePath = path.join(tasksDir, fileName);
    await fs.writeFile(filePath, content);
    
    return { id, filePath };
  }
  
  /**
   * Creates a Spike document for research and exploration and saves it to the docs directory
   */
  public async createSpike(
    title: string,
    objective: string,
    questions: string[],
    timeBox: string,
    parentReference?: string,
    background?: string,
    researchApproach?: string,
    acceptanceCriteria?: string[],
    deliverables?: string[]
  ): Promise<{
    id: string;
    filePath: string;
  }> {
    // Create directory if it doesn't exist
    const spikesDir = path.join(this.docsBasePath, "planning/spikes");
    await fs.mkdir(spikesDir, { recursive: true });

    // Generate Spike content
    const { id, content } = await this.templateService.generateSpike(
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
    
    // Save the Spike to a file
    const fileName = `${id.toLowerCase()}.md`;
    const filePath = path.join(spikesDir, fileName);
    await fs.writeFile(filePath, content);
    
    return { id, filePath };
  }
}