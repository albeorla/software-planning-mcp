import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Infrastructure service that wraps Git CLI commands.
 */
export class GitInfrastructureService {
  /**
   * Executes a git command
   */
  public async executeGitCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    try {
      return await execAsync(`git ${command}`);
    } catch (error) {
      // Capture the error output from the git command
      if (error instanceof Error && 'stdout' in error && 'stderr' in error) {
        return {
          stdout: (error as any).stdout,
          stderr: (error as any).stderr
        };
      }
      throw error;
    }
  }

  /**
   * Gets the current git status
   */
  public async getStatus(): Promise<string> {
    const { stdout } = await this.executeGitCommand('status');
    return stdout;
  }

  /**
   * Gets the current git status in porcelain format (machine-readable)
   */
  public async getStatusPorcelain(): Promise<string> {
    const { stdout } = await this.executeGitCommand('status --porcelain');
    return stdout;
  }

  /**
   * Gets the git diff
   */
  public async getDiff(): Promise<string> {
    const { stdout } = await this.executeGitCommand('diff');
    return stdout;
  }

  /**
   * Gets git diff for staged changes
   */
  public async getDiffStaged(): Promise<string> {
    const { stdout } = await this.executeGitCommand('diff --staged');
    return stdout;
  }

  /**
   * Gets recent commit history
   */
  public async getCommitHistory(count: number = 5): Promise<string> {
    const { stdout } = await this.executeGitCommand(`log -n ${count} --oneline`);
    return stdout;
  }

  /**
   * Stages files for commit
   */
  public async stageFiles(files: string[] = []): Promise<string> {
    if (files.length === 0) {
      const { stdout } = await this.executeGitCommand('add .');
      return stdout;
    }
    
    const { stdout } = await this.executeGitCommand(`add ${files.join(' ')}`);
    return stdout;
  }

  /**
   * Creates a commit with the specified message
   */
  public async commit(message: string): Promise<string> {
    // Escape quotes in the message
    const escapedMessage = message.replace(/"/g, '\\"');
    const { stdout } = await this.executeGitCommand(`commit -m "${escapedMessage}"`);
    return stdout;
  }

  /**
   * Creates a commit with the specified message, including all changes
   */
  public async commitAll(message: string): Promise<string> {
    // Escape quotes in the message
    const escapedMessage = message.replace(/"/g, '\\"');
    const { stdout } = await this.executeGitCommand(`commit -am "${escapedMessage}"`);
    return stdout;
  }

  /**
   * Gets the current branch name
   */
  public async getCurrentBranch(): Promise<string> {
    const { stdout } = await this.executeGitCommand('rev-parse --abbrev-ref HEAD');
    return stdout.trim();
  }

  /**
   * Checks if there are any uncommitted changes
   */
  public async hasUncommittedChanges(): Promise<boolean> {
    const status = await this.getStatusPorcelain();
    return status.trim().length > 0;
  }
}