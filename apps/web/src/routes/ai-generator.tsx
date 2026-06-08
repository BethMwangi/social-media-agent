import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Sparkles, Save, Instagram, Linkedin, Twitter, Facebook } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/ai-generator")({
  head: () => ({ meta: [{ title: "AI Content Generator — BuildHerAI" }] }),
  component: AIGeneratorPage,
});

const platforms = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "twitter", label: "Twitter / X", icon: Twitter },
  { value: "facebook", label: "Facebook", icon: Facebook },
];

function AIGeneratorPage() {
  const [posterName, setPosterName] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string>("");

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPosterName(f.name);
  };

  const onGenerate = () => {
    setGenerated(
      "✨ Big news, BuildHer community! Our next AI Hack Night lands in Lagos this Friday — a night of building, pitching and meeting the women shaping Africa's AI future. Bring an idea, leave with a prototype. 💜\n\nRSVP via the link in bio. #BuildHerAI #WomenInAI #AIForAfrica"
    );
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="AI Content Generator"
        description="Upload a poster, choose a platform, and let the agent draft on-brand content."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-border/60 shadow-[var(--shadow-card)] lg:col-span-2">
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
            <CardDescription>Tell the agent what to work with.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Upload Poster</Label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-[var(--gradient-soft)] px-4 py-8 text-center transition-colors hover:border-primary/50">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-[var(--shadow-card)]">
                  <Upload className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">
                  {posterName ?? "Drop file or click to upload"}
                </span>
                <span className="text-xs text-muted-foreground">PNG, JPG up to 10MB</span>
                <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
              </label>
            </div>

            <div className="space-y-2">
              <Label>Select Platform</Label>
              <Select defaultValue="instagram">
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-2">
                        <p.icon className="h-4 w-4" /> {p.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Extra context (optional)</Label>
              <Textarea rows={3} className="rounded-xl" placeholder="e.g. emphasize free entry, mention partner sponsor..." />
            </div>

            <Button
              onClick={onGenerate}
              className="w-full rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)] hover:opacity-95"
            >
              <Sparkles className="h-4 w-4" /> Generate Content
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-card)] lg:col-span-3">
          <CardHeader>
            <CardTitle>Generated Content Preview</CardTitle>
            <CardDescription>Edit inline before saving or scheduling.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-5">
              {generated ? (
                <Textarea
                  value={generated}
                  onChange={(e) => setGenerated(e.target.value)}
                  rows={12}
                  className="resize-none rounded-xl border-border/60 bg-card text-sm leading-relaxed"
                />
              ) : (
                <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  Your generated caption will appear here.
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button variant="outline" className="rounded-xl">Regenerate</Button>
              <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
                <Save className="h-4 w-4" /> Save Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}