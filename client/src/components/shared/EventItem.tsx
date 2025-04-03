import { formatDate, formatTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { Event } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin } from "lucide-react";

interface EventItemProps {
  event: Event;
}

export function EventItem({ event }: EventItemProps) {
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
        "rounded-lg border p-3 space-y-2", 
        event.priority === "high" ? "border-l-4 border-l-red-500" : "",
        event.priority === "medium" ? "border-l-4 border-l-yellow-500" : "",
        event.priority === "low" ? "border-l-4 border-l-green-500" : "",
      )}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium">{event.title}</h4>
        {event.priority && (
          <Badge variant="outline" className={priorityColors[event.priority as keyof typeof priorityColors]}>
            {priorityNames[event.priority as keyof typeof priorityNames]}
          </Badge>
        )}
      </div>
      
      {event.description && (
        <p className="text-sm text-muted-foreground">{event.description}</p>
      )}
      
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{formatDate(event.startDate)}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatTime(event.startDate)}</span>
        </div>
        
        {event.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{event.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}