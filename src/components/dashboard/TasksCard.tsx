import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Plus, Loader2 } from "lucide-react"
import type { Task } from "@/components/db/schema"
import { toast } from "sonner"

interface TasksCardProps {
  tasks: Task[]
  loading: boolean
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>
}

export function TasksCard({ tasks, loading, onTaskUpdate }: TasksCardProps) {
  const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
    try {
      await onTaskUpdate(taskId, { completed: !currentStatus })
      toast.success(
        !currentStatus ? "Task completed! 🎉" : "Task marked as incomplete",
        {
          description: "Your task list has been updated",
        }
      )
    } catch (error) {
      toast.error("Failed to update task", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Your to-do list</CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => {
              toast.info("Create Task", {
                description: "Task creation coming soon!",
              })
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tasks yet</p>
            <p className="text-sm">Click the + button to create your first task</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => handleToggleComplete(task.id, task.completed)}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`text-sm font-medium leading-none cursor-pointer ${
                      task.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {task.name}
                  </label>
                  {task.description && (
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  )}
                  {task.due_date && (
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
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
        )}
      </CardContent>
    </Card>
  )
}
