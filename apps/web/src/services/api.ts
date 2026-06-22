const API_URL = "http://127.0.0.1:8000/api/v1";

export type OrganizationBrandSettings = {
  id: string;
  organization_id: string;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  background_color: string | null;
  text_color: string | null;
  font_family: string | null;
  logo_url: string | null;
  tone: string | null;
};

export type CampaignEventInput = {
  title: string;
  date: string;
  location?: string;
  registration_url?: string;
  description: string;
};

export type TemplateRecommendation = {
  asset_id: string;
  name: string;
  reason: string;
  file_url?: string | null;
};

export type GenerateCampaignPayload = {
  campaign_type: string;
  platform: string;
  organization_id: string;
  selected_asset_id: string;
  event: CampaignEventInput;
  extra_context?: string;
};

export type GenerateCampaignResult = {
  caption: string;
  short_caption: string;
  hashtags: string[];
  call_to_action: string;
  generation_mode: string;
  ai_model?: string | null;
  generation_error?: string | null;
  design_generation_mode: string;
  design_generation_error?: string | null;
  generated_design_asset?: AssetItem | null;
  template_recommendation: TemplateRecommendation;
  generated_image_prompt: string;
  instagram_caption: string;
  linkedin_post: string;
  twitter_post: string;
  poster_instructions: string;
  ai_reasoning: string;
  raw_context: {
    organization: {
      id: string;
      name: string;
      mission: string | null;
      purpose: string | null;
      audience: string | null;
    };
    brand_settings: OrganizationBrandSettings | null;
    hashtags: HashtagItem[];
    selected_asset: AssetItem;
  };
};

export type GeneratedPostItem = {
  id: string;
  campaign_id?: string | null;
  organization_id?: string | null;
  asset_id?: string | null;
  template_id?: string | null;
  file_url?: string | null;
  signed_file_url?: string | null;
  asset_type?: string | null;
  asset_name?: string | null;
  platform: string;
  content: string;
  status: string;
  generated_by?: string | null;
  ai_model?: string | null;
  approved_at?: string | null;
  published_at?: string | null;
  created_at: string;
};

export type CreateGeneratedPostPayload = {
  campaign_id?: string;
  organization_id?: string;
  asset_id?: string;
  template_id?: string;
  file_url?: string;
  platform: string;
  content: string;
  status?: string;
  generated_by?: string;
  ai_model?: string;
};

export type UpdateGeneratedPostPayload = {
  content?: string;
  status?: string;
  asset_id?: string;
  file_url?: string;
};

export type RegenerateGeneratedPostDesignPayload = {
  poster_instructions?: string;
  generated_image_prompt?: string;
  event_title?: string;
};

export type OrganizationItem = {
  id: string;
  name: string;
  slug: string;
  mission: string | null;
  purpose: string | null;
  audience: string | null;
  email: string | null;
  brand_settings: OrganizationBrandSettings[];
};

export type HashtagItem = {
  id: string;
  organization_id: string;
  tag: string;
};

export type AssetItem = {
  id: string;
  organization_id?: string | null;
  name?: string | null;
  description?: string | null;
  campaign_id?: string | null;
  file_url: string;
  asset_type: string;
  platform?: string | null;
  dimensions?: string | null;
  uploaded_by?: string | null;
  template_category?: string | null;
  is_template?: boolean;
  canva_template_url?: string | null;
  signed_file_url?: string | null;
  created_at?: string | null;
};

export function isSvgAsset(asset: {
  asset_type?: string | null;
  file_url?: string | null;
  signed_file_url?: string | null;
}) {
  const sourceUrl = asset.signed_file_url || asset.file_url || "";

  return (
    asset.asset_type === "image" &&
    Boolean(sourceUrl) &&
    /\.svg(?:$|\?)/i.test(sourceUrl)
  );
}

export function getAssetContentUrl(assetId: string) {
  return `${API_URL}/assets/${assetId}/content`;
}

export function getAssetRenderUrl(
  asset: Pick<AssetItem, "id" | "asset_type" | "file_url" | "signed_file_url">,
) {
  if (isSvgAsset(asset)) {
    return getAssetContentUrl(asset.id);
  }

  return asset.signed_file_url || asset.file_url;
}

export type UploadAssetPayload = {
  organization_id: string;
  file: File;
  name: string;
  description?: string;
  asset_type?: string;
  platform?: string;
  dimensions?: string;
  uploaded_by?: string;
  template_category?: string;
  is_template?: boolean;
  canva_template_url?: string;
  campaign_id?: string;
};

export type UpdateAssetPayload = Partial<
  Pick<
    AssetItem,
    | "name"
    | "description"
    | "file_url"
    | "asset_type"
    | "platform"
    | "dimensions"
    | "uploaded_by"
    | "template_category"
    | "is_template"
    | "canva_template_url"
    | "campaign_id"
  >
>;

export type ContentTemplateItem = {
  id: string;
  organization_id: string;
  name: string;
  platform: string;
  template_type: string;
  prompt_template: string;
  created_at?: string | null;
};

export type CreateHashtagPayload = {
  organization_id: string;
  tag: string;
};

export type EventItem = {
  id: string;
  title: string;
  event_date: string;
  event_type: string | null;
  location: string | null;
  status: string | null;
};

export type CampaignItem = {
  id: string;
  title: string;
  campaign_type: string | null;
  objective: string | null;
  status: string | null;
  created_at: string;
};

type EventsResponse = {
  success: boolean;
  data: EventItem[];
};

type CampaignsResponse = {
  success: boolean;
  data: CampaignItem[];
};

type OrganizationResponse = {
  success: boolean;
  data: OrganizationItem;
};

type BrandSettingsResponse = {
  success: boolean;
  data: OrganizationBrandSettings;
};

type HashtagsResponse = {
  success: boolean;
  data: HashtagItem[];
};

type HashtagResponse = {
  success: boolean;
  data: HashtagItem;
};

type AssetsResponse = {
  success: boolean;
  data: AssetItem[];
};

type AssetResponse = {
  success: boolean;
  data: AssetItem;
};

type AssetUploadResponse = AssetResponse;

type GenerateCampaignResponse = {
  success: boolean;
  data: GenerateCampaignResult;
};

type GeneratedPostsResponse = {
  success: boolean;
  data: GeneratedPostItem[];
};

type GeneratedPostResponse = {
  success: boolean;
  data: GeneratedPostItem;
};

type ContentTemplatesResponse = {
  success: boolean;
  data: ContentTemplateItem[];
};

type ContentTemplateResponse = {
  success: boolean;
  data: ContentTemplateItem;
};

type DeleteResponse = {
  success: boolean;
  message: string;
};

export async function getOrganization(slug: string) {
  const response = await fetch(`${API_URL}/organizations/${slug}`);

  if (!response.ok) {
    throw new Error("Failed to fetch organization");
  }

  const payload = (await response.json()) as OrganizationResponse;

  return payload.data;
}

export async function getBrandSettings(organizationId: string) {
  const response = await fetch(`${API_URL}/brand-settings/${organizationId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch brand settings");
  }

  const payload = (await response.json()) as BrandSettingsResponse;

  return payload.data;
}

export async function getEvents() {
  const response = await fetch(`${API_URL}/events`);

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  const payload = (await response.json()) as EventsResponse;

  return payload.data;
}

export async function getCampaigns() {
  const response = await fetch(`${API_URL}/campaigns`);

  if (!response.ok) {
    throw new Error("Failed to fetch campaigns");
  }

  const payload = (await response.json()) as CampaignsResponse;

  return payload.data;
}

export async function getHashtags(organizationId: string) {
  const response = await fetch(`${API_URL}/hashtags/${organizationId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch hashtags");
  }

  const payload = (await response.json()) as HashtagsResponse;

  return payload.data;
}

export async function createHashtag(payload: CreateHashtagPayload) {
  const response = await fetch(`${API_URL}/hashtags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create hashtag");
  }

  const result = (await response.json()) as HashtagResponse;

  return result.data;
}

export async function getAssets() {
  const response = await fetch(`${API_URL}/assets/`);

  if (!response.ok) {
    throw new Error("Failed to fetch assets");
  }

  const payload = (await response.json()) as AssetsResponse;

  return payload.data;
}

export async function getAsset(id: string) {
  const response = await fetch(`${API_URL}/assets/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch asset");
  }

  const payload = (await response.json()) as AssetResponse;

  return payload.data;
}

export async function createAsset(
  payload: Omit<AssetItem, "id" | "created_at">,
) {
  const response = await fetch(`${API_URL}/assets/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create asset");
  }

  const result = (await response.json()) as AssetResponse;

  return result.data;
}

export async function updateAsset(id: string, payload: UpdateAssetPayload) {
  const response = await fetch(`${API_URL}/assets/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update asset");
  }

  const result = (await response.json()) as AssetResponse;

  return result.data;
}

export async function deleteAsset(id: string) {
  const response = await fetch(`${API_URL}/assets/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete asset");
  }

  const result = (await response.json()) as DeleteResponse;

  return result.message;
}

export async function uploadAsset(payload: UploadAssetPayload) {
  const formData = new FormData();

  formData.append("file", payload.file);
  formData.append("organization_id", payload.organization_id);
  formData.append("name", payload.name);

  if (payload.description) {
    formData.append("description", payload.description);
  }

  if (payload.asset_type) {
    formData.append("asset_type", payload.asset_type);
  }

  if (payload.platform) {
    formData.append("platform", payload.platform);
  }

  if (payload.dimensions) {
    formData.append("dimensions", payload.dimensions);
  }

  if (payload.uploaded_by) {
    formData.append("uploaded_by", payload.uploaded_by);
  }

  if (payload.template_category) {
    formData.append("template_category", payload.template_category);
  }

  if (payload.is_template) {
    formData.append("is_template", "true");
  }

  if (payload.canva_template_url) {
    formData.append("canva_template_url", payload.canva_template_url);
  }

  if (payload.campaign_id) {
    formData.append("campaign_id", payload.campaign_id);
  }

  const response = await fetch(`${API_URL}/assets/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload asset");
  }

  const result = (await response.json()) as AssetUploadResponse;

  return result.data;
}

export async function getContentTemplates() {
  const response = await fetch(`${API_URL}/content-templates/`);

  if (!response.ok) {
    throw new Error("Failed to fetch content templates");
  }

  const payload = (await response.json()) as ContentTemplatesResponse;

  return payload.data;
}

export async function getContentTemplate(id: string) {
  const response = await fetch(`${API_URL}/content-templates/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch content template");
  }

  const payload = (await response.json()) as ContentTemplateResponse;

  return payload.data;
}

export async function generateCampaign(payload: GenerateCampaignPayload) {
  const response = await fetch(`${API_URL}/ai/generate-campaign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to generate campaign content");
  }

  const result = (await response.json()) as GenerateCampaignResponse;

  return result.data;
}

export async function getGeneratedPosts() {
  const response = await fetch(`${API_URL}/generated-posts`);

  if (!response.ok) {
    throw new Error("Failed to fetch generated posts");
  }

  const payload = (await response.json()) as GeneratedPostsResponse;

  return payload.data;
}

export async function createGeneratedPost(payload: CreateGeneratedPostPayload) {
  const response = await fetch(`${API_URL}/generated-posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to save generated post");
  }

  const result = (await response.json()) as GeneratedPostResponse;

  return result.data;
}

export async function updateGeneratedPost(
  id: string,
  payload: UpdateGeneratedPostPayload,
) {
  const response = await fetch(`${API_URL}/generated-posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update generated post");
  }

  const result = (await response.json()) as GeneratedPostResponse;

  return result.data;
}

export async function approveGeneratedPost(id: string) {
  const response = await fetch(`${API_URL}/generated-posts/${id}/approve`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to approve generated post");
  }

  const result = (await response.json()) as GeneratedPostResponse;

  return result.data;
}

export async function regenerateGeneratedPostDesign(
  id: string,
  payload: RegenerateGeneratedPostDesignPayload = {},
) {
  const response = await fetch(
    `${API_URL}/generated-posts/${id}/regenerate-design`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to regenerate generated post design");
  }

  const result = (await response.json()) as GeneratedPostResponse;

  return result.data;
}

export async function createContentTemplate(
  payload: Omit<ContentTemplateItem, "id" | "created_at">,
) {
  const response = await fetch(`${API_URL}/content-templates/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create content template");
  }

  const result = (await response.json()) as ContentTemplateResponse;

  return result.data;
}

export async function updateContentTemplate(
  id: string,
  payload: Partial<
    Pick<
      ContentTemplateItem,
      "name" | "platform" | "template_type" | "prompt_template"
    >
  >,
) {
  const response = await fetch(`${API_URL}/content-templates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update content template");
  }

  const result = (await response.json()) as ContentTemplateResponse;

  return result.data;
}

export async function deleteContentTemplate(id: string) {
  const response = await fetch(`${API_URL}/content-templates/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete content template");
  }

  const result = (await response.json()) as DeleteResponse;

  return result.message;
}
