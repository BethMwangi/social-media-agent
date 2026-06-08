import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Eye, Heart, Share2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — BuildHerAI" }] }),
  component: AnalyticsPage,
});

const metrics = [
  { label: "Impressions", value: "248.3K", delta: "+18.4%", icon: Eye },
  { label: "Engagements", value: "31.2K", delta: "+12.1%", icon: Heart },
  { label: "Shares", value: "4,820", delta: "+6.8%", icon: Share2 },
  { label: "Avg. CTR", value: "3.7%", delta: "+0.4pt", icon: TrendingUp },
];

const bars = [42, 58, 36, 71, 64, 88, 76, 95, 80, 62, 74, 90];
const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];

function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Analytics" description="How your AI-driven content is performing across channels." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="border-border/60 shadow-[var(--shadow-card)]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{m.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{m.value}</p>
                  <p className="mt-1 text-xs text-[var(--success)]">{m.delta} vs last period</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <m.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 shadow-[var(--shadow-card)] lg:col-span-2">
          <CardHeader>
            <CardTitle>Reach over time</CardTitle>
            <CardDescription>Monthly impressions across all platforms.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end gap-3">
              {bars.map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-[var(--gradient-primary)] transition-all hover:opacity-90"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{months[i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Top Platforms</CardTitle>
            <CardDescription>Engagement share this month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Instagram", pct: 42 },
              { name: "LinkedIn", pct: 28 },
              { name: "Twitter / X", pct: 18 },
              { name: "Facebook", pct: 12 },
            ].map((p) => (
              <div key={p.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground">{p.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-[var(--gradient-primary)]" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}