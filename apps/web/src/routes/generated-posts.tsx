import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Edit3,
  Facebook,
  Instagram,
  Linkedin,
  RotateCw,
  Twitter,
} from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { SvgViewer } from "@/components/svg-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  approveGeneratedPost,
  getAssetRenderUrl,
  getGeneratedPosts,
  isSvgAsset,
  regenerateGeneratedPostDesign,
  type GeneratedPostItem,
  updateGeneratedPost,
} from "@/services/api";

export const Route = createFileRoute("/generated-posts")({
  head: () => ({ meta: [{ title: "Generated Posts — BuildHerAI" }] }),
  component: GeneratedPostsPage,
});

const platformMeta = {
  instagram: { label: "Instagram", icon: Instagram },
  linkedin: { label: "LinkedIn", icon: Linkedin },
  twitter: { label: "Twitter / X", icon: Twitter },
  "twitter / x": { label: "Twitter / X", icon: Twitter },
  facebook: { label: "Facebook", icon: Facebook },
} as const;

function normalizePlatform(platform: string) {
  return platform.trim().toLowerCase();
}

function getPlatformMeta(platform: string) {
  return (
    platformMeta[normalizePlatform(platform) as keyof typeof platformMeta] ?? {
      label: platform,
      icon: Instagram,
    }
  );
}

function formatStatus(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "approved") {
    return "Approved";
  }

  if (normalized === "pending") {
    return "Pending";
  }

  if (normalized === "published") {
    return "Published";
  }

  return "Draft";
}

function formatCreatedAt(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Auto-drafted";
  }

  return `Auto-drafted · ${date.toLocaleString()}`;
}

function statusClass(s: string) {
  if (s === "Approved") {
    return "bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-[var(--success)]";
  }

  if (s === "Pending") {
    return "bg-[color-mix(in_oklab,var(--warning)_22%,transparent)] text-[var(--warning)]";
  }

  if (s === "Published") return "bg-primary-soft text-primary";
  return "bg-muted text-muted-foreground";
}

type GeneratedPostCardProps = {
  post: GeneratedPostItem;
  onSave: (post: GeneratedPostItem, content: string) => Promise<void>;
  onApprove: (post: GeneratedPostItem) => Promise<void>;
  onRegenerate: (post: GeneratedPostItem) => Promise<void>;
  isSaving: boolean;
  isApproving: boolean;
  isRegenerating: boolean;
};

function GeneratedPostCard({
  post,
  onSave,
  onApprove,
  onRegenerate,
  isSaving,
  isApproving,
  isRegenerating,
}: GeneratedPostCardProps) {
  const meta = getPlatformMeta(post.platform);
  const Icon = meta.icon;
  const status = formatStatus(post.status);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(post.content);
  const previewUrl =
    post.asset_id && post.file_url && post.asset_type
      ? getAssetRenderUrl({
          id: post.asset_id,
          asset_type: post.asset_type,
          file_url: post.file_url,
          signed_file_url: post.signed_file_url ?? null,
        })
      : null;

  return (
    <Card className="border-border/60 shadow-(--shadow-card) transition-all hover:border-primary/40">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{meta.label}</p>
              <p className="text-xs text-muted-foreground">
                {formatCreatedAt(post.created_at)}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`rounded-full border-transparent ${statusClass(status)}`}
          >
            {status}
          </Badge>
        </div>
        {previewUrl ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
            {isSvgAsset({
              asset_type: post.asset_type,
              file_url: post.file_url,
              signed_file_url: post.signed_file_url,
            }) ? (
              <div className="h-56 w-full">
                <SvgViewer
                  src={previewUrl}
                  title={post.asset_name || "Generated design preview"}
                />
              </div>
            ) : (
              <img
                src={previewUrl}
                alt={post.asset_name || "Generated design preview"}
                className="h-56 w-full object-cover"
              />
            )}
          </div>
        ) : null}
        {isEditing ? (
          <div className="mt-4 space-y-3">
            <Textarea
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              rows={8}
              className="rounded-xl"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="rounded-lg"
                onClick={async () => {
                  await onSave(post, draftContent);
                  setIsEditing(false);
                }}
                disabled={isSaving || !draftContent.trim()}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
                onClick={() => {
                  setDraftContent(post.content);
                  setIsEditing(false);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-4 line-clamp-4 rounded-xl bg-muted/50 p-4 text-sm text-foreground/90">
            {post.content}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-lg"
            onClick={() => setIsEditing(true)}
            disabled={isSaving || isApproving || isRegenerating}
          >
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            size="sm"
            className="rounded-lg bg-success text-white hover:opacity-90"
            onClick={() => onApprove(post)}
            disabled={
              isSaving || isApproving || isRegenerating || status === "Approved"
            }
          >
            <Check className="h-3.5 w-3.5" />
            {isApproving ? "Approving..." : "Approve"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-lg text-primary"
            onClick={() => onRegenerate(post)}
            disabled={isSaving || isApproving || isRegenerating}
          >
            <RotateCw className="h-3.5 w-3.5" />
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GeneratedPostsPage() {
  const queryClient = useQueryClient();
  const postsQuery = useQuery({
    queryKey: ["generated-posts"],
    queryFn: getGeneratedPosts,
  });
  const [pageMessage, setPageMessage] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateGeneratedPost(id, { content }),
    onSuccess: () => {
      setPageMessage("Generated post updated.");
      void queryClient.invalidateQueries({ queryKey: ["generated-posts"] });
    },
    onError: () => {
      setPageMessage("Unable to update generated post right now.");
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveGeneratedPost(id),
    onSuccess: () => {
      setPageMessage("Generated post approved.");
      void queryClient.invalidateQueries({ queryKey: ["generated-posts"] });
    },
    onError: () => {
      setPageMessage("Unable to approve generated post right now.");
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: (post: GeneratedPostItem) =>
      regenerateGeneratedPostDesign(post.id, {
        event_title: post.asset_name ?? undefined,
      }),
    onSuccess: () => {
      setPageMessage("Design regenerated and linked to the post.");
      void queryClient.invalidateQueries({ queryKey: ["generated-posts"] });
    },
    onError: () => {
      setPageMessage("Unable to regenerate design right now.");
    },
  });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Generated Posts"
        description="Review, edit and approve AI-drafted content before it ships."
      />

      {pageMessage ? (
        <Card className="mb-4 border-border/60 shadow-(--shadow-card)">
          <CardContent className="p-4 text-sm text-muted-foreground">
            {pageMessage}
          </CardContent>
        </Card>
      ) : null}

      {postsQuery.isLoading ? (
        <Card className="border-border/60 shadow-(--shadow-card)">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Loading generated posts...
          </CardContent>
        </Card>
      ) : null}

      {postsQuery.isError ? (
        <Card className="border-border/60 shadow-(--shadow-card)">
          <CardContent className="p-6 text-sm text-destructive">
            Failed to load generated posts from the API.
          </CardContent>
        </Card>
      ) : null}

      {!postsQuery.isLoading &&
      !postsQuery.isError &&
      !postsQuery.data?.length ? (
        <Card className="border-border/60 shadow-(--shadow-card)">
          <CardContent className="p-6 text-sm text-muted-foreground">
            No generated posts have been saved yet.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {postsQuery.data?.map((post) => (
          <GeneratedPostCard
            key={post.id}
            post={post}
            onSave={async (currentPost, content) => {
              await saveMutation.mutateAsync({
                id: currentPost.id,
                content,
              });
            }}
            onApprove={async (currentPost) => {
              await approveMutation.mutateAsync(currentPost.id);
            }}
            onRegenerate={async (currentPost) => {
              await regenerateMutation.mutateAsync(currentPost);
            }}
            isSaving={
              saveMutation.isPending && saveMutation.variables?.id === post.id
            }
            isApproving={
              approveMutation.isPending && approveMutation.variables === post.id
            }
            isRegenerating={
              regenerateMutation.isPending &&
              regenerateMutation.variables?.id === post.id
            }
          />
        ))}
      </div>
    </div>
  );
}
