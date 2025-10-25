import supabase from "./supabase"

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: string
  }>
  htmlLink?: string
  status?: string
}

export interface CalendarListResponse {
  items: CalendarEvent[]
  nextPageToken?: string
}

/**
 * Get the user's Google Calendar access token from Supabase session
 */
export async function getCalendarAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.provider_token) {
    console.error("No provider token found in session")
    return null
  }
  
  return session.provider_token
}

/**
 * Fetch upcoming events from the user's primary Google Calendar
 * @param maxResults - Maximum number of events to return (default: 10)
 * @param timeMin - Lower bound for event start time (default: now)
 * @param timeMax - Upper bound for event start time (optional)
 */
export async function fetchUpcomingCalendarEvents(
  maxResults: number = 10,
  timeMin?: string,
  timeMax?: string
): Promise<CalendarEvent[]> {
  try {
    const accessToken = await getCalendarAccessToken()
    
    if (!accessToken) {
      throw new Error("No access token available. Please sign in again.")
    }

    // Default to current time if not provided
    const minTime = timeMin || new Date().toISOString()
    
    // Build query parameters
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      orderBy: "startTime",
      singleEvents: "true",
      timeMin: minTime,
    })

    if (timeMax) {
      params.append("timeMax", timeMax)
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to fetch calendar events")
    }

    const data: CalendarListResponse = await response.json()
    return data.items || []
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    throw error
  }
}

/**
 * Fetch events from a specific calendar
 * @param calendarId - The calendar identifier
 * @param maxResults - Maximum number of events to return
 * @param timeMin - Lower bound for event start time
 * @param timeMax - Upper bound for event start time
 */
export async function fetchCalendarEventsByCalendar(
  calendarId: string,
  maxResults: number = 10,
  timeMin?: string,
  timeMax?: string
): Promise<CalendarEvent[]> {
  try {
    const accessToken = await getCalendarAccessToken()
    
    if (!accessToken) {
      throw new Error("No access token available. Please sign in again.")
    }

    const minTime = timeMin || new Date().toISOString()
    
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      orderBy: "startTime",
      singleEvents: "true",
      timeMin: minTime,
    })

    if (timeMax) {
      params.append("timeMax", timeMax)
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to fetch calendar events")
    }

    const data: CalendarListResponse = await response.json()
    return data.items || []
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    throw error
  }
}

/**
 * List all calendars accessible by the user
 */
export async function listCalendars(): Promise<any[]> {
  try {
    const accessToken = await getCalendarAccessToken()
    
    if (!accessToken) {
      throw new Error("No access token available. Please sign in again.")
    }

    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to fetch calendars")
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error("Error fetching calendars:", error)
    throw error
  }
}
