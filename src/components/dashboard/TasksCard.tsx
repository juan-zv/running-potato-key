import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Plus } from "lucide-react"

interface Task {
  id: string
  title: string
  completed: boolean
  dueDate?: string
}

const mockTasks: Task[] = [
  { id: "1", title: "Review project proposal", completed: false, dueDate: "Today" },
  { id: "2", title: "Update documentation", completed: false, dueDate: "Today" },
  { id: "3", title: "Team sync meeting prep", completed: true, dueDate: "Yesterday" },
  { id: "4", title: "Code review for PR #123", completed: false, dueDate: "Tomorrow" },
  { id: "5", title: "Plan sprint goals", completed: false, dueDate: "This week" },
]

export function TasksCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Your to-do list</CardDescription>
          </div>
          <Button size="sm" variant="ghost">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              <Checkbox
                id={task.id}
                checked={task.completed}
                className="mt-0.5"
              />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor={task.id}
                  className={`text-sm font-medium leading-none cursor-pointer ${
                    task.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </label>
                {task.dueDate && (
                  <p className="text-xs text-muted-foreground">{task.dueDate}</p>
                )}
              </div>
              {task.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
