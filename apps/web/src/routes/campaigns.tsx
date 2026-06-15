import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCampaigns, type CampaignItem } from "@/services/api";

export const Route = createFileRoute("/campaigns")({
  head: () => ({ meta: [{ title: "Campaigns — BuildHerAI" }] }),
  loader: async () => {
    try {
      const campaigns = await getCampaigns();

      return {
        campaigns,
        campaignsError: false,
      };
    } catch {
      return {
        campaigns: [],
        campaignsError: true,
      };
    }
  },
  component: CampaignsPage,
});

function statusClass(status: string) {
  switch (status) {
    case "Active":
      return "bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-[var(--success)]";
    case "Scheduled":
      return "bg-primary-soft text-primary";
    case "Draft":
      return "bg-muted text-muted-foreground";
    case "Completed":
      return "bg-secondary text-secondary-foreground";
    default:
      return "";
  }
}

function toDisplayStatus(status: string | null | undefined) {
  if (!status) {
    return "Unknown";
  }

  return status
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatCampaign(campaign: CampaignItem) {
  const createdAt = new Date(campaign.created_at);

  return {
    id: campaign.id,
    name: campaign.title,
    type: campaign.campaign_type ?? "Uncategorized",
    objective: campaign.objective ?? "No objective",
    status: toDisplayStatus(campaign.status),
    date: createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
  };
}

function CampaignsPage() {
  const { campaigns, campaignsError } = Route.useLoaderData();
  const formattedCampaigns = campaigns.map(formatCampaign);

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
              <Input
                placeholder="Search campaigns..."
                className="h-10 rounded-xl pl-9"
              />
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
              {formattedCampaigns.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.type}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.objective}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`rounded-full border-transparent ${statusClass(c.status)}`}
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {c.date}
                  </TableCell>
                </TableRow>
              ))}
              {!formattedCampaigns.length && !campaignsError ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    No campaigns found.
                  </TableCell>
                </TableRow>
              ) : null}
              {campaignsError ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    Unable to load campaigns right now.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
