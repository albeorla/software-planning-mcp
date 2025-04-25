import { promises as fs, readFileSync } from "fs";
import path from "path";
import os from "os";

import { ThinkingProcess } from "../../domain/entities/ThinkingProcess.js";
import { ThinkingProcessRepository } from "../../domain/repositories/ThinkingProcessRepository.js";
import { Thought } from "../../domain/entities/Thought.js";

/**
 * Simple JSON-file–backed repository for {@link ThinkingProcess} aggregates.
 *
 * It mirrors the behaviour of {@link JsonFileStorage} but keeps thinking
 * history in a dedicated file (`.docs/thinking.json`) so that large histories
 * do not bloat the primary `data.json` that stores core planning artefacts.
 */
export class JsonFileThinkingProcessRepository implements ThinkingProcessRepository {
  private readonly storageFile: string;

  private _data: Record<
    string,
    {
      id: string;
      goalId: string | null;
      updatedAt: string;
      thoughts: Array<{ id: string; content: string; createdAt: string }>;
    }
  > = {};

  constructor() {
    const dirInProject = path.join(process.cwd(), ".docs");
    const isAtHomeDir = process.cwd() === os.homedir();
    const dir = isAtHomeDir ? path.join(os.homedir(), ".software-planning-tool") : dirInProject;

    this.storageFile = path.join(dir, "thinking.json");

    // Perform the initial sync load so that repository can be used
    // immediately without an explicit `initialise` call.
    // This is a blocking operation but happens only once on startup.
    try {
      const raw = readFileSync(this.storageFile, "utf8");
      this._data = JSON.parse(raw);
    } catch {
      // File does not exist – will be created on first save
    }
  }

  // ------------------------------------------------------------------
  // ThinkingProcessRepository implementation
  // ------------------------------------------------------------------

  public async save(process: ThinkingProcess): Promise<void> {
    const key = process.goalId ?? process.id;
    this._data[key] = JsonFileThinkingProcessRepository.serializeProcess(process);
    await this.flush();
  }

  public async findByGoalId(goalId: string): Promise<ThinkingProcess | null> {
    const raw = this._data[goalId];
    return raw ? JsonFileThinkingProcessRepository.deserializeProcess(raw) : null;
  }

  // ------------------------------------------------------------------
  // Internals
  // ------------------------------------------------------------------

  private async flush(): Promise<void> {
    const dir = path.dirname(this.storageFile);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.storageFile, JSON.stringify(this._data, null, 2));
  }

  private static serializeProcess(process: ThinkingProcess) {
    return {
      id: process.id,
      goalId: process.goalId,
      updatedAt: process.updatedAt,
      thoughts: process.history.map((t) => ({
        id: t.id,
        content: t.content,
        createdAt: t.createdAt,
      })),
    };
  }

  private static deserializeProcess(data: {
    id: string;
    goalId: string | null;
    updatedAt: string;
    thoughts: Array<{ id: string; content: string; createdAt: string }>;
  }): ThinkingProcess {
    return ThinkingProcess.fromPersistence(data);
  }
}
