# Software Planning Tool Workflow

## Workflow Phases

```mermaid
flowchart TD
    IDLE[IDLE] --> |mcp__governance__start_planning_session| PLANNING
    
    subgraph PLANNING ["Planning Phase"]
        P1[Record thoughts\nusing add_planning_thought] --> P2[Create PRD]
        P2 --> P3[Create Epic]
        P3 --> P4[Create User Story]
        P4 --> P5[Create Task]
        P5 --> P6[Create Subtask]
        P5 -.-> P7[Create Spike for research]
        P4 --> P8[Create Sprint]
    end
    
    PLANNING --> |mcp__governance__start_implementation\nSelects a task to implement| IMPLEMENTATION
    
    subgraph IMPLEMENTATION ["Implementation Phase"]
        I1[Read files\nwith track_file_read\nand View tool] --> I2[Edit files\nwith track_file_edit\nand Edit tool]
        I2 --> I3[Update task status\nwith update_task_status]
        I3 --> I4[Log daily work\nwith log_daily_work]
        I4 --> I5[Complete implementation\nwith complete_implementation]
    end
    
    IMPLEMENTATION --> |mcp__governance__complete_implementation| REVIEW
    
    subgraph REVIEW ["Review and Commit Phase"]
        R1[Start code review\nwith start_code_review] --> R2[Create branches\nwith create_branch]
        R2 --> R3[Commit changes\nwith commit_changes]
        R3 --> R4[Create pull request\nwith create_pull_request]
    end
    
    REVIEW --> |mcp__governance__commit_changes| COMPLETED
    
    subgraph COMPLETED ["Completed Phase"]
        C1[Update sprint status\nwith update_sprint_status]
    end
    
    COMPLETED --> |Reset workflow state| IDLE
```

## Workflow Description

1. **Planning Phase**: This is where the planning process begins, with activities such as recording thoughts, creating PRDs, epics, user stories, tasks, subtasks, spikes, and sprints.

2. **Implementation Phase**: In this phase, developers implement the planned tasks by reading and editing files, updating task status, logging daily work, and eventually completing the implementation.

3. **Review and Commit Phase**: Once implementation is complete, the code undergoes review, branches are created, changes are committed, and pull requests are submitted.

4. **Completed Phase**: The final phase where sprint status is updated, and the workflow can reset to start a new cycle.

The transitions between phases are governed by specific governance tool calls that enforce the proper workflow state transitions, ensuring a structured and consistent development process.