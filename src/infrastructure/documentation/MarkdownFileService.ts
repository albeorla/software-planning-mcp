import { promises as fs } from "fs";
import path from "path";

/**
 * Infrastructure service that provides operations for reading and 
 * writing markdown files for documentation purposes.
 */
export class MarkdownFileService {
  constructor(private readonly baseDir: string) {}

  /**
   * Initializes the documentation directory structure
   */
  public async initializeDirectories(): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
    await fs.mkdir(path.join(this.baseDir, "planning"), { recursive: true });
    await fs.mkdir(path.join(this.baseDir, "planning/sprints"), { recursive: true });
    await fs.mkdir(path.join(this.baseDir, "reports"), { recursive: true });
  }
  
  /**
   * Reads a markdown file
   */
  public async readMarkdownFile(relativePath: string): Promise<string> {
    const filePath = path.join(this.baseDir, relativePath);
    try {
      return await fs.readFile(filePath, "utf-8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`File not found: ${relativePath}`);
      }
      throw error;
    }
  }
  
  /**
   * Writes content to a markdown file
   */
  public async writeMarkdownFile(relativePath: string, content: string): Promise<void> {
    const filePath = path.join(this.baseDir, relativePath);
    const dirPath = path.dirname(filePath);
    
    // Ensure directory exists
    await fs.mkdir(dirPath, { recursive: true });
    
    // Write file
    await fs.writeFile(filePath, content);
  }
  
  /**
   * Updates a section in a markdown file between markers
   */
  public async updateSection(relativePath: string, sectionName: string, newContent: string, 
                             startMarker: string = `<!-- BEGIN ${sectionName} -->`, 
                             endMarker: string = `<!-- END ${sectionName} -->`): Promise<void> {
    try {
      // Read existing file
      const content = await this.readMarkdownFile(relativePath);
      
      // Find the section
      const startIndex = content.indexOf(startMarker);
      const endIndex = content.indexOf(endMarker);
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error(`Section markers not found for ${sectionName} in ${relativePath}`);
      }
      
      // Replace the section content
      const newFileContent = 
        content.substring(0, startIndex + startMarker.length) + 
        "\n" + newContent + "\n" + 
        content.substring(endIndex);
      
      // Write updated content
      await this.writeMarkdownFile(relativePath, newFileContent);
    } catch (error) {
      if ((error as Error).message.includes('File not found')) {
        // Create new file with section
        const newFileContent = `# ${path.basename(relativePath, '.md')}\n\n` +
                               `${startMarker}\n${newContent}\n${endMarker}`;
        await this.writeMarkdownFile(relativePath, newFileContent);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Lists markdown files in a directory
   */
  public async listMarkdownFiles(relativeDirPath: string): Promise<string[]> {
    const dirPath = path.join(this.baseDir, relativeDirPath);
    try {
      const files = await fs.readdir(dirPath);
      return files.filter(file => file.endsWith('.md'));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }
  
  /**
   * Searches for a pattern in markdown files within a directory
   */
  public async findInMarkdownFiles(relativeDirPath: string, pattern: RegExp): Promise<{
    filePath: string;
    matches: string[];
  }[]> {
    const files = await this.listMarkdownFiles(relativeDirPath);
    const results = [];
    
    for (const file of files) {
      const content = await this.readMarkdownFile(path.join(relativeDirPath, file));
      const matches = content.match(new RegExp(pattern, 'g'));
      
      if (matches && matches.length > 0) {
        results.push({
          filePath: path.join(relativeDirPath, file),
          matches
        });
      }
    }
    
    return results;
  }
}