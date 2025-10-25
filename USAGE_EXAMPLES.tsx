/**
 * Example Usage: Data Structure and Queries
 * 
 * This file demonstrates how to use the enhanced useGroupData hook
 * and the data query utilities in real components.
 */

import { useGroupData } from "@/hooks/useGroupData"
import {
  getTasksByUser,
  getTasksDueToday,
  getOverdueTasks,
  getUserTaskStats,
  getGroupStats,
  generateSummaryReport,
  groupTasksByAssignee,
  groupImagesByCategory,
} from "@/utils/dataQueries"

// ==========================================
// EXAMPLE 1: Dashboard Overview Component
// ==========================================

export function DashboardOverviewExample() {
  const { fullData, loading } = useGroupData(1)

  if (loading) return <div>Loading...</div>

  // Get comprehensive statistics
  const stats = getGroupStats(fullData)

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Total Users" value={stats.totalUsers} />
      <StatCard title="Total Tasks" value={stats.totalTasks} />
      <StatCard title="Completed" value={stats.completedTasks} />
      <StatCard title="Overdue" value={stats.overdueTasks} />
    </div>
  )
}

// ==========================================
// EXAMPLE 2: User Task Dashboard
// ==========================================

export function UserTaskDashboardExample({ userId }: { userId: number }) {
  const { fullData, loading } = useGroupData(1)

  if (loading) return <div>Loading...</div>

  // Get tasks for specific user
  const myTasks = getTasksByUser(fullData, userId)
  const tasksDueToday = getTasksDueToday(fullData)
  const overdue = getOverdueTasks(fullData)
  const stats = getUserTaskStats(fullData, userId)

  return (
    <div>
      <h2>My Tasks</h2>
      <p>Completion Rate: {stats.completionRate.toFixed(1)}%</p>
      
      <section>
        <h3>Due Today ({tasksDueToday.length})</h3>
        {tasksDueToday.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </section>

      <section>
        <h3>Overdue ({overdue.length})</h3>
        {overdue.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </section>

      <section>
        <h3>All My Tasks ({myTasks.length})</h3>
        {myTasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </section>
    </div>
  )
}

// ==========================================
// EXAMPLE 3: Gallery with Creator Info
// ==========================================

export function GalleryWithCreatorsExample() {
  const { images, loading } = useGroupData(1)

  if (loading) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map(image => (
        <div key={image.id} className="border rounded p-4">
          <img src={image.url} alt={image.title} />
          <h3>{image.title}</h3>
          <p className="text-sm text-gray-500">
            Uploaded by {image.creator?.name || "Unknown"}
          </p>
          <p className="text-xs text-gray-400">
            {image.creator?.email}
          </p>
        </div>
      ))}
    </div>
  )
}

// ==========================================
// EXAMPLE 4: Task Assignment View
// ==========================================

export function TaskAssignmentViewExample() {
  const { fullData, loading } = useGroupData(1)

  if (loading) return <div>Loading...</div>

  // Group tasks by assignee
  const tasksByUser = groupTasksByAssignee(fullData)

  return (
    <div>
      <h2>Tasks by Assignee</h2>
      {fullData.users.map(user => {
        const userTasks = tasksByUser[user.id] || []
        return (
          <div key={user.id} className="mb-6">
            <h3>{user.name}</h3>
            <p className="text-sm text-gray-500">
              {userTasks.length} task(s) assigned
            </p>
            <ul>
              {userTasks.map(task => (
                <li key={task.id}>
                  {task.name} - Due: {new Date(task.due_date).toLocaleDateString()}
                  {task.completed && " ✓"}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

// ==========================================
// EXAMPLE 5: Gallery by Category
// ==========================================

export function GalleryByCategoryExample() {
  const { fullData, loading } = useGroupData(1)

  if (loading) return <div>Loading...</div>

  const imagesByCategory = groupImagesByCategory(fullData)

  return (
    <div>
      <h2>Gallery by Category</h2>
      {Object.entries(imagesByCategory).map(([category, images]) => (
        <div key={category} className="mb-8">
          <h3 className="capitalize">{category} ({images.length})</h3>
          <div className="grid grid-cols-4 gap-4">
            {images.map(image => (
              <div key={image.id}>
                <img src={image.url} alt={image.title} className="w-full" />
                <p className="text-sm">{image.title}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ==========================================
// EXAMPLE 6: Summary Report Export
// ==========================================

export function SummaryReportExample() {
  const { fullData, loading } = useGroupData(1)

  if (loading) return <div>Loading...</div>

  const handleExportReport = () => {
    const report = generateSummaryReport(fullData)
    console.log(report)
    
    // Download as text file
    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `group-report-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h2>Export Summary Report</h2>
      <button onClick={handleExportReport}>
        Download Report
      </button>
    </div>
  )
}

// ==========================================
// EXAMPLE 7: Real-time Task Updates
// ==========================================

export function TaskListWithUpdatesExample({ userId }: { userId: number }) {
  const { fullData, loading, updateTask } = useGroupData(1)

  if (loading) return <div>Loading...</div>

  const myTasks = getTasksByUser(fullData, userId)

  const handleToggleComplete = async (taskId: number, currentStatus: boolean) => {
    await updateTask(taskId, { completed: !currentStatus })
    // UI updates optimistically!
  }

  return (
    <ul>
      {myTasks.map(task => (
        <li key={task.id}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => handleToggleComplete(task.id, task.completed)}
          />
          <span>{task.name}</span>
          {task.assignees.length > 1 && (
            <span className="text-sm text-gray-500">
              (shared with {task.assignees.length - 1} other{task.assignees.length > 2 ? "s" : ""})
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

// ==========================================
// EXAMPLE 8: Full JSON Export
// ==========================================

export function DataExportExample() {
  const { fullData, loading } = useGroupData(1)

  if (loading) return <div>Loading...</div>

  const handleExportJSON = () => {
    const json = JSON.stringify(fullData, null, 2)
    console.log("Complete Data Structure:", json)
    
    // Download as JSON file
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `group-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleViewInConsole = () => {
    console.log("📊 Full Data Object:", fullData)
    console.log("📊 JSON String:", JSON.stringify(fullData, null, 2))
    alert("Check your browser console!")
  }

  return (
    <div>
      <h2>Export Data</h2>
      <button onClick={handleExportJSON}>
        Download as JSON
      </button>
      <button onClick={handleViewInConsole}>
        View in Console
      </button>
      
      <div className="mt-4">
        <h3>Data Summary</h3>
        <pre className="bg-gray-100 p-4 rounded">
          {`
Group: ${fullData.group?.building} - Apt ${fullData.group?.apt_num}
Users: ${fullData.users.length}
Tasks: ${fullData.tasks.length}
Images: ${fullData.images.length}
Assigned Tasks: ${fullData.assignedTasks.length}
          `}
        </pre>
      </div>
    </div>
  )
}

// ==========================================
// EXAMPLE 9: Accessing Nested Relationships
// ==========================================

export function NestedRelationshipsExample() {
  const { fullData, loading } = useGroupData(1)

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Nested Relationships Demo</h2>
      
      {/* Task with multiple assignees */}
      {fullData.tasks.map(task => (
        <div key={task.id} className="border p-4 mb-4">
          <h3>{task.name}</h3>
          <p>{task.description}</p>
          <div className="mt-2">
            <strong>Assigned to:</strong>
            <ul className="list-disc ml-6">
              {task.assignees.map(assignee => (
                <li key={assignee.id}>
                  {assignee.name} ({assignee.email})
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* Image with creator details */}
      {fullData.images.map(image => (
        <div key={image.id} className="border p-4 mb-4">
          <img src={image.url} alt={image.title} className="w-32 h-32" />
          <h3>{image.title}</h3>
          <p>Category: {image.category}</p>
          {image.creator && (
            <div className="mt-2 text-sm">
              <strong>Uploaded by:</strong>
              <p>{image.creator.name}</p>
              <p>{image.creator.email}</p>
              <p>Bio: {image.creator.bio}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ==========================================
// Helper Components
// ==========================================

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="border rounded p-4">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

function TaskItem({ task }: { task: any }) {
  return (
    <div className="border-b py-2">
      <h4>{task.name}</h4>
      <p className="text-sm text-gray-500">{task.description}</p>
      <p className="text-xs">Due: {new Date(task.due_date).toLocaleDateString()}</p>
      {task.assignees.length > 0 && (
        <p className="text-xs">
          Assigned: {task.assignees.map((a: any) => a.name).join(", ")}
        </p>
      )}
    </div>
  )
}
