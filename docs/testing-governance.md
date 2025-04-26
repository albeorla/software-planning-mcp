# Testing the Governance System with Claude

This document provides instructions for testing the governance system to ensure that Claude can properly interact with it.

## Prerequisites

1. Ensure that the project is built:
   ```bash
   pnpm run build
   ```

2. Run the governance server in a separate terminal:
   ```bash
   pnpm run governance
   ```

## Testing with Claude Code

To test the governance system with Claude, you need to launch Claude Code with the MCP flag pointing to the running governance server:

```bash
claude-code --mcp http://localhost:6277
```

Once Claude is connected to the governance server, it will have access to all the governance tools defined in the system.

## Expected Workflow

Claude should follow this workflow:

1. **Start Planning Session**:
   ```
   Claude should use: mcp__governance__start_planning_session
   ```

2. **Record Planning Thoughts**:
   ```
   Claude should use: mcp__governance__add_planning_thought
   ```

3. **Create Documentation**:
   ```
   Claude should use: mcp__governance__create_prd
   Claude should use: mcp__governance__create_epic
   Claude should use: mcp__governance__create_story
   ```

4. **Create Tasks**:
   ```
   Claude should use: mcp__governance__create_task
   ```

5. **Start Implementation**:
   ```
   Claude should use: mcp__governance__start_implementation
   ```

6. **Track File Operations**:
   ```
   Claude should use: mcp__governance__track_file_read before reading files
   Claude should use: mcp__governance__track_file_edit before editing files
   ```

7. **Complete Implementation**:
   ```
   Claude should use: mcp__governance__complete_implementation
   ```

8. **Commit Changes**:
   ```
   Claude should use: mcp__governance__commit_changes
   ```

## Expected Enforcement

The governance server should enforce workflow rules:

1. Claude should not be able to skip phases (e.g., directly go from PLANNING to REVIEW).
2. Claude should not be able to use tools from later phases (e.g., using `mcp__governance__commit_changes` in PLANNING phase).
3. Claude should be required to track file operations during implementation.

## Manually Testing Tools

You can manually test individual tools by prompting Claude to use them:

```
"Let's start planning a new feature for value objects."
(Claude should use mcp__governance__start_planning_session)

"I think we should start by implementing Priority and Status value objects."
(Claude should use mcp__governance__add_planning_thought)

"Create a PRD document for this feature."
(Claude should use mcp__governance__create_prd)

"Break this down into specific tasks."
(Claude should use mcp__governance__create_task)
```

## Known Issues

- The governance server can only handle one session at a time.
- If the workflow state gets stuck, restart the governance server.

## Next Steps

After testing the basic workflow, consider testing more advanced scenarios:

1. Creating multiple related tasks
2. Implementing tasks that involve multiple files
3. Testing that enforcement prevents out-of-sequence operations