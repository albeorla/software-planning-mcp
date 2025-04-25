import { promises as fs } from "fs";
import path from "path";
import os from "os";

/**
 * A specialized JSON file storage for roadmap-related entities
 * Similar to JsonFileStorage but without the Goal and Todo dependencies
 */
export class RoadmapJsonFileStorage {
  private readonly storageFile: string;
  private _data: Record<string, any[]> = {};

  /**
   * Creates a new RoadmapJsonFileStorage
   * @param filePath The file path for storage
   */
  constructor(filePath: string) {
    // If a full path is provided, use it
    if (path.isAbsolute(filePath)) {
      this.storageFile = filePath;
    } else {
      // Otherwise construct a path in the .docs directory
      const dir = path.join(process.cwd(), ".docs");
      const isAtHomeDir = process.cwd() === os.homedir();
      const storageDir = isAtHomeDir 
        ? path.join(os.homedir(), ".software-planning-tool") 
        : dir;
      this.storageFile = path.join(storageDir, filePath);
    }
  }

  /**
   * Initializes the storage, creating directories if needed
   */
  private async initialize(): Promise<void> {
    const dir = path.dirname(this.storageFile);
    await fs.mkdir(dir, { recursive: true });
    
    try {
      const raw = await fs.readFile(this.storageFile, "utf8");
      this._data = JSON.parse(raw);
    } catch {
      // File doesn't exist yet, initialize with empty data
      this._data = {};
      await this.flush();
    }
  }

  /**
   * Flushes the data to disk
   */
  private async flush(): Promise<void> {
    await fs.writeFile(this.storageFile, JSON.stringify(this._data, null, 2));
  }

  /**
   * Reads data from the key
   * @param key The storage key
   * @returns The data or null if not found
   */
  public async read<T>(key: string): Promise<T[] | null> {
    await this.initialize();
    return this._data[key] as T[] || null;
  }

  /**
   * Writes data to the key
   * @param key The storage key
   * @param data The data to write
   */
  public async write<T>(key: string, data: T[]): Promise<void> {
    await this.initialize();
    this._data[key] = data;
    await this.flush();
  }
}