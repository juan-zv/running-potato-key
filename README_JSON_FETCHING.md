# 🎯 JSON Data Fetching Implementation - Complete Guide

## 📋 Quick Reference

Your dashboard now fetches **all data and relationships in a single, structured JSON format** that mirrors your database schema.

### One-Line Summary
```typescript
const { group, users, images, tasks, assignedTasks, fullData } = useGroupData(groupId)
```

## 🗂️ Documentation Files

| File | Purpose |
|------|---------|
| `DATA_FETCHING_SUMMARY.md` | Quick start guide with examples |
| `DATA_STRUCTURE.md` | Complete data structure documentation |
| `DATA_FLOW_DIAGRAM.md` | Visual architecture and flow diagrams |
| `USAGE_EXAMPLES.tsx` | 9 real component examples |
| `src/utils/dataQueries.ts` | 20+ query utility functions |

## 🔑 Key Changes Made

### 1. Enhanced `useGroupData` Hook
**File**: `src/hooks/useGroupData.ts`

**What Changed**:
- Now fetches `assigned_tasks` junction table
- Creates `Map` structures for O(1) lookups
- Enriches images with creator information
- Enriches tasks with assignee arrays
- Returns `fullData` for complete JSON access

**New Return Structure**:
```typescript
{
  group: Group | null,
  users: User[],
  images: ImageWithCreator[],      // ← Now includes creator
  tasks: TaskWithAssignees[],      // ← Now includes assignees array
  assignedTasks: AssignedTask[],   // ← NEW: Junction table data
  fullData: GroupDataStructure,    // ← NEW: Complete JSON
  loading: boolean,
  error: string | null,
  refetch: () => Promise<void>,
  updateTask: (id, updates) => Promise<void>
}
```

### 2. Updated Dashboard
**File**: `src/pages/DashboardPage.tsx`

**What Changed**:
- Imports `assignedTasks` and `fullData`
- Logs complete JSON structure to console
- Ready to use relationship data

**Console Output**:
```javascript
📊 Complete Group Data (JSON Structure): { ... formatted JSON ... }
📊 Full Data Object: { ... raw object ... }
```

### 3. Query Utilities
**File**: `src/utils/dataQueries.ts`

**Functions Available**:
- `getTasksByUser(data, userId)` - Filter tasks by user
- `getTasksDueToday(data)` - Get today's tasks
- `getOverdueTasks(data)` - Find overdue tasks
- `getUserTaskStats(data, userId)` - Get statistics
- `groupTasksByAssignee(data)` - Group by user
- `groupImagesByCategory(data)` - Group by category
- `generateSummaryReport(data)` - Export report
- ...and 13 more functions!

## 💡 How It Works

### Step 1: Single Fetch with Relationships
```typescript
// Inside useGroupData:

// 1. Fetch all base data in parallel
const [group, users, images, tasks] = await Promise.all([
  fetchGroup(groupId),
  fetchUsers(groupId),
  fetchImages(groupId),
  fetchTasks(groupId)
])

// 2. Fetch junction table
const assignedTasks = await fetchAssignedTasks(taskIds)

// 3. Create lookup maps for O(1) access
const userMap = new Map(users.map(u => [u.id, u]))
const assignmentsMap = new Map()
assignedTasks.forEach(at => {
  const list = assignmentsMap.get(at.task_id) || []
  assignmentsMap.set(at.task_id, [...list, at.user_id])
})

// 4. Enrich data with relationships
const imagesWithCreator = images.map(img => ({
  ...img,
  creator: userMap.get(img.created_by)
}))

const tasksWithAssignees = tasks.map(task => ({
  ...task,
  assignees: (assignmentsMap.get(task.id) || [])
    .map(userId => userMap.get(userId))
    .filter(Boolean),
  assigned_task_ids: assignmentsMap.get(task.id) || []
}))

// 5. Return structured data
return {
  group,
  users,
  images: imagesWithCreator,
  tasks: tasksWithAssignees,
  assignedTasks
}
```

### Step 2: Data Distribution
```typescript
// In DashboardPage.tsx
const { tasks, images, users, fullData } = useGroupData(groupId)

// Pass to child components with relationships already loaded
<TasksCard 
  tasks={tasks}  // Each task has assignees array
  onTaskUpdate={updateTask}
/>

<GalleryCard 
  images={images}  // Each image has creator object
  onImageUploaded={refetch}
/>

<ContactsCard 
  users={users}
/>
```

### Step 3: Query and Transform
```typescript
// In any component
import { getTasksByUser, getUserTaskStats } from '@/utils/dataQueries'

function MyComponent() {
  const { fullData } = useGroupData(groupId)
  
  // Query data
  const myTasks = getTasksByUser(fullData, currentUserId)
  const stats = getUserTaskStats(fullData, currentUserId)
  
  // Use enriched relationships
  myTasks.forEach(task => {
    console.log(`Task: ${task.name}`)
    console.log(`Shared with: ${task.assignees.map(a => a.name).join(', ')}`)
  })
}
```

## 📊 Complete Data Structure Example

```json
{
  "group": {
    "id": 1,
    "building": "North Campus",
    "apt_num": "204",
    "created_at": "2025-01-15T10:00:00Z"
  },
  "users": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "group_id": 1,
      "bio": "Computer Science major",
      "allergies": "Peanuts",
      "pets": "Cat"
    },
    {
      "id": 2,
      "name": "Bob Smith",
      "email": "bob@example.com",
      "group_id": 1,
      "bio": "Engineering student",
      "allergies": "",
      "pets": ""
    }
  ],
  "images": [
    {
      "id": 1,
      "url": "https://storage.supabase.co/bucket/img1.jpg",
      "title": "Living Room Setup",
      "category": "house",
      "group_id": 1,
      "created_by": 1,
      "creator": {
        "id": 1,
        "name": "Alice Johnson",
        "email": "alice@example.com"
      }
    }
  ],
  "tasks": [
    {
      "id": 1,
      "name": "Clean Kitchen",
      "description": "Deep clean the kitchen",
      "completed": false,
      "due_date": "2025-01-25",
      "group_id": 1,
      "assigned_to": 1,
      "assignees": [
        {
          "id": 1,
          "name": "Alice Johnson",
          "email": "alice@example.com"
        },
        {
          "id": 2,
          "name": "Bob Smith",
          "email": "bob@example.com"
        }
      ],
      "assigned_task_ids": [1, 2]
    }
  ],
  "assignedTasks": [
    {
      "task_id": 1,
      "user_id": 1,
      "assigned_at": "2025-01-20T10:00:00Z"
    },
    {
      "task_id": 1,
      "user_id": 2,
      "assigned_at": "2025-01-20T10:30:00Z"
    }
  ]
}
```

## 🚀 Usage Examples

### Example 1: Display Task with Multiple Assignees
```typescript
function TaskCard({ task }: { task: TaskWithAssignees }) {
  return (
    <div>
      <h3>{task.name}</h3>
      <p>{task.description}</p>
      
      {/* Show all assignees with full user info */}
      <div>
        <strong>Assigned to:</strong>
        {task.assignees.map(user => (
          <span key={user.id}>
            {user.name} ({user.email})
          </span>
        ))}
      </div>
      
      {/* Quick check if specific user is assigned */}
      {task.assigned_task_ids?.includes(currentUserId) && (
        <Badge>Your Task</Badge>
      )}
    </div>
  )
}
```

### Example 2: Gallery with Creator Info
```typescript
function ImageCard({ image }: { image: ImageWithCreator }) {
  return (
    <div>
      <img src={image.url} alt={image.title} />
      <h4>{image.title}</h4>
      <p>Category: {image.category}</p>
      
      {/* Creator info is already embedded */}
      {image.creator && (
        <div className="text-sm text-gray-500">
          <p>Uploaded by: {image.creator.name}</p>
          <p>Contact: {image.creator.email}</p>
          {image.creator.bio && <p>Bio: {image.creator.bio}</p>}
        </div>
      )}
    </div>
  )
}
```

### Example 3: Export Complete Data
```typescript
function ExportButton() {
  const { fullData } = useGroupData(groupId)
  
  const exportToFile = () => {
    const json = JSON.stringify(fullData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `group-data-${Date.now()}.json`
    a.click()
  }
  
  return <button onClick={exportToFile}>Export Data</button>
}
```

### Example 4: User Statistics
```typescript
function UserStats({ userId }: { userId: number }) {
  const { fullData } = useGroupData(groupId)
  
  const stats = getUserTaskStats(fullData, userId)
  const myImages = getImagesByCreator(fullData, userId)
  const myTasks = getTasksByUser(fullData, userId)
  
  return (
    <div>
      <h2>My Statistics</h2>
      <p>Task Completion: {stats.completionRate.toFixed(1)}%</p>
      <p>Completed Tasks: {stats.completed}/{stats.total}</p>
      <p>Overdue Tasks: {stats.overdue}</p>
      <p>Images Uploaded: {myImages.length}</p>
      
      <h3>Shared Tasks</h3>
      {myTasks
        .filter(task => task.assignees.length > 1)
        .map(task => (
          <div key={task.id}>
            {task.name} - Shared with:{' '}
            {task.assignees
              .filter(a => a.id !== userId)
              .map(a => a.name)
              .join(', ')}
          </div>
        ))}
    </div>
  )
}
```

## ✅ Verification Steps

1. **Check Console Logs**:
   ```bash
   # Open browser console after loading dashboard
   # You should see:
   📊 Complete Group Data (JSON Structure): { ... }
   📊 Full Data Object: { ... }
   ```

2. **Verify Relationships**:
   ```typescript
   // In browser console:
   // Check that images have creator
   fullData.images[0].creator // Should be a User object
   
   // Check that tasks have assignees
   fullData.tasks[0].assignees // Should be an array of User objects
   ```

3. **Test Query Functions**:
   ```typescript
   import { getTasksByUser } from '@/utils/dataQueries'
   
   const myTasks = getTasksByUser(fullData, 1)
   console.log('My tasks:', myTasks)
   ```

## 🎯 Benefits Achieved

✅ **Single Source of Truth**: One fetch for entire dashboard  
✅ **Pre-loaded Relationships**: No N+1 query problems  
✅ **O(1) Lookups**: Instant relationship resolution using Maps  
✅ **Complete JSON Access**: Export, log, or send entire structure  
✅ **Type Safety**: Full TypeScript support with extended types  
✅ **Caching**: 5-minute localStorage cache reduces API calls  
✅ **Optimistic Updates**: Instant UI responses  
✅ **Auto-refresh**: Background polling every 5 minutes  

## 🔮 Next Steps

### Immediate Usage
1. Use relationship data in existing components
2. Try query utility functions
3. Export data for debugging
4. Generate reports

### Future Enhancements
1. **Real-time subscriptions** - Live updates via Supabase Realtime
2. **GraphQL migration** - Even more efficient queries
3. **Pagination** - Handle large datasets
4. **Offline support** - Service worker with sync
5. **More relationships** - Add comments, files, etc.

## 📚 Documentation Reference

- **Quick Start**: `DATA_FETCHING_SUMMARY.md`
- **Full Structure**: `DATA_STRUCTURE.md`
- **Visual Diagrams**: `DATA_FLOW_DIAGRAM.md`
- **Code Examples**: `USAGE_EXAMPLES.tsx`
- **Query Functions**: `src/utils/dataQueries.ts`
- **Type Definitions**: `src/components/db/schema.tsx`
- **Hook Implementation**: `src/hooks/useGroupData.ts`

## 🤝 Contributing

When adding new relationships:

1. Update schema types in `src/components/db/schema.tsx`
2. Fetch related data in `useGroupData` hook
3. Create lookup map if needed
4. Enrich parent entity with relationship
5. Add query utilities in `dataQueries.ts`
6. Update documentation

---

**Status**: ✅ Fully Implemented and Documented  
**Version**: 2.0  
**Last Updated**: January 2025  
**Ready for**: Production use, further enhancements

