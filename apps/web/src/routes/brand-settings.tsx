import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/brand-settings")({
  head: () => ({ meta: [{ title: "Brand Settings — BuildHerAI" }] }),
  component: BrandSettingsPage,
});

const colors = [
  { name: "Primary", hex: "#6C63FF" },
  { name: "Secondary", hex: "#CBBEFF" },
  { name: "Accent", hex: "#FF6B8A" },
  { name: "Background", hex: "#FAFAFF" },
  { name: "Text", hex: "#1A1A2E" },
];

const hashtags = ["#BuildHerAI", "#WomenInAI", "#BuildHerLabs", "#AIForAfrica", "#CommunityBuilders"];

function BrandSettingsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Brand Settings"
        description="The foundation the AI agent uses to keep every post on-brand."
        actions={
          <Button className="rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)] hover:opacity-95">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        }
      />

      <div className="grid gap-6">
        <Card className="border-border/60 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
            <CardDescription>Core identity used in every generated post.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input defaultValue="BuildHerAI Labs" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input defaultValue="https://buildherai.com" className="rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Mission</Label>
              <Textarea rows={2} className="rounded-xl" defaultValue="To equip African women with the AI skills, community and capital to build the future." />
            </div>
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Textarea rows={3} className="rounded-xl" defaultValue="Bridge the gender gap in AI through hands-on programs, mentorship and storytelling." />
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Textarea rows={3} className="rounded-xl" defaultValue="Women technologists, founders, students and allies across Africa, ages 18–40." />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <CardDescription>Used by the agent for poster context and visual references.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
              {colors.map((c) => (
                <div key={c.name} className="rounded-xl border border-border/60 p-3">
                  <div className="h-16 rounded-lg shadow-inner" style={{ backgroundColor: c.hex }} />
                  <p className="mt-2 text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.hex}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Hashtags</CardTitle>
              <CardDescription>Always considered when drafting captions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((h) => (
                  <Badge key={h} variant="outline" className="rounded-full border-transparent bg-primary-soft text-primary">
                    {h}
                  </Badge>
                ))}
              </div>
              <Input placeholder="Add hashtag and press enter" className="mt-4 rounded-xl" />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Tone of Voice</CardTitle>
              <CardDescription>How posts should sound across every platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={6}
                className="rounded-xl"
                defaultValue="Warm, confident and inclusive. We speak peer-to-peer — never corporate. Celebrate wins, surface stories, and always invite the reader to take one clear next step."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}