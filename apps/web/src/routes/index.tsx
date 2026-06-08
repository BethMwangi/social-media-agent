import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Megaphone,
  FileText,
  CalendarDays,
  ClipboardCheck,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — BuildHerAI Marketing Agent" },
      { name: "description", content: "Overview of campaigns, posts, events and approvals." },
    ],
  }),
  component: Index,
});

const stats = [
  { label: "Total Campaigns", value: "24", delta: "+3 this week", icon: Megaphone, tone: "primary" },
  { label: "Generated Posts", value: "186", delta: "+42 this week", icon: FileText, tone: "secondary" },
  { label: "Upcoming Events", value: "7", delta: "Next in 3 days", icon: CalendarDays, tone: "accent" },
  { label: "Pending Approvals", value: "12", delta: "Needs review", icon: ClipboardCheck, tone: "warning" },
];

const recentCampaigns = [
  { name: "Women in AI Summit '26", type: "Event Promo", status: "Active", date: "May 28, 2026" },
  { name: "Build Week Cohort 12", type: "Recruitment", status: "Scheduled", date: "May 24, 2026" },
  { name: "Mentor Spotlight Series", type: "Community", status: "Draft", date: "May 20, 2026" },
  { name: "AI Hack Night — Lagos", type: "Event Promo", status: "Active", date: "May 18, 2026" },
  { name: "Founder Stories Vol. 3", type: "Storytelling", status: "Completed", date: "May 12, 2026" },
];

const upcomingEvents = [
  { title: "AI Hack Night — Lagos", date: "Jun 06", time: "6:00 PM WAT", color: "primary" },
  { title: "Build Week Kickoff", date: "Jun 10", time: "10:00 AM WAT", color: "accent" },
  { title: "Mentor Office Hours", date: "Jun 14", time: "4:00 PM WAT", color: "secondary" },
];

function statusVariant(status: string) {
  switch (status) {
    case "Active": return "bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-[var(--success)] border-transparent";
    case "Scheduled": return "bg-primary-soft text-primary border-transparent";
    case "Draft": return "bg-muted text-muted-foreground border-transparent";
    case "Completed": return "bg-secondary text-secondary-foreground border-transparent";
    default: return "";
  }
}

function Index() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Welcome back, BuildHer 👋"
        description="Here's what's happening across your community campaigns today."
        actions={
          <>
            <Button variant="outline" className="rounded-xl">
              <Plus className="h-4 w-4" /> New Campaign
            </Button>
            <Button asChild className="rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)] hover:opacity-95">
              <Link to="/ai-generator">
                <Sparkles className="h-4 w-4" /> Generate Content
              </Link>
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/60 shadow-[var(--shadow-card)]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{s.value}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-[var(--success)]" /> {s.delta}
                  </p>
                </div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    s.tone === "primary"
                      ? "bg-primary-soft text-primary"
                      : s.tone === "secondary"
                      ? "bg-secondary text-secondary-foreground"
                      : s.tone === "accent"
                      ? "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-accent"
                      : "bg-[color-mix(in_oklab,var(--warning)_22%,transparent)] text-[var(--warning)]"
                  }`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent Campaigns */}
        <Card className="border-border/60 shadow-[var(--shadow-card)] lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Your latest community marketing pushes.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-primary">
              <Link to="/campaigns">View all <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCampaigns.map((c) => (
                  <TableRow key={c.name} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-full ${statusVariant(c.status)}`}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{c.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Side column */}
        <div className="flex flex-col gap-6">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next on the community calendar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((e) => (
                <div key={e.title} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 transition-colors hover:border-primary/30">
                  <div className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-xs font-semibold ${
                    e.color === "primary" ? "bg-primary-soft text-primary"
                    : e.color === "accent" ? "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-accent"
                    : "bg-secondary text-secondary-foreground"
                  }`}>
                    <span className="text-[10px] uppercase opacity-70">{e.date.split(" ")[0]}</span>
                    <span className="text-base leading-none">{e.date.split(" ")[1]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 text-primary-foreground shadow-[var(--shadow-glow)]">
            <div className="absolute inset-0 bg-[var(--gradient-primary)]" />
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">AI Content Generation</h3>
              <p className="mt-1 text-sm text-primary-foreground/85">
                Upload a poster and let the agent draft on-brand captions for every platform.
              </p>
              <Button asChild variant="secondary" className="mt-4 rounded-xl bg-white text-primary hover:bg-white/90">
                <Link to="/ai-generator">Start generating <ArrowUpRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
