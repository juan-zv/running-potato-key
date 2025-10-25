import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchUpcomingCalendarEvents, type CalendarEvent } from "@/utils/calendar"
import { toast } from "sonner"
import { Calendar, Clock, MapPin, Loader2, RefreshCw } from "lucide-react"

interface CalendarEventsCardProps {
  onEventsLoaded?: (events: CalendarEvent[]) => void
}

export function CalendarEventsCard({ onEventsLoaded }: CalendarEventsCardProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleFetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch next 10 events
      const upcomingEvents = await fetchUpcomingCalendarEvents(10)
      setEvents(upcomingEvents)
      
      // Pass events to parent component
      if (onEventsLoaded) {
        onEventsLoaded(upcomingEvents)
      }
      
      if (upcomingEvents.length > 0) {
        toast.success("Calendar events loaded", {
          description: `Found ${upcomingEvents.length} upcoming events`,
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
      toast.error("Failed to load calendar events", {
        description: errorMessage,
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch on component mount
  useEffect(() => {
    handleFetchEvents()
  }, []) // Empty dependency array means this runs once on mount

  const formatEventDate = (event: CalendarEvent) => {
    const startDate = event.start.dateTime || event.start.date
    if (!startDate) return "No date"
    
    const date = new Date(startDate)
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: event.start.dateTime ? "numeric" : undefined,
      minute: event.start.dateTime ? "2-digit" : undefined,
    })
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Your Calendar Events
        </CardTitle>
        <CardDescription>
          View your upcoming Google Calendar events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleFetchEvents}
          disabled={loading}
          variant="outline"
          size="sm"
          className="w-fit"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Events
            </>
          )}
        </Button>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {loading && events.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-3 mt-4">
            <h3 className="text-sm font-semibold mb-4">Upcoming Events:</h3>
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="p-4 space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border p-4 hover:bg-accent transition-colors"
                  >
                    <div className="space-y-2">
                      <h4 className="font-medium">
                        {event.summary || "No Title"}
                      </h4>
                      
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{formatEventDate(event)}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      
                      {event.htmlLink && (
                        <a
                          href={event.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-block"
                        >
                          View in Google Calendar →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming events</p>
            <p className="text-sm">Your calendar is clear</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
