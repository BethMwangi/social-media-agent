import { createFileRoute } from "@tanstack/react-router";
import { Plus, MapPin, Tag, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEvents, type EventItem } from "@/services/api";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events — BuildHerAI" }] }),
  loader: async () => {
    try {
      const events = await getEvents();

      return {
        events,
        eventsError: false,
      };
    } catch {
      return {
        events: [],
        eventsError: true,
      };
    }
  },
  component: EventsPage,
});

function toDisplayStatus(status: string | null | undefined) {
  if (!status) {
    return "Unknown";
  }

  return status
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function statusClass(status: string) {
  switch (status) {
    case "Active":
    case "Live":
      return "bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-[var(--success)]";
    case "Scheduled":
    case "Planning":
      return "bg-primary-soft text-primary";
    case "Draft":
      return "bg-muted text-muted-foreground";
    case "Completed":
      return "bg-secondary text-secondary-foreground";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

function formatEvent(event: EventItem) {
  const eventDate = new Date(event.event_date);

  return {
    id: event.id,
    title: event.title,
    date: eventDate.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    time: eventDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
    location: event.location ?? "Location TBD",
    type: event.event_type ?? "General",
    status: toDisplayStatus(event.status),
  };
}

function EventsPage() {
  const { events, eventsError } = Route.useLoaderData();
  const formattedEvents = events.map(formatEvent);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Events"
        description="Upcoming community events powering your campaigns."
        actions={
          <Button className="rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)] hover:opacity-95">
            <Plus className="h-4 w-4" /> New Event
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {formattedEvents.map((e) => (
          <Card
            key={e.id}
            className="group border-border/60 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-glow)]"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <Badge
                  variant="outline"
                  className={`rounded-full border-transparent ${statusClass(e.status)}`}
                >
                  {e.status}
                </Badge>
              </div>
              <h3 className="mt-4 text-base font-semibold">{e.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {e.date} · {e.time}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {e.location}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> {e.type}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {!formattedEvents.length && !eventsError ? (
          <Card className="border-border/60 shadow-[var(--shadow-card)] md:col-span-2 xl:col-span-3">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No events found.
            </CardContent>
          </Card>
        ) : null}
        {eventsError ? (
          <Card className="border-border/60 shadow-[var(--shadow-card)] md:col-span-2 xl:col-span-3">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Unable to load events right now.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
