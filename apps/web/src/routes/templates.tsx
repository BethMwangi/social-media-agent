import { createFileRoute } from "@tanstack/react-router";
import { Plus, LayoutTemplate } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/templates")({
  head: () => ({ meta: [{ title: "Templates — BuildHerAI" }] }),
  component: TemplatesPage,
});

const templates = [
  { name: "Event Announcement", uses: 42, tag: "Events" },
  { name: "Mentor Spotlight", uses: 28, tag: "Community" },
  { name: "Cohort Recruitment", uses: 31, tag: "Recruitment" },
  { name: "Founder Story", uses: 19, tag: "Storytelling" },
  { name: "Weekly Recap", uses: 56, tag: "Recurring" },
  { name: "Partner Shoutout", uses: 14, tag: "Partnerships" },
];

function TemplatesPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Templates"
        description="Reusable AI prompts and post structures tuned to your brand."
        actions={
          <Button className="rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)] hover:opacity-95">
            <Plus className="h-4 w-4" /> New Template
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => (
          <Card key={t.name} className="border-border/60 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/40">
            <CardContent className="p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--gradient-soft)] text-primary">
                <LayoutTemplate className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Used in {t.uses} campaigns</p>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="outline" className="rounded-full border-transparent bg-secondary text-secondary-foreground">{t.tag}</Badge>
                <Button size="sm" variant="ghost" className="text-primary">Use template</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}