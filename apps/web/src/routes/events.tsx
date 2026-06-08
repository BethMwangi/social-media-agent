import { createFileRoute } from "@tanstack/react-router";
import { Plus, MapPin, Users, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events — BuildHerAI" }] }),
  component: EventsPage,
});

const events = [
  { title: "AI Hack Night — Lagos", date: "Jun 06, 2026", time: "6:00 PM WAT", location: "Lagos, NG", rsvp: 142, status: "Live" },
  { title: "Build Week Kickoff", date: "Jun 10, 2026", time: "10:00 AM WAT", location: "Online", rsvp: 320, status: "Live" },
  { title: "Mentor Office Hours", date: "Jun 14, 2026", time: "4:00 PM WAT", location: "Online", rsvp: 58, status: "Live" },
  { title: "Women in AI Summit '26", date: "Jul 12, 2026", time: "9:00 AM WAT", location: "Nairobi, KE", rsvp: 612, status: "Planning" },
  { title: "AI Ethics Roundtable", date: "Jul 28, 2026", time: "5:00 PM WAT", location: "Online", rsvp: 89, status: "Draft" },
];

function EventsPage() {
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
        {events.map((e) => (
          <Card key={e.title} className="group border-border/60 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="rounded-full border-transparent bg-secondary text-secondary-foreground">{e.status}</Badge>
              </div>
              <h3 className="mt-4 text-base font-semibold">{e.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{e.date} · {e.time}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.location}</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {e.rsvp} RSVPs</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}