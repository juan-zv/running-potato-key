/**
 * Data Query Utilities
 * 
 * Helper functions for querying and transforming the structured group data
 */

import type { User, Task, Image } from "@/components/db/schema"

interface TaskWithAssignees extends Task {
  assignees: User[]
  assigned_task_ids?: number[]
}

interface ImageWithCreator extends Image {
  creator: User | null
}

interface GroupDataStructure {
  group: any
  users: User[]
  images: ImageWithCreator[]
  tasks: TaskWithAssignees[]
  assignedTasks: any[]
}

/**
 * Query: Get all tasks assigned to a specific user
 */
export function getTasksByUser(data: GroupDataStructure, userId: number): TaskWithAssignees[] {
  return data.tasks.filter(task => 
    task.assigned_task_ids?.includes(userId)
  )
}

/**
 * Query: Get all images created by a specific user
 */
export function getImagesByCreator(data: GroupDataStructure, userId: number): ImageWithCreator[] {
  return data.images.filter(image => 
    image.created_by === userId
  )
}

/**
 * Query: Get incomplete tasks
 */
export function getIncompleteTasks(data: GroupDataStructure): TaskWithAssignees[] {
  return data.tasks.filter(task => !task.completed)
}

/**
 * Query: Get completed tasks
 */
export function getCompletedTasks(data: GroupDataStructure): TaskWithAssignees[] {
  return data.tasks.filter(task => task.completed)
}

/**
 * Query: Get tasks due today
 */
export function getTasksDueToday(data: GroupDataStructure): TaskWithAssignees[] {
  const today = new Date().toDateString()
  return data.tasks.filter(task => 
    new Date(task.due_date).toDateString() === today
  )
}

/**
 * Query: Get overdue tasks
 */
export function getOverdueTasks(data: GroupDataStructure): TaskWithAssignees[] {
  const now = new Date()
  return data.tasks.filter(task => 
    !task.completed && new Date(task.due_date) < now
  )
}

/**
 * Query: Get tasks due within next N days
 */
export function getTasksDueWithin(data: GroupDataStructure, days: number): TaskWithAssignees[] {
  const now = new Date()
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  
  return data.tasks.filter(task => {
    const dueDate = new Date(task.due_date)
    return !task.completed && dueDate >= now && dueDate <= futureDate
  })
}

/**
 * Query: Get unassigned tasks
 */
export function getUnassignedTasks(data: GroupDataStructure): TaskWithAssignees[] {
  return data.tasks.filter(task => 
    !task.assigned_task_ids || task.assigned_task_ids.length === 0
  )
}

/**
 * Transform: Group tasks by completion status
 */
export function groupTasksByStatus(data: GroupDataStructure) {
  return {
    completed: data.tasks.filter(t => t.completed),
    incomplete: data.tasks.filter(t => !t.completed),
  }
}

/**
 * Transform: Group tasks by assignee
 */
export function groupTasksByAssignee(data: GroupDataStructure): Record<number, TaskWithAssignees[]> {
  const grouped: Record<number, TaskWithAssignees[]> = {}
  
  data.tasks.forEach(task => {
    task.assignees.forEach(assignee => {
      if (!grouped[assignee.id]) {
        grouped[assignee.id] = []
      }
      grouped[assignee.id].push(task)
    })
  })
  
  return grouped
}

/**
 * Transform: Group images by category
 */
export function groupImagesByCategory(data: GroupDataStructure): Record<string, ImageWithCreator[]> {
  const grouped: Record<string, ImageWithCreator[]> = {}
  
  data.images.forEach(image => {
    if (!grouped[image.category]) {
      grouped[image.category] = []
    }
    grouped[image.category].push(image)
  })
  
  return grouped
}

/**
 * Transform: Group images by creator
 */
export function groupImagesByCreator(data: GroupDataStructure): Record<number, ImageWithCreator[]> {
  const grouped: Record<number, ImageWithCreator[]> = {}
  
  data.images.forEach(image => {
    if (!grouped[image.created_by]) {
      grouped[image.created_by] = []
    }
    grouped[image.created_by].push(image)
  })
  
  return grouped
}

/**
 * Statistics: Get user task statistics
 */
export function getUserTaskStats(data: GroupDataStructure, userId: number) {
  const userTasks = getTasksByUser(data, userId)
  const completed = userTasks.filter(t => t.completed).length
  const incomplete = userTasks.filter(t => !t.completed).length
  const overdue = userTasks.filter(t => 
    !t.completed && new Date(t.due_date) < new Date()
  ).length
  
  return {
    total: userTasks.length,
    completed,
    incomplete,
    overdue,
    completionRate: userTasks.length > 0 ? (completed / userTasks.length) * 100 : 0,
  }
}

/**
 * Statistics: Get group overview statistics
 */
export function getGroupStats(data: GroupDataStructure) {
  return {
    totalUsers: data.users.length,
    totalTasks: data.tasks.length,
    completedTasks: data.tasks.filter(t => t.completed).length,
    incompleteTasks: data.tasks.filter(t => !t.completed).length,
    totalImages: data.images.length,
    overdueTasks: getOverdueTasks(data).length,
    unassignedTasks: getUnassignedTasks(data).length,
    taskCompletionRate: data.tasks.length > 0 
      ? (data.tasks.filter(t => t.completed).length / data.tasks.length) * 100 
      : 0,
  }
}

/**
 * Statistics: Get leaderboard (most completed tasks)
 */
export function getTaskCompletionLeaderboard(data: GroupDataStructure) {
  const userStats = data.users.map(user => {
    const stats = getUserTaskStats(data, user.id)
    return {
      user,
      ...stats,
    }
  })
  
  return userStats.sort((a, b) => b.completed - a.completed)
}

/**
 * Export: Convert to JSON string
 */
export function exportToJSON(data: GroupDataStructure): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Export: Get summary report
 */
export function generateSummaryReport(data: GroupDataStructure): string {
  const stats = getGroupStats(data)
  const leaderboard = getTaskCompletionLeaderboard(data)
  
  let report = `
=== Group Summary Report ===
Generated: ${new Date().toLocaleString()}

GROUP INFORMATION
- Building: ${data.group?.building}
- Apartment: ${data.group?.apt_num}
- Total Roommates: ${stats.totalUsers}

TASK STATISTICS
- Total Tasks: ${stats.totalTasks}
- Completed: ${stats.completedTasks} (${stats.taskCompletionRate.toFixed(1)}%)
- Incomplete: ${stats.incompleteTasks}
- Overdue: ${stats.overdueTasks}
- Unassigned: ${stats.unassignedTasks}

GALLERY STATISTICS
- Total Images: ${stats.totalImages}
- Images by Category:
`
  
  const imagesByCategory = groupImagesByCategory(data)
  Object.entries(imagesByCategory).forEach(([category, images]) => {
    report += `  - ${category}: ${images.length}\n`
  })
  
  report += `
TASK COMPLETION LEADERBOARD
`
  leaderboard.forEach((entry, index) => {
    report += `${index + 1}. ${entry.user.name}: ${entry.completed} completed (${entry.completionRate.toFixed(1)}%)\n`
  })
  
  return report
}

/**
 * Search: Find users by name or email
 */
export function searchUsers(data: GroupDataStructure, query: string): User[] {
  const lowerQuery = query.toLowerCase()
  return data.users.filter(user => 
    user.name.toLowerCase().includes(lowerQuery) ||
    user.email.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Search: Find tasks by name or description
 */
export function searchTasks(data: GroupDataStructure, query: string): TaskWithAssignees[] {
  const lowerQuery = query.toLowerCase()
  return data.tasks.filter(task => 
    task.name.toLowerCase().includes(lowerQuery) ||
    task.description.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Search: Find images by title
 */
export function searchImages(data: GroupDataStructure, query: string): ImageWithCreator[] {
  const lowerQuery = query.toLowerCase()
  return data.images.filter(image => 
    image.title.toLowerCase().includes(lowerQuery)
  )
}
