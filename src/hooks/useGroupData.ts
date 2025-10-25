/**
 * Custom hook for managing group data with caching and auto-refresh
 * 
 * Features:
 * - Fetches all group-related data on mount
 * - Caches data in localStorage
 * - Auto-refreshes every 5 minutes
 * - Provides loading and error states
 */

import { useState, useEffect, useCallback } from "react"
import supabase from "@/utils/supabase"
import type { User, Group, Image, Task } from "@/components/db/schema"

interface GroupData {
  group: Group | null
  users: User[]
  images: Image[]
  tasks: Task[]
}

interface UseGroupDataReturn extends GroupData {
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateTask: (taskId: number, updates: Partial<Task>) => Promise<void>
}

const CACHE_KEY = "group_data_cache"
const CACHE_TIMESTAMP_KEY = "group_data_timestamp"
const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useGroupData(groupId: number | null): UseGroupDataReturn {
  const [data, setData] = useState<GroupData>({
    group: null,
    users: [],
    images: [],
    tasks: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from cache
  const loadFromCache = useCallback((): GroupData | null => {
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
  const saveToCache = useCallback((groupData: GroupData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(groupData))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
    } catch (err) {
      console.error("Error saving to cache:", err)
    }
  }, [])

  // Fetch all group data from Supabase
  const fetchGroupData = useCallback(async (): Promise<GroupData> => {
    if (!groupId) {
      return {
        group: null,
        users: [],
        images: [],
        tasks: [],
      }
    }

    try {
      // Fetch group info
      const { data: groupData, error: groupError } = await supabase
        .from("Group")
        .select("*")
        .eq("id", groupId)
        .single()

      if (groupError) throw groupError

      // Fetch users in this group
      const { data: usersData, error: usersError } = await supabase
        .from("User")
        .select("*")
        .eq("group_id", groupId)
        .order("name", { ascending: true })

      if (usersError) throw usersError

      // Fetch images for this group
      const { data: imagesData, error: imagesError } = await supabase
        .from("Image")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })

      if (imagesError) throw imagesError

      // Fetch tasks for this group
      const { data: tasksData, error: tasksError } = await supabase
        .from("Task")
        .select("*")
        .eq("group_id", groupId)
        .order("due_date", { ascending: true })

      if (tasksError) throw tasksError

      return {
        group: groupData,
        users: usersData || [],
        images: imagesData || [],
        tasks: tasksData || [],
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
      const updatedData = {
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
    loading,
    error,
    refetch,
    updateTask,
  }
}
