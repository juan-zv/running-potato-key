import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchUpcomingCalendarEvents, type CalendarEvent } from "@/utils/calendar"
import { toast } from "sonner"
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react"

export function CalendarEventsCard() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)

  const handleFetchEvents = async () => {
    try {
      setLoading(true)
      
      // Fetch next 10 events
      const upcomingEvents = await fetchUpcomingCalendarEvents(10)
      setEvents(upcomingEvents)
      
      toast.success("Calendar events loaded", {
        description: `Found ${upcomingEvents.length} upcoming events`,
      })
    } catch (error) {
      toast.error("Failed to load calendar events", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

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
    <Card className="w-full max-w-2xl">
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
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading events...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Fetch Calendar Events
            </>
          )}
        </Button>

        {events.length > 0 && (
          <div className="space-y-3 mt-4">
            <h3 className="text-sm font-semibold">Upcoming Events:</h3>
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
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No events loaded yet</p>
            <p className="text-sm">Click the button above to fetch your calendar events</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
