import { createFileRoute } from "@tanstack/react-router";
import { Edit3, Check, RotateCw, Instagram, Linkedin, Twitter, Facebook } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/generated-posts")({
  head: () => ({ meta: [{ title: "Generated Posts — BuildHerAI" }] }),
  component: GeneratedPostsPage,
});

const posts = [
  { platform: "Instagram", icon: Instagram, preview: "✨ Calling all builders! Join us at AI Hack Night Lagos this Friday — pitch, prototype, and meet the women shaping Africa's AI future. #BuildHerAI", status: "Pending" },
  { platform: "LinkedIn", icon: Linkedin, preview: "We're proud to announce Cohort 12 of Build Week — 6 days of intensive AI product building for women founders across the continent. Applications close June 8.", status: "Approved" },
  { platform: "Twitter / X", icon: Twitter, preview: "Mentor Spotlight: Meet Dr. Amara, leading ML researcher and BuildHerAI mentor. Office hours open Friday 4PM WAT 💜", status: "Pending" },
  { platform: "Facebook", icon: Facebook, preview: "Our AI Ethics Roundtable returns this July — join community leaders for an honest conversation on responsible AI in Africa.", status: "Draft" },
  { platform: "Instagram", icon: Instagram, preview: "Founder Stories Vol. 3 is live! Read how Zainab turned a weekend hack into a 10k-user product. Link in bio.", status: "Approved" },
];

function statusClass(s: string) {
  if (s === "Approved") return "bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-[var(--success)]";
  if (s === "Pending") return "bg-[color-mix(in_oklab,var(--warning)_22%,transparent)] text-[var(--warning)]";
  return "bg-muted text-muted-foreground";
}

function GeneratedPostsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Generated Posts"
        description="Review, edit and approve AI-drafted content before it ships."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {posts.map((p, i) => (
          <Card key={i} className="border-border/60 shadow-[var(--shadow-card)] transition-all hover:border-primary/40">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{p.platform}</p>
                    <p className="text-xs text-muted-foreground">Auto-drafted · 2 min ago</p>
                  </div>
                </div>
                <Badge variant="outline" className={`rounded-full border-transparent ${statusClass(p.status)}`}>{p.status}</Badge>
              </div>
              <p className="mt-4 line-clamp-4 rounded-xl bg-muted/50 p-4 text-sm text-foreground/90">{p.preview}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" className="rounded-lg"><Edit3 className="h-3.5 w-3.5" /> Edit</Button>
                <Button size="sm" className="rounded-lg bg-[var(--success)] text-white hover:opacity-90"><Check className="h-3.5 w-3.5" /> Approve</Button>
                <Button size="sm" variant="ghost" className="rounded-lg text-primary"><RotateCw className="h-3.5 w-3.5" /> Regenerate</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}