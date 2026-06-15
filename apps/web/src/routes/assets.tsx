import { createFileRoute } from "@tanstack/react-router";
import {
  Upload,
  ImageIcon,
  FileText,
  Film,
  Link as LinkIcon,
  Pencil,
} from "lucide-react";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAssets,
  getOrganization,
  updateAsset,
  uploadAsset,
  type AssetItem,
} from "@/services/api";

export const Route = createFileRoute("/assets")({
  head: () => ({ meta: [{ title: "Assets — BuildHerAI" }] }),
  loader: async () => {
    const [organizationResult, assetsResult] = await Promise.allSettled([
      getOrganization("buildherai-labs"),
      getAssets(),
    ]);

    return {
      organizationId:
        organizationResult.status === "fulfilled"
          ? organizationResult.value.id
          : null,
      organizationError: organizationResult.status === "rejected",
      assets: assetsResult.status === "fulfilled" ? assetsResult.value : [],
      assetsError: assetsResult.status === "rejected",
    };
  },
  component: AssetsPage,
});

const iconFor = (type: string) =>
  type === "image" ? ImageIcon : type === "video" ? Film : FileText;

function toAssetName(fileUrl: string) {
  try {
    const pathname = new URL(fileUrl).pathname;
    const rawName = pathname.split("/").filter(Boolean).at(-1);

    return rawName ? decodeURIComponent(rawName) : fileUrl;
  } catch {
    return fileUrl.split("/").filter(Boolean).at(-1) ?? fileUrl;
  }
}

function deriveDefaultName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");

  return withoutExtension
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function deriveAssetType(file: File) {
  if (file.type.startsWith("image/")) {
    return "image";
  }

  if (file.type.startsWith("video/")) {
    return "video";
  }

  return "document";
}

function toAssetTypeLabel(assetType: string) {
  return assetType
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function toCreatedAtLabel(asset: AssetItem) {
  if (!asset.created_at) {
    if (asset.campaign_id) {
      return `Campaign ${asset.campaign_id.slice(0, 8)}`;
    }

    return "Uploaded just now";
  }

  return new Date(asset.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function assetEditDefaults(asset: AssetItem) {
  return {
    name: asset.name ?? "",
    description: asset.description ?? "",
    assetType: asset.asset_type ?? "",
    platform: asset.platform ?? "",
    dimensions: asset.dimensions ?? "",
    uploadedBy: asset.uploaded_by ?? "",
    templateCategory: asset.template_category ?? "",
    isTemplate: asset.is_template ?? false,
    canvaTemplateUrl: asset.canva_template_url ?? "",
  };
}

function AssetPreview({ asset }: { asset: AssetItem }) {
  const [hasPreviewError, setHasPreviewError] = useState(false);
  const assetUrl = asset.signed_file_url || asset.file_url;
  const Icon = iconFor(asset.asset_type);

  if (!assetUrl || hasPreviewError) {
    return (
      <div className="flex aspect-4/3 items-center justify-center bg-(--gradient-soft)">
        <Icon className="h-10 w-10 text-primary/70" />
      </div>
    );
  }

  if (asset.asset_type === "image") {
    return (
      <div className="aspect-4/3 overflow-hidden bg-muted/40">
        <img
          src={assetUrl}
          alt={asset.name?.trim() || "Uploaded asset preview"}
          className="h-full w-full object-cover"
          onError={() => setHasPreviewError(true)}
        />
      </div>
    );
  }

  if (asset.asset_type === "video") {
    return (
      <div className="aspect-4/3 overflow-hidden bg-black/90">
        <video
          src={assetUrl}
          className="h-full w-full object-cover"
          controls
          muted
          playsInline
          onError={() => setHasPreviewError(true)}
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-4/3 items-center justify-center bg-(--gradient-soft)">
      <Icon className="h-10 w-10 text-primary/70" />
    </div>
  );
}

function AssetsPage() {
  const { assets, assetsError, organizationId, organizationError } =
    Route.useLoaderData();
  const [assetItems, setAssetItems] = useState(assets);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [assetType, setAssetType] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [dimensions, setDimensions] = useState("");
  const [uploadedBy, setUploadedBy] = useState("Beth");
  const [templateCategory, setTemplateCategory] = useState("");
  const [isTemplate, setIsTemplate] = useState(true);
  const [canvaTemplateUrl, setCanvaTemplateUrl] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAssetType, setEditAssetType] = useState("");
  const [editPlatform, setEditPlatform] = useState("");
  const [editDimensions, setEditDimensions] = useState("");
  const [editUploadedBy, setEditUploadedBy] = useState("");
  const [editTemplateCategory, setEditTemplateCategory] = useState("");
  const [editIsTemplate, setEditIsTemplate] = useState(false);
  const [editCanvaTemplateUrl, setEditCanvaTemplateUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetUploadForm() {
    setSelectedFile(null);
    setName("");
    setDescription("");
    setAssetType("");
    setPlatform("instagram");
    setDimensions("");
    setUploadedBy("Beth");
    setTemplateCategory("");
    setIsTemplate(true);
    setCanvaTemplateUrl("");
    setUploadError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleDialogOpenChange(nextOpen: boolean) {
    setIsUploadDialogOpen(nextOpen);

    if (!nextOpen && !isUploading) {
      resetUploadForm();
    }
  }

  function openEditDialog(asset: AssetItem) {
    const defaults = assetEditDefaults(asset);

    setEditingAssetId(asset.id);
    setEditName(defaults.name);
    setEditDescription(defaults.description);
    setEditAssetType(defaults.assetType);
    setEditPlatform(defaults.platform);
    setEditDimensions(defaults.dimensions);
    setEditUploadedBy(defaults.uploadedBy);
    setEditTemplateCategory(defaults.templateCategory);
    setEditIsTemplate(defaults.isTemplate);
    setEditCanvaTemplateUrl(defaults.canvaTemplateUrl);
    setEditError(null);
    setIsEditDialogOpen(true);
  }

  function handleEditDialogOpenChange(nextOpen: boolean) {
    setIsEditDialogOpen(nextOpen);

    if (!nextOpen && !isSavingAsset) {
      setEditingAssetId(null);
      setEditError(null);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setSelectedFile(file);

    if (!file) {
      return;
    }

    if (!name) {
      setName(deriveDefaultName(file.name));
    }

    if (!assetType) {
      setAssetType(deriveAssetType(file));
    }

    setUploadError(null);
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile || !organizationId || isUploading || !name.trim()) {
      setUploadError("Choose a file and enter a name before uploading.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const asset = await uploadAsset({
        organization_id: organizationId,
        file: selectedFile,
        name: name.trim(),
        description: description.trim(),
        asset_type: assetType.trim(),
        platform: platform.trim(),
        dimensions: dimensions.trim(),
        uploaded_by: uploadedBy.trim(),
        template_category: templateCategory.trim(),
        is_template: isTemplate,
        canva_template_url: canvaTemplateUrl.trim(),
      });

      setAssetItems((current) => [asset, ...current]);
      setIsUploadDialogOpen(false);
      resetUploadForm();
    } catch {
      setUploadError("Unable to upload asset right now.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleEditAsset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingAssetId || !editName.trim() || isSavingAsset) {
      setEditError("Enter a name before saving changes.");
      return;
    }

    setIsSavingAsset(true);
    setEditError(null);

    try {
      const updatedAsset = await updateAsset(editingAssetId, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        asset_type: editAssetType.trim() || undefined,
        platform: editPlatform.trim() || undefined,
        dimensions: editDimensions.trim() || undefined,
        uploaded_by: editUploadedBy.trim() || undefined,
        template_category: editTemplateCategory.trim() || undefined,
        is_template: editIsTemplate,
        canva_template_url: editCanvaTemplateUrl.trim() || undefined,
      });

      setAssetItems((current) =>
        current.map((asset) =>
          asset.id === editingAssetId ? updatedAsset : asset,
        ),
      );
      setIsEditDialogOpen(false);
      setEditingAssetId(null);
    } catch {
      setEditError("Unable to save asset changes right now.");
    } finally {
      setIsSavingAsset(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Assets"
        description="Posters, videos and brand files ready to power your campaigns."
        actions={
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={handleDialogOpenChange}
          >
            <Button
              className="rounded-xl bg-(--gradient-primary) shadow-(--shadow-glow) hover:opacity-95"
              onClick={() => setIsUploadDialogOpen(true)}
              disabled={!organizationId || isUploading}
            >
              <Upload className="h-4 w-4" />
              Upload Asset
            </Button>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Asset</DialogTitle>
                <DialogDescription>
                  Upload the file to Supabase Storage, then save its metadata
                  and public URL in the assets table.
                </DialogDescription>
              </DialogHeader>
              <form className="grid gap-4" onSubmit={handleUpload}>
                <div className="space-y-2">
                  <Label htmlFor="asset-file">Asset File</Label>
                  <Input
                    id="asset-file"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,.pdf"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="asset-name">Name</Label>
                    <Input
                      id="asset-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Instagram Event Poster V1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asset-type">Asset Type</Label>
                    <Input
                      id="asset-type"
                      value={assetType}
                      onChange={(event) => setAssetType(event.target.value)}
                      placeholder="image"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-description">Description</Label>
                  <Textarea
                    id="asset-description"
                    rows={3}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Square Instagram event poster template"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="asset-platform">Platform</Label>
                    <Input
                      id="asset-platform"
                      value={platform}
                      onChange={(event) => setPlatform(event.target.value)}
                      placeholder="instagram"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asset-dimensions">Dimensions</Label>
                    <Input
                      id="asset-dimensions"
                      value={dimensions}
                      onChange={(event) => setDimensions(event.target.value)}
                      placeholder="1080x1080"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asset-uploaded-by">Uploaded By</Label>
                    <Input
                      id="asset-uploaded-by"
                      value={uploadedBy}
                      onChange={(event) => setUploadedBy(event.target.value)}
                      placeholder="Beth"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border/60 p-3">
                  <Checkbox
                    id="asset-is-template"
                    checked={isTemplate}
                    onCheckedChange={(checked) =>
                      setIsTemplate(Boolean(checked))
                    }
                  />
                  <div>
                    <Label htmlFor="asset-is-template">Save as template</Label>
                    <p className="text-xs text-muted-foreground">
                      Template uploads are stored under the bucket's templates
                      folder.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="asset-template-category">
                      Template Category
                    </Label>
                    <Input
                      id="asset-template-category"
                      value={templateCategory}
                      onChange={(event) =>
                        setTemplateCategory(event.target.value)
                      }
                      placeholder="event_poster"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asset-canva-url">Canva Template URL</Label>
                    <Input
                      id="asset-canva-url"
                      value={canvaTemplateUrl}
                      onChange={(event) =>
                        setCanvaTemplateUrl(event.target.value)
                      }
                      placeholder="https://canva.com/design/..."
                    />
                  </div>
                </div>
                {uploadError ? (
                  <p className="text-sm text-destructive">{uploadError}</p>
                ) : null}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogOpenChange(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUploading || !organizationId}
                  >
                    {isUploading ? "Uploading..." : "Upload & Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>
              Update asset metadata without uploading a new file.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleEditAsset}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-asset-name">Name</Label>
                <Input
                  id="edit-asset-name"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  placeholder="Instagram Event Poster V1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-asset-type">Asset Type</Label>
                <Input
                  id="edit-asset-type"
                  value={editAssetType}
                  onChange={(event) => setEditAssetType(event.target.value)}
                  placeholder="image"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-asset-description">Description</Label>
              <Textarea
                id="edit-asset-description"
                rows={3}
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                placeholder="Square Instagram event poster template"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-asset-platform">Platform</Label>
                <Input
                  id="edit-asset-platform"
                  value={editPlatform}
                  onChange={(event) => setEditPlatform(event.target.value)}
                  placeholder="instagram"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-asset-dimensions">Dimensions</Label>
                <Input
                  id="edit-asset-dimensions"
                  value={editDimensions}
                  onChange={(event) => setEditDimensions(event.target.value)}
                  placeholder="1080x1080"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-asset-uploaded-by">Uploaded By</Label>
                <Input
                  id="edit-asset-uploaded-by"
                  value={editUploadedBy}
                  onChange={(event) => setEditUploadedBy(event.target.value)}
                  placeholder="Beth"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border/60 p-3">
              <Checkbox
                id="edit-asset-is-template"
                checked={editIsTemplate}
                onCheckedChange={(checked) =>
                  setEditIsTemplate(Boolean(checked))
                }
              />
              <div>
                <Label htmlFor="edit-asset-is-template">Save as template</Label>
                <p className="text-xs text-muted-foreground">
                  Keep template metadata and Canva links up to date.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-asset-template-category">
                  Template Category
                </Label>
                <Input
                  id="edit-asset-template-category"
                  value={editTemplateCategory}
                  onChange={(event) =>
                    setEditTemplateCategory(event.target.value)
                  }
                  placeholder="event_poster"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-asset-canva-url">Canva Template URL</Label>
                <Input
                  id="edit-asset-canva-url"
                  value={editCanvaTemplateUrl}
                  onChange={(event) =>
                    setEditCanvaTemplateUrl(event.target.value)
                  }
                  placeholder="https://canva.com/design/..."
                />
              </div>
            </div>
            {editError ? (
              <p className="text-sm text-destructive">{editError}</p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleEditDialogOpenChange(false)}
                disabled={isSavingAsset}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingAsset}>
                {isSavingAsset ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {organizationError ? (
        <Card className="mb-4 border-border/60 shadow-(--shadow-card)">
          <CardContent className="py-6 text-sm text-muted-foreground">
            Unable to resolve the organization for uploads right now.
          </CardContent>
        </Card>
      ) : null}
      {assetsError ? (
        <Card className="mb-4 border-border/60 shadow-(--shadow-card)">
          <CardContent className="py-6 text-sm text-muted-foreground">
            Unable to load assets right now.
          </CardContent>
        </Card>
      ) : null}
      {uploadError ? (
        <Card className="mb-4 border-border/60 shadow-(--shadow-card)">
          <CardContent className="py-6 text-sm text-muted-foreground">
            {uploadError}
          </CardContent>
        </Card>
      ) : null}
      {!assetItems.length && !assetsError ? (
        <Card className="mb-4 border-border/60 shadow-(--shadow-card)">
          <CardHeader>
            <CardTitle className="text-base">No assets yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Upload posters, reels, or supporting brand files and they will
            appear here.
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {assetItems.map((asset) => {
          return (
            <Card
              key={asset.id}
              className="overflow-hidden border-border/60 shadow-(--shadow-card) transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <AssetPreview asset={asset} />
              <CardContent className="p-4">
                <p className="truncate text-sm font-medium">
                  {asset.name?.trim() || toAssetName(asset.file_url)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                  {toAssetTypeLabel(asset.asset_type)} {"·"}
                  {toCreatedAtLabel(asset)}
                </p>
                {asset.platform || asset.dimensions ? (
                  <p className="mt-1 text-xs text-muted-foreground capitalize">
                    {[asset.platform, asset.dimensions]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
                {asset.description ? (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {asset.description}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-3">
                  <a
                    href={asset.signed_file_url || asset.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-xs font-medium text-primary hover:underline"
                  >
                    Open asset
                  </a>
                  <button
                    type="button"
                    onClick={() => openEditDialog(asset)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit asset
                  </button>
                </div>
                {asset.canva_template_url ? (
                  <a
                    href={asset.canva_template_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    Open Canva template
                  </a>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
