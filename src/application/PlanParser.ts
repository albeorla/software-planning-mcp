import { Todo } from "../domain/entities/Todo.js";

/**
 * Interface (Strategy pattern) that converts a free-form implementation plan
 * text into a list of {@link Todo} value objects.
 */
export interface PlanParser {
  parse(planText: string): Array<{
    title: string;
    description: string;
    complexity: number;
    codeExample?: string;
  }>;
}

/**
 * Baseline implementation that mimics the previous naive splitter logic.  Can
 * be replaced by a sophisticated markdown/LLM parser without affecting the
 * rest of the system.
 */
export class BasicPlanParser implements PlanParser {
  parse(plan: string) {
    return plan
      .split("\n\n")
      .filter((section) => section.trim().length > 0)
      .map((section) => {
        const lines = section.split("\n");

        const title = lines[0].replace(/^[0-9]+\.\s*/, "").trim();
        const complexityMatch = section.match(/Complexity:\s*([0-9]+)/);
        const complexity = complexityMatch ? parseInt(complexityMatch[1], 10) : 5;

        const codeExampleMatch = section.match(/```([\s\S]*?)```/);
        const codeExample = codeExampleMatch?.[1];

        const description = section
          .replace(/^[0-9]+\.\s*[^\n]*\n/, "") // remove first line (title)
          .replace(/Complexity:\s*[0-9]+/, "")
          .replace(/```[\s\S]*?```/, "")
          .trim();

        return {
          title,
          description,
          complexity,
          codeExample,
        };
      });
  }
}
