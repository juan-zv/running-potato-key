# Data Flow Diagram

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         DASHBOARD PAGE                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    useGroupData(groupId)                  │ │
│  │                                                           │ │
│  │  Fetches:                                                 │ │
│  │  ├─ Group Info                                            │ │
│  │  ├─ All Users (with group_id filter)                      │ │
│  │  ├─ All Images (with group_id filter)                     │ │
│  │  ├─ All Tasks (with group_id filter)                      │ │
│  │  └─ Assigned Tasks (junction table)                       │ │
│  │                                                           │ │
│  │  Enriches:                                                │ │
│  │  ├─ Images + Creator Info                                 │ │
│  │  └─ Tasks + Assignees Array                               │ │
│  │                                                           │ │
│  │  Returns:                                                 │ │
│  │  {                                                        │ │
│  │    group,                                                 │ │
│  │    users,                                                 │ │
│  │    images: ImageWithCreator[],                            │ │
│  │    tasks: TaskWithAssignees[],                            │ │
│  │    assignedTasks,                                         │ │
│  │    fullData: GroupDataStructure,                          │ │
│  │    loading, error, refetch, updateTask                    │ │
│  │  }                                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Data Distribution:                                             │
│  ├─ <AISummaryCard tasks={tasks} calendarEvents={events} />    │
│  ├─ <CalendarEventsCard onEventsLoaded={callback} />           │
│  ├─ <TasksCard tasks={tasks} onTaskUpdate={updateTask} />      │
│  ├─ <ContactsCard users={users} />                             │
│  └─ <GalleryCard images={images} onImageUploaded={refetch} />  │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema & Relationships

```
┌─────────────┐
│   groups    │
│─────────────│
│ id          │◄─────────┐
│ building    │          │
│ apt_num     │          │
│ created_at  │          │
└─────────────┘          │
                         │ group_id (FK)
┌─────────────┐          │
│    users    │          │
│─────────────│          │
│ id          │──────────┤
│ name        │          │
│ email       │          │
│ group_id    │──────────┘
│ bio         │
│ allergies   │
│ pets        │
│ ...         │
└─────────────┘
       │
       │ created_by (FK)
       │
       ▼
┌─────────────┐          ┌───────────────┐
│   images    │          │     tasks     │
│─────────────│          │───────────────│
│ id          │          │ id            │
│ url         │          │ name          │
│ title       │          │ description   │
│ category    │          │ completed     │
│ group_id    │◄─────────│ group_id      │
│ created_by  │          │ due_date      │
│ created_at  │          │ assigned_to   │
└─────────────┘          └───────────────┘
                                │
                                │
                         ┌──────┴──────┐
                         │             │
                         ▼             ▼
                    ┌─────────────────────┐
                    │  assigned_tasks     │
                    │  (Junction Table)   │
                    │─────────────────────│
                    │ task_id    (FK)     │
                    │ user_id    (FK)     │
                    │ assigned_at         │
                    └─────────────────────┘
```

## Data Enrichment Process

```
Step 1: Fetch Raw Data
─────────────────────────────────────────────────────────────
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Group   │  │  Users   │  │  Images  │  │  Tasks   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
                                                │
                                                ▼
                                      ┌────────────────┐
                                      │ AssignedTasks  │
                                      └────────────────┘

Step 2: Create Lookup Maps (O(1) access)
─────────────────────────────────────────────────────────────
userMap = Map {
  1 => { id: 1, name: "Alice", ... },
  2 => { id: 2, name: "Bob", ... },
  ...
}

taskAssignmentsMap = Map {
  1 => [1, 3],        // Task 1 assigned to users 1 and 3
  2 => [2],           // Task 2 assigned to user 2
  ...
}

Step 3: Enrich Images with Creator
─────────────────────────────────────────────────────────────
images.forEach(image => {
  image.creator = userMap.get(image.created_by)
})

Result:
[
  {
    id: 1,
    url: "...",
    title: "Living Room",
    created_by: 1,
    creator: { id: 1, name: "Alice", ... }  ← Added
  },
  ...
]

Step 4: Enrich Tasks with Assignees
─────────────────────────────────────────────────────────────
tasks.forEach(task => {
  const userIds = taskAssignmentsMap.get(task.id) || []
  task.assignees = userIds.map(id => userMap.get(id))
  task.assigned_task_ids = userIds
})

Result:
[
  {
    id: 1,
    name: "Clean Kitchen",
    completed: false,
    assignees: [                              ← Added
      { id: 1, name: "Alice", ... },
      { id: 3, name: "Charlie", ... }
    ],
    assigned_task_ids: [1, 3]                 ← Added
  },
  ...
]

Step 5: Return Structured Data
─────────────────────────────────────────────────────────────
{
  group: { ... },
  users: [ ... ],
  images: [ ...with creator... ],
  tasks: [ ...with assignees... ],
  assignedTasks: [ ... ],
  fullData: { entire structure }
}
```

## Component Data Flow

```
                    ┌─────────────────┐
                    │  DashboardPage  │
                    └────────┬────────┘
                             │
                    useGroupData(groupId)
                             │
              ┌──────────────┴───────────────┐
              │                              │
              ▼                              ▼
    ┌──────────────────┐         ┌──────────────────┐
    │  Supabase API    │         │  localStorage    │
    │  (Database)      │         │  (Cache)         │
    └──────────────────┘         └──────────────────┘
              │                              │
              │ Fetch all data               │ Check TTL
              │ with relationships           │ Load if valid
              ▼                              │
    ┌──────────────────────────────────────┐│
    │   Relationship Enrichment            ││
    │   - Map users by ID                  ││
    │   - Map assignments by task_id       ││
    │   - Enrich images with creators      ││
    │   - Enrich tasks with assignees      ││
    └──────────────────┬───────────────────┘│
                       │                     │
                       ▼                     ▼
            ┌──────────────────────────────────┐
            │      Structured JSON Data        │
            │                                  │
            │  {                               │
            │    group: {...},                 │
            │    users: [{...}, {...}],        │
            │    images: [{                    │
            │      ...image,                   │
            │      creator: {...}              │
            │    }],                           │
            │    tasks: [{                     │
            │      ...task,                    │
            │      assignees: [{...}, {...}]   │
            │    }],                           │
            │    assignedTasks: [...]          │
            │  }                               │
            └─────────────┬────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
    Save to Cache              Distribute to Components
            │                           │
            │                           ├─► AISummaryCard
            │                           ├─► TasksCard
            │                           ├─► ContactsCard
            │                           ├─► GalleryCard
            │                           └─► CalendarEventsCard
            │
            ▼
    Auto-refresh every 5 minutes
```

## Cache Strategy

```
Initial Load:
─────────────────────────────────────────────────────────────
1. Check localStorage for cached data
2. Check cache timestamp (TTL = 5 minutes)
3. If cache valid:
   ├─► Load from cache (instant)
   └─► Fetch fresh data in background
4. If cache invalid or missing:
   └─► Fetch from API (show loading)
5. Save to cache with timestamp

Subsequent Loads:
─────────────────────────────────────────────────────────────
1. Load from cache immediately (no loading state)
2. Fetch fresh data in background
3. Update UI when fresh data arrives
4. Save to cache

Auto-refresh:
─────────────────────────────────────────────────────────────
Every 5 minutes:
1. Fetch fresh data
2. Update state
3. Update cache
4. Re-render components

Manual Refresh:
─────────────────────────────────────────────────────────────
refetch() called:
1. Clear loading state
2. Fetch fresh data
3. Update state
4. Update cache
```

## Optimistic Updates

```
User Action: Toggle Task Completion
─────────────────────────────────────────────────────────────
1. User clicks checkbox
2. updateTask(taskId, { completed: true })
3. ──► UI updates immediately (optimistic)
4. ──► API call to Supabase
5. ──► Cache updated
6. If error:
   └─► Revert UI to previous state
   └─► Show error toast
```

## Query Utilities Usage

```
                    ┌─────────────────┐
                    │    fullData     │
                    └────────┬────────┘
                             │
                   Pass to Query Utils
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Filtering   │   │   Grouping   │   │  Statistics  │
│──────────────│   │──────────────│   │──────────────│
│ getTasksByU  │   │ groupTasksBy │   │ getUserTask  │
│ getTasksDue  │   │ Assignee     │   │ Stats        │
│ getOverdue   │   │ groupImages  │   │ getGroupSta  │
│ ...          │   │ ByCategory   │   │ ts           │
└──────────────┘   │ ...          │   │ generateRep  │
                   └──────────────┘   │ ort          │
                                      └──────────────┘
```

## Benefits Summary

```
┌────────────────────────────────────────────────────────┐
│                    BEFORE                              │
├────────────────────────────────────────────────────────┤
│ • 5+ API calls per component mount                     │
│ • No relationship data                                 │
│ • Multiple loading states                              │
│ • No caching coordination                              │
│ • N+1 query problems                                   │
│ • Duplicate fetches across components                  │
└────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                     AFTER                              │
├────────────────────────────────────────────────────────┤
│ • 1 API call for entire dashboard                      │
│ • All relationships pre-loaded                         │
│ • Single loading state                                 │
│ • Centralized caching (5-min TTL)                      │
│ • O(1) relationship lookups                            │
│ • Data shared across all components                    │
│ • Complete JSON structure available                    │
│ • Auto-refresh every 5 minutes                         │
│ • Optimistic updates for instant UI                    │
└────────────────────────────────────────────────────────┘
```

---

**Last Updated**: January 2025  
**Architecture Version**: 2.0
