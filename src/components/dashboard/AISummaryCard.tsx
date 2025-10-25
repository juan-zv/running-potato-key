import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2 } from "lucide-react"
import { GoogleGenAI } from "@google/genai"
import { useEffect, useState } from "react"
import type { Task } from "@/components/db/schema"
import type { CalendarEvent } from "@/utils/calendar"

// The client gets the API key from the environment variable `VITE_GEMINI_API_KEY`.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })

interface SummaryData {
  text: string
  stats: {
    eventsToday: number
    tasksPending: number
    freeHours: number
  }
}

interface AISummaryCardProps {
  tasks: Task[]
  calendarEvents: CalendarEvent[]
}

export function AISummaryCard({ tasks, calendarEvents }: AISummaryCardProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function generateSummary() {
      try {
        setLoading(true)
        setError(null)

        const now = new Date()
        const today = now.toDateString()
        
        // Filter events for today
        const todaysEvents = calendarEvents.filter(event => {
          const eventDate = new Date(event.start.dateTime || event.start.date || '')
          return eventDate.toDateString() === today
        })

        // Filter tasks due today
        const tasksDueToday = tasks.filter(task => {
          const dueDate = new Date(task.due_date)
          return dueDate.toDateString() === today && !task.completed
        })

        // Calculate free hours (simplified - time between events)
        let freeHours = 0
        if (todaysEvents.length > 1) {
          const sortedEvents = [...todaysEvents].sort((a, b) => {
            const aTime = new Date(a.start.dateTime || a.start.date || '').getTime()
            const bTime = new Date(b.start.dateTime || b.start.date || '').getTime()
            return aTime - bTime
          })
          
          for (let i = 0; i < sortedEvents.length - 1; i++) {
            const currentEnd = new Date(sortedEvents[i].end.dateTime || sortedEvents[i].end.date || '')
            const nextStart = new Date(sortedEvents[i + 1].start.dateTime || sortedEvents[i + 1].start.date || '')
            const gap = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60)
            freeHours += gap
          }
        }

        const currentTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        const currentDate = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

        // Format events for the prompt
        const eventsList = todaysEvents.map(e => {
          const startTime = new Date(e.start.dateTime || e.start.date || '').toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
          })
          return `- ${e.summary || 'Untitled Event'} at ${startTime}`
        }).join('\n')

        // Format tasks for the prompt
        const tasksList = tasks.slice(0, 10).map(t => {
          const dueDate = new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          const isDueToday = tasksDueToday.some(td => td.id === t.id)
          return `- ${t.name}${isDueToday ? ' (DUE TODAY)' : ` (due ${dueDate})`}${t.completed ? ' ✓' : ''}`
        }).join('\n')

        // Create a detailed prompt for the AI
        const prompt = `You are a helpful personal assistant. Create a brief, friendly daily summary based on this data:

Date: ${currentDate}
Current Time: ${currentTime}

Calendar Events Today (${todaysEvents.length} events):
${eventsList || 'No events scheduled for today'}

Tasks (${tasks.length} total, ${tasksDueToday.length} due today, ${tasks.filter(t => !t.completed).length} incomplete):
${tasksList || 'No tasks'}

Generate a warm, concise 2-3 sentence summary highlighting:
1. Today's schedule and meetings
2. Tasks that need attention (especially those due today)
3. Suggested focus time based on calendar gaps${freeHours > 0 ? ` (you have about ${Math.round(freeHours)} hours of free time between meetings)` : ''}

Keep it conversational and motivating. Use natural language without bullet points.`

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: prompt,
        })

        const summaryText = response.text || "Unable to generate summary at this time."

        setSummary({
          text: summaryText,
          stats: {
            eventsToday: todaysEvents.length,
            tasksPending: tasks.filter(t => !t.completed).length,
            freeHours: Math.round(freeHours)
          }
        })
      } catch (err) {
        console.error("Error generating AI summary:", err)
        setError("Failed to generate summary. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    // Only generate if we have data
    if (tasks.length > 0 || calendarEvents.length > 0) {
      generateSummary()
    } else {
      setLoading(false)
    }
  }, [tasks, calendarEvents]) // Regenerate when tasks or events change

  return (
    <Card className="w-full border-primary/50 bg-linear-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Summary
        </CardTitle>
        <CardDescription>
          Your personalized daily overview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">
            {error}
          </div>
        ) : summary ? (
          <>
            <div className="space-y-2">
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {summary.text}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {summary.stats.eventsToday} Events Today
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {summary.stats.tasksPending} Tasks Pending
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {summary.stats.freeHours} Hours Free
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
