import { useMutation, useQuery } from "@tanstack/react-query";

import {
  generateCampaign,
  getAssets,
  getBrandSettings,
  getHashtags,
  getOrganization,
  type AssetItem,
  type GenerateCampaignPayload,
} from "@/services/api";

function normalizeTemplateCategory(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/[\s-]+/g, "_") ?? "";
}

export function useOrganization(slug: string) {
  return useQuery({
    queryKey: ["organization", slug],
    queryFn: () => getOrganization(slug),
  });
}

export function useBrandSettings(organizationId?: string | null) {
  return useQuery({
    queryKey: ["brand-settings", organizationId],
    queryFn: () => getBrandSettings(organizationId!),
    enabled: Boolean(organizationId),
  });
}

export function useHashtags(organizationId?: string | null) {
  return useQuery({
    queryKey: ["hashtags", organizationId],
    queryFn: () => getHashtags(organizationId!),
    enabled: Boolean(organizationId),
  });
}

export function useAssets(filters: {
  organizationId?: string | null;
  platform?: string;
  templateCategory?: string;
}) {
  return useQuery({
    queryKey: ["assets", filters],
    queryFn: async () => {
      const assets = await getAssets();
      const expectedCategory = normalizeTemplateCategory(
        filters.templateCategory,
      );

      return assets.filter((asset: AssetItem) => {
        const matchesPlatform = filters.platform
          ? asset.platform?.toLowerCase() === filters.platform.toLowerCase()
          : true;

        const matchesOrganization = filters.organizationId
          ? asset.organization_id === filters.organizationId
          : true;

        const assetCategory = normalizeTemplateCategory(
          asset.template_category || asset.asset_type,
        );

        const matchesCategory = expectedCategory
          ? assetCategory === expectedCategory
          : true;

        return matchesPlatform && matchesOrganization && matchesCategory;
      });
    },
    enabled: Boolean(filters.organizationId),
  });
}

export function useGenerateCampaign() {
  return useMutation({
    mutationFn: (payload: GenerateCampaignPayload) => generateCampaign(payload),
  });
}