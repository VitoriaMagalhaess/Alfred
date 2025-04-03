import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { formatDueDate } from "@/lib/date-utils";
import type { Task } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "../ui/badge";
import { CheckedState } from "@radix-ui/react-checkbox";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const queryClient = useQueryClient();
  const [completed, setCompleted] = useState(task.completed);
  
  const updateTaskMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      return apiRequest(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const priorityColors = {
    low: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    high: "bg-red-100 text-red-700 border-red-200",
  };

  const priorityNames = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
  };
  
  return (
    <div 
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3",
        task.priority === "high" ? "border-l-4 border-l-red-500" : "",
        task.priority === "medium" ? "border-l-4 border-l-yellow-500" : "",
        task.priority === "low" ? "border-l-4 border-l-green-500" : "",
        completed ? "opacity-60" : ""
      )}
    >
      <Checkbox 
        className="mt-1 h-5 w-5"
        checked={completed}
        onCheckedChange={(checked: CheckedState) => {
          if (typeof checked === 'boolean') {
            setCompleted(checked);
            updateTaskMutation.mutate(checked);
          }
        }}
      />
      <div className="space-y-1 flex-1">
        <div className="flex justify-between">
          <h4 className={cn(
            "text-sm font-medium", 
            completed ? "line-through text-muted-foreground" : ""
          )}>
            {task.title}
          </h4>
          {task.priority && (
            <Badge variant="outline" className={priorityColors[task.priority as keyof typeof priorityColors]}>
              {priorityNames[task.priority as keyof typeof priorityNames]}
            </Badge>
          )}
        </div>
        
        {task.description && (
          <p className={cn(
            "text-sm text-muted-foreground",
            completed ? "line-through" : ""
          )}>
            {task.description}
          </p>
        )}
        
        {task.dueDate && (
          <div className={cn(
            "text-xs text-muted-foreground", 
            completed ? "line-through" : ""
          )}>
            Prazo: {formatDueDate(task.dueDate)}
          </div>
        )}
      </div>
    </div>
  );
}