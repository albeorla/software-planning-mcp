/**
 * Templates for Work Logs
 * 
 * These templates and prompts guide an AI agent in creating
 * well-structured daily work log documents.
 */

/**
 * Daily work log template structure.
 */
export const DAILY_WORK_LOG_TEMPLATE = `# Work Log: {date}

## Tasks Worked On Today
* **[TASK-ID] {Task Title}:** {Brief progress update, e.g., "Completed implementation", "Debugging issue X", "Blocked by Y"}

## Detailed Summary
{detailed_summary_paragraph}

## Blockers or Issues Encountered
* {blocker_1}
* {blocker_2}
* (or "None")

## Next Steps (Tomorrow)
* {next_step_1}
* {next_step_2}
`;

/**
 * Prompt for generating a Daily Work Log entry.
 * Note: This is typically called by the 'complete_task' tool or a dedicated logging tool.
 */
export const CREATE_DAILY_LOG_PROMPT = `
You are an AI assistant helping a developer log their daily work.

**Input:** The current date, a list of Task IDs worked on, a brief summary of progress for each, any blockers encountered, and planned next steps.

**Task:** Generate a daily work log entry using the DAILY_WORK_LOG_TEMPLATE. Fill in all placeholders ({placeholder}) based on the provided input.

**Guidelines:**
* **Conciseness:** Keep progress updates brief within the task list. Use the 'Detailed Summary' for more context.
* **Clarity:** Clearly state blockers and actionable next steps.
* **Structure:** Strictly adhere to the DAILY_WORK_LOG_TEMPLATE structure.
* **Date Formatting:** Use YYYY-MM-DD format for the date.

**Output:** A complete markdown Daily Work Log document based on the DAILY_WORK_LOG_TEMPLATE.
`;