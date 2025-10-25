import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2 } from "lucide-react"
import { GoogleGenAI } from "@google/genai"
import { useEffect, useState } from "react"

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({})

interface SummaryData {
  text: string
  stats: {
    eventsToday: number
    tasksPending: number
    freeHours: number
  }
}

export function AISummaryCard() {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function generateSummary() {
      try {
        setLoading(true)
        setError(null)

        // Placeholder data - this will be replaced with real data from calendar, tasks, etc.
        const placeholderData = {
          calendarEvents: [
            { title: "Team Standup", time: "10:00 AM", duration: "30 min" },
            { title: "Project Review", time: "2:00 PM", duration: "1 hour" },
            { title: "Dinner with Friends", time: "7:00 PM", duration: "2 hours" }
          ],
          tasks: [
            { title: "Finish project report", dueToday: true },
            { title: "Review pull requests", dueToday: true },
            { title: "Update documentation", dueToday: false },
            { title: "Plan next sprint", dueToday: false },
            { title: "Schedule dentist appointment", dueToday: false }
          ],
          currentTime: "9:00 AM",
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
        }

        // Create a detailed prompt for the AI
        const prompt = `You are a helpful personal assistant. Create a brief, friendly daily summary based on this data:

Date: ${placeholderData.date}
Current Time: ${placeholderData.currentTime}

Calendar Events Today:
${placeholderData.calendarEvents.map(e => `- ${e.title} at ${e.time} (${e.duration})`).join('\n')}

Tasks (${placeholderData.tasks.length} total, ${placeholderData.tasks.filter(t => t.dueToday).length} due today):
${placeholderData.tasks.map(t => `- ${t.title}${t.dueToday ? ' (DUE TODAY)' : ''}`).join('\n')}

Generate a warm, concise 2-3 sentence summary highlighting:
1. Today's schedule and meetings
2. Tasks that need attention
3. Suggested focus time based on calendar gaps

Keep it conversational and motivating. Use natural language without bullet points.`

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: prompt,
        })

        const summaryText = response.text || "Unable to generate summary at this time."

        setSummary({
          text: summaryText,
          stats: {
            eventsToday: placeholderData.calendarEvents.length,
            tasksPending: placeholderData.tasks.length,
            freeHours: 2 // Calculate this from actual calendar gaps in the future
          }
        })
      } catch (err) {
        console.error("Error generating AI summary:", err)
        setError("Failed to generate summary. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    generateSummary()
  }, [])

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
