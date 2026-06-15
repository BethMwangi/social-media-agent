import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Palette,
  Save,
  Sparkles,
  Twitter,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/page-header";
import {
  useAssets,
  useBrandSettings,
  useGenerateCampaign,
  useHashtags,
  useOrganization,
} from "@/hooks/use-campaign-creator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  createGeneratedPost,
  type AssetItem,
  type GenerateCampaignResult,
} from "@/services/api";

export const Route = createFileRoute("/ai-generator")({
  head: () => ({ meta: [{ title: "Campaign Creator Agent — BuildHerAI" }] }),
  component: AIGeneratorPage,
});

const campaignTypes = [
  {
    value: "event_promotion",
    label: "Event Promotion",
    description: "Promote upcoming events, sessions, and activations.",
  },
  {
    value: "cohort_recruitment",
    label: "Cohort Recruitment",
    description: "Drive applications and signups for a new cohort.",
  },
  {
    value: "community_update",
    label: "Community Update",
    description: "Share milestones, announcements, and internal news.",
  },
  {
    value: "founder_story",
    label: "Founder Story",
    description: "Spotlight founders and member wins.",
  },
  {
    value: "partner_announcement",
    label: "Partner Announcement",
    description: "Introduce partners, sponsors, and collaborators.",
  },
  {
    value: "workshop",
    label: "Workshop",
    description: "Promote practical learning sessions and office hours.",
  },
  {
    value: "hackathon",
    label: "Hackathon",
    description: "Build momentum for hackathons and build sprints.",
  },
];

const stepLabels = [
  "Campaign Type",
  "Details",
  "Context & Template",
  "Generated Content",
];

const templateCategoryMap: Record<string, string> = {
  event_promotion: "event_poster",
  cohort_recruitment: "cohort_recruitment",
  community_update: "community_update",
  founder_story: "founder_story",
  partner_announcement: "partner_announcement",
  workshop: "workshop",
  hackathon: "hackathon",
};

const platformMeta = {
  instagram: { label: "Instagram", icon: Instagram },
  linkedin: { label: "LinkedIn", icon: Linkedin },
  twitter: { label: "Twitter / X", icon: Twitter },
  facebook: { label: "Facebook", icon: Facebook },
};

type EditableGeneratedContent = {
  instagramCaption: string;
  linkedinPost: string;
  twitterPost: string;
  posterInstructions: string;
  generatedImagePrompt: string;
  aiReasoning: string;
};

function initialEditableContent(
  result: GenerateCampaignResult,
): EditableGeneratedContent {
  return {
    instagramCaption: result.instagram_caption,
    linkedinPost: result.linkedin_post,
    twitterPost: result.twitter_post,
    posterInstructions: result.poster_instructions,
    generatedImagePrompt: result.generated_image_prompt,
    aiReasoning: result.ai_reasoning,
  };
}

function TemplatePreview({ asset }: { asset: AssetItem }) {
  const previewUrl = asset.signed_file_url || asset.file_url;

  if (asset.asset_type === "image" && previewUrl) {
    return (
      <img
        src={previewUrl}
        alt={asset.name ?? "Template preview"}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-primary-soft text-primary">
      <Sparkles className="h-5 w-5" />
    </div>
  );
}

function AIGeneratorPage() {
  const [step, setStep] = useState(0);
  const [campaignType, setCampaignType] = useState("event_promotion");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [description, setDescription] = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] =
    useState<GenerateCampaignResult | null>(null);
  const [editableContent, setEditableContent] =
    useState<EditableGeneratedContent | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);

  const organizationQuery = useOrganization("buildherai-labs");
  const organizationId = organizationQuery.data?.id ?? null;
  const brandSettingsQuery = useBrandSettings(organizationId);
  const hashtagsQuery = useHashtags(organizationId);
  const templatesQuery = useAssets({
    organizationId,
    platform: "instagram",
    templateCategory: templateCategoryMap[campaignType],
  });
  const generateCampaignMutation = useGenerateCampaign();
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (!editableContent) {
        throw new Error("No generated content available.");
      }

      return Promise.all([
        createGeneratedPost({
          organization_id: organizationId ?? undefined,
          asset_id:
            generatedResult?.generated_design_asset?.id ??
            selectedAssetId ??
            undefined,
          platform: "instagram",
          content: editableContent.instagramCaption,
          status: "draft",
          generated_by: "ai",
          ai_model: generatedResult?.ai_model ?? undefined,
        }),
        createGeneratedPost({
          organization_id: organizationId ?? undefined,
          asset_id:
            generatedResult?.generated_design_asset?.id ??
            selectedAssetId ??
            undefined,
          platform: "linkedin",
          content: editableContent.linkedinPost,
          status: "draft",
          generated_by: "ai",
          ai_model: generatedResult?.ai_model ?? undefined,
        }),
        createGeneratedPost({
          organization_id: organizationId ?? undefined,
          asset_id:
            generatedResult?.generated_design_asset?.id ??
            selectedAssetId ??
            undefined,
          platform: "twitter",
          content: editableContent.twitterPost,
          status: "draft",
          generated_by: "ai",
          ai_model: generatedResult?.ai_model ?? undefined,
        }),
      ]);
    },
    onSuccess: () => {
      setPageMessage("Saved Instagram, LinkedIn, and Twitter drafts.");
    },
    onError: () => {
      setPageMessage("Unable to save drafts right now.");
    },
  });

  const selectedTemplate = useMemo(
    () =>
      templatesQuery.data?.find((asset) => asset.id === selectedAssetId) ??
      null,
    [selectedAssetId, templatesQuery.data],
  );

  const progressValue = ((step + 1) / stepLabels.length) * 100;
  const isContextLoading =
    organizationQuery.isLoading ||
    brandSettingsQuery.isLoading ||
    hashtagsQuery.isLoading ||
    templatesQuery.isLoading;
  const canContinueFromStepTwo =
    Boolean(title.trim()) && Boolean(date) && Boolean(description.trim());
  const canGenerate = Boolean(
    organizationId && selectedAssetId && canContinueFromStepTwo,
  );
  const tagsPreview =
    hashtagsQuery.data?.map((item) => item.tag).join(" ") ?? "";

  const queryError =
    organizationQuery.error ||
    brandSettingsQuery.error ||
    hashtagsQuery.error ||
    templatesQuery.error;
  const usesAnthropic = generatedResult?.generation_mode === "anthropic";
  const generatedDesignAsset = generatedResult?.generated_design_asset ?? null;
  const designWasGenerated =
    generatedResult?.design_generation_mode === "openai-image";

  async function handleGenerateCampaign() {
    if (!organizationId || !selectedAssetId) {
      setPageMessage("Choose a template before generating content.");
      return;
    }

    setPageMessage(null);

    try {
      const result = await generateCampaignMutation.mutateAsync({
        campaign_type: campaignType,
        platform: "instagram",
        organization_id: organizationId,
        selected_asset_id: selectedAssetId,
        event: {
          title: title.trim(),
          date,
          location: location.trim(),
          registration_url: registrationUrl.trim(),
          description: description.trim(),
        },
        extra_context: extraContext.trim(),
      });

      setGeneratedResult(result);
      setEditableContent(initialEditableContent(result));
      setStep(3);
    } catch {
      setPageMessage("Unable to generate campaign content right now.");
    }
  }

  function nextStep() {
    if (step === 1 && !canContinueFromStepTwo) {
      setPageMessage("Complete the campaign details before continuing.");
      return;
    }

    setPageMessage(null);
    setStep((current) => Math.min(current + 1, stepLabels.length - 1));
  }

  function previousStep() {
    setPageMessage(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Campaign Creator Agent"
        description="Build a campaign from organization context, brand rules, hashtags, and poster templates before the AI writes a single caption."
      />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="border-border/60 shadow-(--shadow-card) xl:sticky xl:top-24 xl:self-start">
          <CardHeader>
            <CardTitle>Workflow Progress</CardTitle>
            <CardDescription>
              Move from campaign setup to AI-generated content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Progress value={progressValue} />
            <div className="grid gap-3">
              {stepLabels.map((label, index) => {
                const isActive = step === index;
                const isComplete = step > index;

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setStep(index)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                      isActive
                        ? "border-primary bg-primary-soft"
                        : isComplete
                          ? "border-primary/30 bg-background"
                          : "border-border/60 bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          Step {index + 1}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {label}
                        </p>
                      </div>
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
              {queryError
                ? "Some organization context could not be loaded. Generation will stay blocked until the API data is available."
                : "The agent will automatically pull organization mission, brand tone, hashtags, and matching poster templates before generation."}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {pageMessage ? (
            <Card className="border-border/60 shadow-(--shadow-card)">
              <CardContent className="py-4 text-sm text-muted-foreground">
                {pageMessage}
              </CardContent>
            </Card>
          ) : null}

          {step === 0 ? (
            <Card className="border-border/60 shadow-(--shadow-card)">
              <CardHeader>
                <CardTitle>Select Campaign Type</CardTitle>
                <CardDescription>
                  Choose the campaign the agent should build.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {campaignTypes.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setCampaignType(option.value);
                      setSelectedAssetId(null);
                      setGeneratedResult(null);
                      setEditableContent(null);
                    }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      campaignType === option.value
                        ? "border-primary bg-primary-soft shadow-(--shadow-glow)"
                        : "border-border/60 bg-background hover:border-primary/40"
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {option.label}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {step === 1 ? (
            <Card className="border-border/60 shadow-(--shadow-card)">
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>
                  This form is optimized for event-style campaigns and also
                  works for workshops, hackathons, and recruitment pushes.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="campaign-title">Title</Label>
                  <Input
                    id="campaign-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="AI Hack Night Lagos"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-date">Date</Label>
                  <Input
                    id="campaign-date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-location">Location</Label>
                  <Input
                    id="campaign-location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Lagos, Nigeria"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="campaign-registration-url">
                    Registration URL
                  </Label>
                  <Input
                    id="campaign-registration-url"
                    value={registrationUrl}
                    onChange={(event) => setRegistrationUrl(event.target.value)}
                    placeholder="https://buildherai-labs.com/register"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="campaign-description">Description</Label>
                  <Textarea
                    id="campaign-description"
                    rows={5}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the event, offer, or announcement the campaign needs to communicate."
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="campaign-extra-context">Extra Context</Label>
                  <Textarea
                    id="campaign-extra-context"
                    rows={3}
                    value={extraContext}
                    onChange={(event) => setExtraContext(event.target.value)}
                    placeholder="e.g. emphasize free entry, mention sponsor support, highlight limited seats"
                    className="rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <Card className="border-border/60 shadow-(--shadow-card)">
                <CardHeader>
                  <CardTitle>Organization Context</CardTitle>
                  <CardDescription>
                    The agent retrieves this before generation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <BrainCircuit className="h-4 w-4 text-primary" />
                      Mission & Purpose
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {organizationQuery.data?.mission || "Loading mission..."}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {organizationQuery.data?.purpose || "Loading purpose..."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-primary" />
                      Audience
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {organizationQuery.data?.audience ||
                        "Loading audience..."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Palette className="h-4 w-4 text-primary" />
                      Brand Rules
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tone: {brandSettingsQuery.data?.tone || "Loading tone..."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        brandSettingsQuery.data?.primary_color,
                        brandSettingsQuery.data?.secondary_color,
                        brandSettingsQuery.data?.accent_color,
                      ]
                        .filter(Boolean)
                        .map((color) => (
                          <span
                            key={color}
                            className="h-8 w-8 rounded-full border border-border/60"
                            style={{ backgroundColor: color! }}
                          />
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Font:{" "}
                      {brandSettingsQuery.data?.font_family ||
                        "Loading font..."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Hashtags</p>
                    <p className="text-sm text-muted-foreground">
                      {tagsPreview || "Loading hashtags..."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-(--shadow-card)">
                <CardHeader>
                  <CardTitle>Choose Instagram Template</CardTitle>
                  <CardDescription>
                    Matching templates are filtered from assets using the active
                    campaign type.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isContextLoading ? (
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
                      Loading organization context and poster templates...
                    </div>
                  ) : null}
                  {!isContextLoading && !templatesQuery.data?.length ? (
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
                      No templates found for this campaign type yet. Upload an
                      Instagram template asset tagged with
                      <span className="mx-1 font-medium text-foreground">
                        {templateCategoryMap[campaignType]}
                      </span>
                      to continue.
                    </div>
                  ) : null}
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {templatesQuery.data?.map((asset) => {
                      const isSelected = asset.id === selectedAssetId;

                      return (
                        <button
                          key={asset.id}
                          type="button"
                          onClick={() => setSelectedAssetId(asset.id)}
                          className={`overflow-hidden rounded-2xl border text-left transition-all ${
                            isSelected
                              ? "border-primary shadow-(--shadow-glow)"
                              : "border-border/60 hover:border-primary/40"
                          }`}
                        >
                          <div className="aspect-4/3 overflow-hidden bg-muted/40">
                            <TemplatePreview asset={asset} />
                          </div>
                          <div className="space-y-2 p-4">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-foreground">
                                {asset.name || "Instagram template"}
                              </p>
                              {isSelected ? (
                                <Badge
                                  variant="outline"
                                  className="border-primary text-primary"
                                >
                                  Selected
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground capitalize">
                              {asset.platform || "instagram"}
                              {asset.dimensions ? ` · ${asset.dimensions}` : ""}
                            </p>
                            {asset.description ? (
                              <p className="line-clamp-2 text-xs text-muted-foreground">
                                {asset.description}
                              </p>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {step === 3 ? (
            <Card className="border-border/60 shadow-(--shadow-card)">
              <CardHeader>
                <CardTitle>Generated Campaign</CardTitle>
                <CardDescription>
                  Review the selected template, AI reasoning, and editable copy
                  across channels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {selectedTemplate?.name || "No template selected"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {generatedResult?.template_recommendation.reason ||
                        "Pick a template and generate to see why the agent chose it."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full">
                      {usesAnthropic
                        ? `AI: ${generatedResult?.ai_model || "Anthropic"}`
                        : "AI: fallback generator"}
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      {designWasGenerated
                        ? "Design: OpenAI image generated"
                        : generatedResult?.design_generation_mode ===
                            "not_configured"
                          ? "Design: image AI not configured"
                          : generatedResult?.design_generation_mode === "failed"
                            ? "Design: generation failed"
                            : "Design: template preview only"}
                    </Badge>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={handleGenerateCampaign}
                      disabled={
                        generateCampaignMutation.isPending || !canGenerate
                      }
                    >
                      <Sparkles className="h-4 w-4" />
                      {generateCampaignMutation.isPending
                        ? "Generating..."
                        : generatedResult
                          ? "Regenerate"
                          : "Generate Campaign"}
                    </Button>
                    <Button
                      className="rounded-xl bg-foreground text-background hover:bg-foreground/90"
                      onClick={() => saveDraftMutation.mutate()}
                      disabled={!editableContent || saveDraftMutation.isPending}
                    >
                      <Save className="h-4 w-4" />
                      {saveDraftMutation.isPending ? "Saving..." : "Save Draft"}
                    </Button>
                  </div>
                </div>

                {generatedResult && editableContent ? (
                  <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <Card className="border-border/60 shadow-none">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-base">
                          Design Output
                        </CardTitle>
                        <CardDescription>
                          {designWasGenerated
                            ? "A new AI-generated poster has been created and saved into assets."
                            : "No new poster file was created for this run. The panel below shows the selected template and the design instructions used for generation."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 px-0 pb-0">
                        <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/30">
                          <div className="aspect-4/3 overflow-hidden bg-muted/40">
                            {generatedDesignAsset ? (
                              <TemplatePreview asset={generatedDesignAsset} />
                            ) : selectedTemplate ? (
                              <TemplatePreview asset={selectedTemplate} />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                No template selected
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
                          <p className="text-sm font-medium text-foreground">
                            What exists right now
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {designWasGenerated
                              ? "The visible design is a newly generated poster image saved in assets. You can reuse it later like any other uploaded asset."
                              : "The visible design is the existing selected template stored in assets. The generated output below is the design brief and prompt, not a newly rendered poster image."}
                          </p>
                          {generatedResult?.generation_error ? (
                            <p className="text-sm text-destructive">
                              Copy AI fallback reason:{" "}
                              {generatedResult.generation_error}
                            </p>
                          ) : null}
                          {generatedResult?.design_generation_error ? (
                            <p className="text-sm text-destructive">
                              {generatedResult.design_generation_error}
                            </p>
                          ) : null}
                        </div>
                        <div className="space-y-2">
                          <Label>Generated Image Prompt</Label>
                          <Textarea
                            value={editableContent.generatedImagePrompt}
                            onChange={(event) =>
                              setEditableContent((current) =>
                                current
                                  ? {
                                      ...current,
                                      generatedImagePrompt: event.target.value,
                                    }
                                  : current,
                              )
                            }
                            rows={8}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Poster Instructions</Label>
                          <Textarea
                            value={editableContent.posterInstructions}
                            onChange={(event) =>
                              setEditableContent((current) =>
                                current
                                  ? {
                                      ...current,
                                      posterInstructions: event.target.value,
                                    }
                                  : current,
                              )
                            }
                            rows={8}
                            className="rounded-xl"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Tabs defaultValue="instagram" className="w-full">
                      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
                        <TabsTrigger value="instagram">
                          Instagram Caption
                        </TabsTrigger>
                        <TabsTrigger value="linkedin">
                          LinkedIn Post
                        </TabsTrigger>
                        <TabsTrigger value="twitter">Twitter Post</TabsTrigger>
                        <TabsTrigger value="reasoning">
                          AI Reasoning
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="instagram">
                        <Card className="border-border/60 shadow-none">
                          <CardContent className="space-y-4 p-0 pt-4">
                            <Textarea
                              value={editableContent.instagramCaption}
                              onChange={(event) =>
                                setEditableContent((current) =>
                                  current
                                    ? {
                                        ...current,
                                        instagramCaption: event.target.value,
                                      }
                                    : current,
                                )
                              }
                              rows={12}
                              className="rounded-xl"
                            />
                            <div className="flex flex-wrap gap-2">
                              {(generatedResult.hashtags || []).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="rounded-full"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      <TabsContent value="linkedin">
                        <Textarea
                          value={editableContent.linkedinPost}
                          onChange={(event) =>
                            setEditableContent((current) =>
                              current
                                ? {
                                    ...current,
                                    linkedinPost: event.target.value,
                                  }
                                : current,
                            )
                          }
                          rows={12}
                          className="rounded-xl"
                        />
                      </TabsContent>
                      <TabsContent value="twitter">
                        <Textarea
                          value={editableContent.twitterPost}
                          onChange={(event) =>
                            setEditableContent((current) =>
                              current
                                ? {
                                    ...current,
                                    twitterPost: event.target.value,
                                  }
                                : current,
                            )
                          }
                          rows={10}
                          className="rounded-xl"
                        />
                      </TabsContent>
                      <TabsContent value="reasoning">
                        <Textarea
                          value={editableContent.aiReasoning}
                          onChange={(event) =>
                            setEditableContent((current) =>
                              current
                                ? {
                                    ...current,
                                    aiReasoning: event.target.value,
                                  }
                                : current,
                            )
                          }
                          rows={10}
                          className="rounded-xl"
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-muted/30 px-6 text-center text-sm text-muted-foreground">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    Generate the campaign after selecting a template to see
                    captions, instructions, and AI reasoning.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={previousStep}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>

            {step < 2 ? (
              <Button className="rounded-xl" onClick={nextStep}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : step === 2 ? (
              <Button
                className="rounded-xl bg-(--gradient-primary) shadow-(--shadow-glow) hover:opacity-95"
                onClick={handleGenerateCampaign}
                disabled={generateCampaignMutation.isPending || !canGenerate}
              >
                <Sparkles className="h-4 w-4" />
                {generateCampaignMutation.isPending
                  ? "Generating..."
                  : "Generate Campaign"}
              </Button>
            ) : (
              <Button
                className="rounded-xl"
                onClick={() => setStep(2)}
                variant="outline"
              >
                Back to Template Selection
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/60 shadow-(--shadow-card)">
              <CardContent className="flex items-start gap-3 p-5">
                <CalendarDays className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Campaign Snapshot
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {title || "Add a title"}
                    {date ? ` · ${date}` : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-(--shadow-card)">
              <CardContent className="flex items-start gap-3 p-5">
                <Palette className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Brand Tone
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {brandSettingsQuery.data?.tone || "Loading brand tone..."}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-(--shadow-card)">
              <CardContent className="flex items-start gap-3 p-5">
                <BrainCircuit className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Distribution Targets
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["instagram", "linkedin", "twitter"] as const).map(
                      (platform) => {
                        const Icon = platformMeta[platform].icon;

                        return (
                          <Badge
                            key={platform}
                            variant="outline"
                            className="rounded-full"
                          >
                            <Icon className="mr-1 h-3.5 w-3.5" />
                            {platformMeta[platform].label}
                          </Badge>
                        );
                      },
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
