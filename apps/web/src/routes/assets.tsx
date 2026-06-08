import { createFileRoute } from "@tanstack/react-router";
import { Upload, ImageIcon, FileText, Film } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/assets")({
  head: () => ({ meta: [{ title: "Assets — BuildHerAI" }] }),
  component: AssetsPage,
});

const assets = Array.from({ length: 12 }).map((_, i) => ({
  name: ["Summit Poster.png", "Hack Night Reel.mp4", "Brand Guide.pdf", "Mentor Quote.png"][i % 4],
  type: ["image", "video", "doc", "image"][i % 4],
  size: ["1.2 MB", "18.4 MB", "640 KB", "920 KB"][i % 4],
}));

const iconFor = (t: string) => (t === "image" ? ImageIcon : t === "video" ? Film : FileText);

function AssetsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Assets"
        description="Posters, videos and brand files ready to power your campaigns."
        actions={
          <Button className="rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)] hover:opacity-95">
            <Upload className="h-4 w-4" /> Upload Asset
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {assets.map((a, i) => {
          const Icon = iconFor(a.type);
          return (
            <Card key={i} className="overflow-hidden border-border/60 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/40">
              <div className="flex aspect-[4/3] items-center justify-center bg-[var(--gradient-soft)]">
                <Icon className="h-10 w-10 text-primary/70" />
              </div>
              <CardContent className="p-4">
                <p className="truncate text-sm font-medium">{a.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground capitalize">{a.type} · {a.size}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}