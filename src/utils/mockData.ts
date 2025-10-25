/**
 * Mock Data for Testing Dashboard Components
 * 
 * This file contains mock data that matches the database schema.
 * Use this for testing component functionality before connecting to real APIs.
 */

import type { User, Group, Image, Task, AssignedTask } from "@/components/db/schema"

// Mock Group (Apartment/Household)
export const mockGroup: Group = {
  id: 1,
  created_at: new Date("2025-01-01"),
  building: "Sunset Apartments",
  apt_num: "204",
}

// Mock Users (Roommates)
export const mockUsers: User[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1 (555) 123-4567",
    dob: new Date("1995-03-15"),
    created_at: new Date("2025-01-05"),
    bio: "Software engineer who loves hiking and photography",
    allergies: "None",
    special_needs: "",
    pets: "Cat named Whiskers",
    group_id: 1,
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "m.chen@example.com",
    phone: "+1 (555) 234-5678",
    dob: new Date("1992-07-22"),
    created_at: new Date("2025-01-05"),
    bio: "Product designer and coffee enthusiast",
    allergies: "Peanuts",
    special_needs: "",
    pets: "",
    group_id: 1,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.r@example.com",
    phone: "+1 (555) 987-6543",
    dob: new Date("1998-11-08"),
    created_at: new Date("2025-01-10"),
    bio: "Marketing specialist and yoga instructor",
    allergies: "",
    special_needs: "",
    pets: "Golden Retriever named Max",
    group_id: 1,
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@example.com",
    phone: "+1 (555) 345-6789",
    dob: new Date("1990-05-30"),
    created_at: new Date("2025-01-08"),
    bio: "Data analyst and board game collector",
    allergies: "Lactose intolerant",
    special_needs: "",
    pets: "",
    group_id: 1,
  },
  {
    id: 5,
    name: "Lisa Anderson",
    email: "lisa.a@example.com",
    phone: "+1 (555) 456-7890",
    dob: new Date("1996-09-12"),
    created_at: new Date("2025-01-12"),
    bio: "UX researcher with a passion for cooking",
    allergies: "",
    special_needs: "",
    pets: "Two goldfish",
    group_id: 1,
  },
]

// Mock Images (Gallery)
export const mockImages: Image[] = [
  {
    id: 1,
    url: "https://placehold.co/600x400",
    title: "Mountain View",
    category: "travel",
    group_id: 1,
    created_by: 1,
    created_at: new Date("2025-01-15"),
  },
  {
    id: 2,
    url: "https://placehold.co/600x400",
    title: "Nature Scene",
    category: "nature",
    group_id: 1,
    created_by: 2,
    created_at: new Date("2025-01-18"),
  },
  {
    id: 3,
    url: "https://placehold.co/600x400",
    title: "Sunset Beach",
    category: "travel",
    group_id: 1,
    created_by: 3,
    created_at: new Date("2025-01-20"),
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    title: "Forest Path",
    category: "nature",
    group_id: 1,
    created_by: 1,
    created_at: new Date("2025-01-22"),
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400&h=300&fit=crop",
    title: "Breakfast Together",
    category: "family",
    group_id: 1,
    created_by: 5,
    created_at: new Date("2025-01-25"),
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400&h=300&fit=crop",
    title: "Game Night",
    category: "family",
    group_id: 1,
    created_by: 4,
    created_at: new Date("2025-02-01"),
  },
]

// Mock Tasks (To-Do List)
export const mockTasks: Task[] = [
  {
    id: 1,
    name: "Take out trash",
    description: "Trash day is Thursday morning",
    assigned_to: 1,
    completed: false,
    due_date: new Date("2025-10-26"),
    created_at: new Date("2025-10-20"),
    group_id: 1,
  },
  {
    id: 2,
    name: "Clean kitchen",
    description: "Deep clean refrigerator and counters",
    assigned_to: 2,
    completed: false,
    due_date: new Date("2025-10-27"),
    created_at: new Date("2025-10-22"),
    group_id: 1,
  },
  {
    id: 3,
    name: "Buy groceries",
    description: "Milk, eggs, bread, vegetables",
    assigned_to: 3,
    completed: true,
    due_date: new Date("2025-10-25"),
    created_at: new Date("2025-10-23"),
    group_id: 1,
  },
  {
    id: 4,
    name: "Pay utilities",
    description: "Electric and water bills due",
    assigned_to: 4,
    completed: false,
    due_date: new Date("2025-10-30"),
    created_at: new Date("2025-10-20"),
    group_id: 1,
  },
  {
    id: 5,
    name: "Schedule apartment inspection",
    description: "Contact landlord for annual inspection",
    assigned_to: 1,
    completed: false,
    due_date: new Date("2025-11-01"),
    created_at: new Date("2025-10-15"),
    group_id: 1,
  },
  {
    id: 6,
    name: "Fix leaky faucet",
    description: "Bathroom sink needs repair",
    assigned_to: null,
    completed: false,
    due_date: new Date("2025-10-28"),
    created_at: new Date("2025-10-24"),
    group_id: 1,
  },
]

// Mock Assigned Tasks (Many-to-Many relationship)
export const mockAssignedTasks: AssignedTask[] = [
  {
    task_id: 1,
    user_id: 1,
    assigned_at: new Date("2025-10-20"),
  },
  {
    task_id: 2,
    user_id: 2,
    assigned_at: new Date("2025-10-22"),
  },
  {
    task_id: 3,
    user_id: 3,
    assigned_at: new Date("2025-10-23"),
  },
  {
    task_id: 4,
    user_id: 4,
    assigned_at: new Date("2025-10-20"),
  },
  {
    task_id: 4,
    user_id: 1,
    assigned_at: new Date("2025-10-21"),
  },
  {
    task_id: 5,
    user_id: 1,
    assigned_at: new Date("2025-10-15"),
  },
  {
    task_id: 5,
    user_id: 5,
    assigned_at: new Date("2025-10-15"),
  },
]

// Helper function to get user by ID
export const getUserById = (id: number): User | undefined => {
  return mockUsers.find(user => user.id === id)
}

// Helper function to get users in a group
export const getUsersByGroupId = (groupId: number): User[] => {
  return mockUsers.filter(user => user.group_id === groupId)
}

// Helper function to get images by group
export const getImagesByGroupId = (groupId: number): Image[] => {
  return mockImages.filter(image => image.group_id === groupId)
}

// Helper function to get tasks by group
export const getTasksByGroupId = (groupId: number): Task[] => {
  return mockTasks.filter(task => task.group_id === groupId)
}

// Helper function to get tasks assigned to a user
export const getTasksByUserId = (userId: number): Task[] => {
  const assignedTaskIds = mockAssignedTasks
    .filter(at => at.user_id === userId)
    .map(at => at.task_id)
  
  return mockTasks.filter(task => assignedTaskIds.includes(task.id))
}
