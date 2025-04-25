import { promises as fs } from "fs";
import path from "path";

/**
 * Application service that handles the management of documentation files.
 * This includes tasks like updating sprint files, tracking work summaries,
 * and maintaining dashboard metrics.
 */
export class DocumentationApplicationService {
  private readonly docsBasePath: string;

  constructor() {
    // Store documentation in the .docs directory in the project root
    this.docsBasePath = path.join(process.cwd(), ".docs");
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
}