import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/campaigns")({
  head: () => ({ meta: [{ title: "Campaigns — BuildHerAI" }] }),
  component: CampaignsPage,
});

const campaigns = [
  { name: "Women in AI Summit '26", type: "Event Promo", objective: "Awareness", status: "Active", date: "May 28, 2026" },
  { name: "Build Week Cohort 12", type: "Recruitment", objective: "Signups", status: "Scheduled", date: "May 24, 2026" },
  { name: "Mentor Spotlight Series", type: "Community", objective: "Engagement", status: "Draft", date: "May 20, 2026" },
  { name: "AI Hack Night — Lagos", type: "Event Promo", objective: "Attendance", status: "Active", date: "May 18, 2026" },
  { name: "Founder Stories Vol. 3", type: "Storytelling", objective: "Brand Lift", status: "Completed", date: "May 12, 2026" },
  { name: "Scholarship Launch", type: "Announcement", objective: "Applications", status: "Scheduled", date: "May 09, 2026" },
  { name: "AI Ethics Roundtable", type: "Event Promo", objective: "Attendance", status: "Draft", date: "May 02, 2026" },
];

function statusClass(status: string) {
  switch (status) {
    case "Active": return "bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-[var(--success)]";
    case "Scheduled": return "bg-primary-soft text-primary";
    case "Draft": return "bg-muted text-muted-foreground";
    case "Completed": return "bg-secondary text-secondary-foreground";
    default: return "";
  }
}

function CampaignsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Campaigns"
        description="Plan, manage and track every community campaign in one place."
        actions={
          <Button className="rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)] hover:opacity-95">
            <Plus className="h-4 w-4" /> New Campaign
          </Button>
        }
      />

      <Card className="border-border/60 shadow-[var(--shadow-card)]">
        <CardContent className="p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search campaigns..." className="h-10 rounded-xl pl-9" />
            </div>
            <Button variant="outline" className="rounded-xl">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Objective</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.name} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.type}</TableCell>
                  <TableCell className="text-muted-foreground">{c.objective}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-full border-transparent ${statusClass(c.status)}`}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{c.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}