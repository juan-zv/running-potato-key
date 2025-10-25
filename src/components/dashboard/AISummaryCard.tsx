import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export function AISummaryCard() {
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
        <div className="space-y-2">
          <p className="text-sm leading-relaxed">
            Good morning! You have <span className="font-semibold text-primary">3 meetings</span> scheduled today, 
            with your first one starting at 10:00 AM. Your calendar is moderately busy with 
            <span className="font-semibold text-primary"> 2 hours of free time</span> in the afternoon.
          </p>
          <p className="text-sm leading-relaxed">
            You have <span className="font-semibold text-primary">5 pending tasks</span>, with 2 due today. 
            Based on your schedule, the best time to focus on deep work is between 2-4 PM.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            3 Events Today
          </div>
          <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            5 Tasks Pending
          </div>
          <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            2 Hours Free
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
