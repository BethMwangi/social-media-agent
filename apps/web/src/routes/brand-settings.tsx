import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  createHashtag,
  getHashtags,
  getOrganization,
  type HashtagItem,
  type OrganizationBrandSettings,
} from "@/services/api";

export const Route = createFileRoute("/brand-settings")({
  head: () => ({ meta: [{ title: "Brand Settings — BuildHerAI" }] }),
  loader: async () => {
    try {
      const organization = await getOrganization("buildherai-labs");
      const brandSettings = organization.brand_settings[0] ?? null;

      try {
        const hashtags = await getHashtags(organization.id);

        return {
          organization,
          brandSettings,
          hashtags,
          organizationError: false,
          hashtagsError: false,
        };
      } catch {
        return {
          organization,
          brandSettings,
          hashtags: [],
          organizationError: false,
          hashtagsError: true,
        };
      }
    } catch {
      return {
        organization: null,
        brandSettings: null,
        hashtags: [],
        organizationError: true,
        hashtagsError: true,
      };
    }
  },
  component: BrandSettingsPage,
});

const DEFAULT_WEBSITE = "https://buildherai-labs.com";

function getColorSwatches(brandSettings: OrganizationBrandSettings | null) {
  return [
    {
      name: "Primary",
      hex: brandSettings?.primary_color ?? "#6C63FF",
    },
    {
      name: "Secondary",
      hex: brandSettings?.secondary_color ?? "#CBBEFF",
    },
    {
      name: "Accent",
      hex: brandSettings?.accent_color ?? "#FF6B8A",
    },
    {
      name: "Background",
      hex: brandSettings?.background_color ?? "#FAFAFF",
    },
    {
      name: "Text",
      hex: brandSettings?.text_color ?? "#1A1A2E",
    },
  ];
}

function toWebsite(email: string | null) {
  if (!email || !email.includes("@")) {
    return DEFAULT_WEBSITE;
  }

  return `https://${email.split("@")[1]}`;
}

function formatHashtag(tag: string) {
  return tag.startsWith("#") ? tag : `#${tag}`;
}

function normalizeHashtag(tag: string) {
  return tag.trim().replace(/^#+/, "").trim();
}

function sortHashtags(items: HashtagItem[]) {
  return [...items].sort((left, right) => left.tag.localeCompare(right.tag));
}

function BrandSettingsPage() {
  const {
    organization,
    brandSettings,
    hashtags,
    organizationError,
    hashtagsError,
  } = Route.useLoaderData();
  const [hashtagItems, setHashtagItems] = useState(() =>
    sortHashtags(hashtags),
  );
  const [newHashtag, setNewHashtag] = useState("");
  const [isCreatingHashtag, setIsCreatingHashtag] = useState(false);
  const [hashtagSubmitError, setHashtagSubmitError] = useState<string | null>(
    null,
  );
  const colors = getColorSwatches(brandSettings);

  async function handleHashtagKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();

    const tag = normalizeHashtag(newHashtag);

    if (!organization?.id || !tag || isCreatingHashtag) {
      return;
    }

    const exists = hashtagItems.some(
      (item) => normalizeHashtag(item.tag).toLowerCase() === tag.toLowerCase(),
    );

    if (exists) {
      setHashtagSubmitError("That hashtag already exists.");
      return;
    }

    setIsCreatingHashtag(true);
    setHashtagSubmitError(null);

    try {
      const createdHashtag = await createHashtag({
        organization_id: organization.id,
        tag,
      });

      setHashtagItems((current) => sortHashtags([...current, createdHashtag]));
      setNewHashtag("");
    } catch {
      setHashtagSubmitError("Unable to save hashtag right now.");
    } finally {
      setIsCreatingHashtag(false);
    }
  }

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
        {organizationError ? (
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardContent className="py-6 text-sm text-muted-foreground">
              Unable to load brand settings right now.
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-border/60 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
            <CardDescription>
              Core identity used in every generated post.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input
                defaultValue={organization?.name ?? "BuildHerAI Labs"}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                defaultValue={toWebsite(organization?.email ?? null)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Mission</Label>
              <Textarea
                rows={2}
                className="rounded-xl"
                defaultValue={
                  organization?.mission ??
                  "To equip African women with the AI skills, community and capital to build the future."
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Textarea
                rows={3}
                className="rounded-xl"
                defaultValue={
                  organization?.purpose ??
                  "Bridge the gender gap in AI through hands-on programs, mentorship and storytelling."
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Textarea
                rows={3}
                className="rounded-xl"
                defaultValue={
                  organization?.audience ??
                  "Women technologists, founders, students and allies across Africa, ages 18–40."
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <CardDescription>
              Used by the agent for poster context and visual references.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
              {colors.map((c) => (
                <div
                  key={c.name}
                  className="rounded-xl border border-border/60 p-3"
                >
                  <div
                    className="h-16 rounded-lg shadow-inner"
                    style={{ backgroundColor: c.hex }}
                  />
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
              <CardDescription>
                Always considered when drafting captions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {hashtagItems.map((hashtag) => (
                  <Badge
                    key={hashtag.id}
                    variant="outline"
                    className="rounded-full border-transparent bg-primary-soft text-primary"
                  >
                    {formatHashtag(hashtag.tag)}
                  </Badge>
                ))}
              </div>
              {!hashtagItems.length && !hashtagsError ? (
                <p className="text-sm text-muted-foreground">
                  No hashtags found.
                </p>
              ) : null}
              {hashtagsError ? (
                <p className="text-sm text-muted-foreground">
                  Unable to load hashtags right now.
                </p>
              ) : null}
              <Input
                placeholder="Add hashtag and press enter"
                className="mt-4 rounded-xl"
                value={newHashtag}
                onChange={(event) => {
                  setNewHashtag(event.target.value);
                  if (hashtagSubmitError) {
                    setHashtagSubmitError(null);
                  }
                }}
                onKeyDown={handleHashtagKeyDown}
                disabled={!organization?.id || isCreatingHashtag}
              />
              {hashtagSubmitError ? (
                <p className="mt-2 text-sm text-destructive">
                  {hashtagSubmitError}
                </p>
              ) : null}
              {isCreatingHashtag ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Saving hashtag...
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle>Tone of Voice</CardTitle>
              <CardDescription>
                How posts should sound across every platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={6}
                className="rounded-xl"
                defaultValue={
                  brandSettings?.tone ??
                  "Warm, confident and inclusive. We speak peer-to-peer — never corporate. Celebrate wins, surface stories, and always invite the reader to take one clear next step."
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
