/**
 * Custom hook for managing group data with caching and auto-refresh
 * 
 * Features:
 * - Fetches all group-related data with relationships in one structured JSON format
 * - Caches data in localStorage
 * - Auto-refreshes every 5 minutes
 * - Provides loading and error states
 * - Handles relationships: Group→Users, Task→Assignees, Image→Creator
 */

import { useState, useEffect, useCallback } from "react"
import supabase from "@/utils/supabase"
import type { User, Group, Image, Task, AssignedTask } from "@/components/db/schema"

// Enhanced types with relationships
interface TaskWithAssignees extends Task {
  assignees: User[]
  assigned_task_ids?: number[]  // Track which users are assigned
}

interface ImageWithCreator extends Image {
  creator: User | null
}

interface GroupDataStructure {
  group: Group | null
  users: User[]
  images: ImageWithCreator[]
  tasks: TaskWithAssignees[]
  assignedTasks: AssignedTask[]  // Raw junction table data
}

interface UseGroupDataReturn {
  // Structured data with relationships
  group: Group | null
  users: User[]
  images: ImageWithCreator[]
  tasks: TaskWithAssignees[]
  assignedTasks: AssignedTask[]
  // Full JSON structure
  fullData: GroupDataStructure
  // Utility states
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateTask: (taskId: number, updates: Partial<Task>) => Promise<void>
}

const CACHE_KEY = "group_data_cache"
const CACHE_TIMESTAMP_KEY = "group_data_timestamp"
const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useGroupData(groupId: number | null): UseGroupDataReturn {
  const [data, setData] = useState<GroupDataStructure>({
    group: null,
    users: [],
    images: [],
    tasks: [],
    assignedTasks: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from cache
  const loadFromCache = useCallback((): GroupDataStructure | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp)
        // Use cache if less than 5 minutes old
        if (age < REFRESH_INTERVAL) {
          return JSON.parse(cached)
        }
      }
      return null
    } catch (err) {
      console.error("Error loading from cache:", err)
      return null
    }
  }, [])

  // Save data to cache
  const saveToCache = useCallback((groupData: GroupDataStructure) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(groupData))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
    } catch (err) {
      console.error("Error saving to cache:", err)
    }
  }, [])

  // Fetch all group data from Supabase with relationships
  const fetchGroupData = useCallback(async (): Promise<GroupDataStructure> => {
    if (!groupId) {
      return {
        group: null,
        users: [],
        images: [],
        tasks: [],
        assignedTasks: [],
      }
    }

    try {
      // 1. Fetch group info
      const { data: groupData, error: groupError } = await supabase
        .from("Group")
        .select("*")
        .eq("id", groupId)
        .single()

      if (groupError) throw groupError

      // 2. Fetch all users in this group
      const { data: usersData, error: usersError } = await supabase
        .from("User")
        .select("*")
        .eq("group_id", groupId)
        .order("name", { ascending: true })

      if (usersError) throw usersError

      console.log("📊 Fetched users for group", groupId, ":", usersData)

      // Create a map of user_id -> User for quick lookups
      const userMap = new Map<number, User>()
      usersData?.forEach(user => userMap.set(user.id, user))

      // 3. Fetch images with creator relationship
      const { data: imagesData, error: imagesError } = await supabase
        .from("Image")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })

      if (imagesError) throw imagesError

      // Enrich images with creator info
      const imagesWithCreator: ImageWithCreator[] = (imagesData || []).map(image => ({
        ...image,
        creator: userMap.get(image.user_id) || null,
      }))

      // 4. Fetch tasks for this group
      const { data: tasksData, error: tasksError } = await supabase
        .from("Task")
        .select("*")
        .eq("group_id", groupId)
        .order("due_date", { ascending: true })

      if (tasksError) throw tasksError

      // 5. Fetch all assigned_tasks relationships for these tasks
      const taskIds = tasksData?.map(t => t.id) || []
      let assignedTasksData: AssignedTask[] = []
      
      if (taskIds.length > 0) {
        const { data: assignedData, error: assignedError } = await supabase
          .from("assigned_tasks")
          .select("*")
          .in("task_id", taskIds)

        if (assignedError) {
          console.error("Error fetching assigned tasks:", assignedError)
        } else {
          assignedTasksData = assignedData || []
        }
      }

      // Create a map of task_id -> assigned user_ids
      const taskAssignmentsMap = new Map<number, number[]>()
      assignedTasksData.forEach(at => {
        const existing = taskAssignmentsMap.get(at.task_id) || []
        taskAssignmentsMap.set(at.task_id, [...existing, at.user_id])
      })

      // Enrich tasks with assignee info
      const tasksWithAssignees: TaskWithAssignees[] = (tasksData || []).map(task => {
        const assignedUserIds = taskAssignmentsMap.get(task.id) || []
        const assignees = assignedUserIds
          .map(userId => userMap.get(userId))
          .filter((user): user is User => user !== undefined)

        return {
          ...task,
          assignees,
          assigned_task_ids: assignedUserIds,
        }
      })

      // Return structured data
      return {
        group: groupData,
        users: usersData || [],
        images: imagesWithCreator,
        tasks: tasksWithAssignees,
        assignedTasks: assignedTasksData,
      }
    } catch (err) {
      console.error("Error fetching group data:", err)
      throw err
    }
  }, [groupId])

  // Main fetch function with caching
  const refetch = useCallback(async () => {
    if (!groupId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const groupData = await fetchGroupData()
      setData(groupData)
      saveToCache(groupData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load data"
      setError(errorMessage)
      console.error("Error in refetch:", err)
    } finally {
      setLoading(false)
    }
  }, [groupId, fetchGroupData, saveToCache])

  // Update task (for marking as completed)
  const updateTask = useCallback(async (taskId: number, updates: Partial<Task>) => {
    try {
      const { error: updateError } = await supabase
        .from("Task")
        .update(updates)
        .eq("id", taskId)

      if (updateError) throw updateError

      // Update local state immediately (optimistic update)
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
      }))

      // Update cache
      const updatedData: GroupDataStructure = {
        ...data,
        tasks: data.tasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
      }
      saveToCache(updatedData)
    } catch (err) {
      console.error("Error updating task:", err)
      throw err
    }
  }, [data, saveToCache])

  // Initial load
  useEffect(() => {
    if (!groupId) {
      setLoading(false)
      return
    }

    // Try to load from cache first
    const cachedData = loadFromCache()
    if (cachedData) {
      setData(cachedData)
      setLoading(false)
    }

    // Then fetch fresh data
    refetch()
  }, [groupId]) // Only run on mount or when groupId changes

  // Set up auto-refresh interval
  useEffect(() => {
    if (!groupId) return

    const interval = setInterval(() => {
      console.log("Auto-refreshing group data...")
      refetch()
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [groupId, refetch])

  return {
    ...data,
    fullData: data,  // Provide the complete structured data
    loading,
    error,
    refetch,
    updateTask,
  }
}
