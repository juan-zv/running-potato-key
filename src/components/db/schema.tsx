/**
 * Database Schema Types
 * 
 * Relationships:
 * - Group → Users (one-to-many): One group can have many users
 * - Group → Images (one-to-many): One group can have many images
 * - User → Images (one-to-many): One user can create many images
 * - Task ← → User (many-to-many via AssignedTask): Tasks can be assigned to multiple users
 */

type User = {
    id: string  // UUID
    dob: Date
    name: string
    email: string
    created_at: Date
    bio: string
    allergies: string
    special_needs: string
    pets: string
    group_id: string | null  // Foreign key to Group (nullable if user has no group yet)
    phone: string
}

type Group = {
    id: string  // UUID
    created_at: Date
    building: string
    apt_num: string
}

type Image = {
    id: string  // UUID
    url: string
    group_id: string  // Foreign key to Group
    user_id: string  // Foreign key to User (creator)
    title: string
    category: string
}

type Task = {
    id: string  // UUID
    name: string
    description: string
    assigned_to: string | null  // Foreign key to User (nullable if unassigned)
    completed: boolean
    due_date: Date
    created_at?: Date  // Optional: when the task was created
    group_id?: string  // Optional: if tasks are group-specific
}

type AssignedTask = {
    task_id: string  // Foreign key to Task
    user_id: string  // Foreign key to User
    assigned_at?: Date  // Optional: when the assignment was made
}

// Helper types for queries with joined data
type UserWithGroup = User & {
    group?: Group
}

type GroupWithUsers = Group & {
    users?: User[]
}

type ImageWithCreator = Image & {
    creator?: User
}

type TaskWithAssignees = Task & {
    assignees?: User[]
}

export type { 
    User, 
    Group, 
    Image, 
    Task, 
    AssignedTask,
    UserWithGroup,
    GroupWithUsers,
    ImageWithCreator,
    TaskWithAssignees
}