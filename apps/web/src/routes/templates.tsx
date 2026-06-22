import { createFileRoute } from "@tanstack/react-router";
import { Plus, LayoutTemplate } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getContentTemplates } from "@/services/api";

export const Route = createFileRoute("/templates")({
  head: () => ({ meta: [{ title: "Templates — BuildHerAI" }] }),
  loader: async () => {
    try {
      return {
        templates: await getContentTemplates(),
        templatesError: false,
      };
    } catch {
      return {
        templates: [],
        templatesError: true,
      };
    }
  },
  component: TemplatesPage,
});

function toLabel(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function TemplatesPage() {
  const { templates, templatesError } = Route.useLoaderData();

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
      {templatesError ? (
        <Card className="mb-4 border-border/60 shadow-[var(--shadow-card)]">
          <CardContent className="py-6 text-sm text-muted-foreground">
            Unable to load templates right now.
          </CardContent>
        </Card>
      ) : null}
      {!templates.length && !templatesError ? (
        <Card className="mb-4 border-border/60 shadow-[var(--shadow-card)]">
          <CardContent className="py-6 text-sm text-muted-foreground">
            No content templates found yet.
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="border-border/60 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/40">
            <CardContent className="p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--gradient-soft)] text-primary">
                <LayoutTemplate className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{template.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {toLabel(template.platform)} · {toLabel(template.template_type)}
              </p>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                {template.prompt_template}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="outline" className="rounded-full border-transparent bg-secondary text-secondary-foreground">
                  {toLabel(template.template_type)}
                </Badge>
                <Button size="sm" variant="ghost" className="text-primary">
                  Use template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}