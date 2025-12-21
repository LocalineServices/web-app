"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useLocales } from "@/hooks/use-translations";
import { useToast } from "@/hooks/use-toast";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import Image from "next/image";

const supportedFormats = [
  { id: "json", name: "JSON", extension: ".json,.JSON", icon: "📄" },
  { id: "csv", name: "CSV", extension: ".csv,.CSV", icon: "📊" },
  { id: "yaml", name: "YAML", extension: ".yml,.yaml,.YML,.YAML", icon: "📝" },
];

function getLocaleFlagUrl(localeCode: string): string {
  // Extract country code from locale (e.g., "en_US" -> "us", "de_DE" -> "de")
  const parts = localeCode.toLowerCase().split('_');
  const countryCode = parts.length > 1 ? parts[1] : parts[0];
  return `https://flagcdn.com/w320/${countryCode}.png`;
}

interface LocaleItem {
  id: string;
  locale: {
    code: string;
    language: string;
  };
}

export default function ImportPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { toast } = useToast();
  
  // Check permissions
  const permissions = useProjectPermissions(projectId);
  
  // Redirect editors away from this page
  React.useEffect(() => {
    if (!permissions.isLoading && permissions.isEditor) {
      router.push(`/projects/${projectId}`);
    }
  }, [permissions.isLoading, permissions.isEditor, router, projectId]);
  
  const { data: localesData, isLoading: localesLoading } = useLocales(projectId);
  const locales = React.useMemo(() => {
    if (!localesData) return [];
    if (Array.isArray(localesData)) return localesData;
    if (typeof localesData === 'object' && localesData !== null && 'data' in localesData) {
      const data = (localesData as { data?: unknown }).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  }, [localesData]);
  
  const [selectedLocale, setSelectedLocale] = React.useState<string>("");
  const [selectedFormat, setSelectedFormat] = React.useState<string>("");
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [updateExisting, setUpdateExisting] = React.useState(true);
  const [importResult, setImportResult] = React.useState<{
    total: number;
    created: number;
    updated: number;
    skipped: number;
  } | null>(null);
  
  // Don't render content for editors
  if (permissions.isEditor) {
    return null;
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      // Auto-detect format from file extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'json') setSelectedFormat('json');
      else if (ext === 'csv') setSelectedFormat('csv');
      else if (ext === 'yml' || ext === 'yaml') setSelectedFormat('yaml');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Auto-detect format from file extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'json') setSelectedFormat('json');
      else if (ext === 'csv') setSelectedFormat('csv');
      else if (ext === 'yml' || ext === 'yaml') setSelectedFormat('yaml');
    }
  };

  const handleImport = async () => {
    if (!uploadedFile || !selectedLocale || !selectedFormat) {
      toast({
        title: "Error",
        description: "Please select a file, language, and format",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setImportResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('format', selectedFormat);
      formData.append('localeCode', selectedLocale);
      formData.append('updateExisting', updateExisting.toString());

      const response = await fetch(`/api/v1/projects/${projectId}/import`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResult(data.stats);
      toast({
        title: "Success",
        description: `Imported ${data.stats.total} translations successfully`,
      });
      
      // Reset form
      setUploadedFile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to import translations",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/projects/${params.projectId}`}>
          <Button variant="ghost" size="icon">
            <Icons.arrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import Translations</h1>
          <p className="text-muted-foreground">
            Import translations from various file formats
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Drag and drop a file or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dropzone */}
            <div
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50",
                uploadedFile && "border-green-500 bg-green-500/5"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleFileSelect}
                accept=".json,.csv,.yml,.yaml"
              />
              {uploadedFile ? (
                <>
                  <Icons.checkCircle className="h-12 w-12 text-green-500" />
                  <p className="mt-4 font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                    }}
                  >
                    Remove file
                  </Button>
                </>
              ) : (
                <>
                  <Icons.upload className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 font-medium">Drop your file here</p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                </>
              )}
            </div>

            <Separator />

            {/* Options */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Target Language</Label>
                {localesLoading ? (
                  <div className="flex items-center justify-center p-2">
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <Select value={selectedLocale} onValueChange={setSelectedLocale}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {locales.map((localeItem: LocaleItem) => (
                        <SelectItem key={localeItem.locale.code} value={localeItem.locale.code}>
                          <div className="flex items-center gap-2">
                            <Image 
                              src={getLocaleFlagUrl(localeItem.locale.code)} 
                              alt={localeItem.locale.language}
                              className="h-4 w-auto"
                              width={20}
                              height={15}
                            />
                            {localeItem.locale.language} ({localeItem.locale.code})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>File Format</Label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedFormats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.icon} {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="update-existing"
                  checked={updateExisting}
                  onCheckedChange={(checked) => setUpdateExisting(checked as boolean)}
                />
                <Label htmlFor="update-existing" className="font-normal text-sm">
                  Update existing translations
                </Label>
              </div>
            </div>

            {importResult && (
              <div className="rounded-lg border bg-muted p-4 space-y-2">
                <p className="font-medium">Import Results:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Total terms:</div>
                  <div className="font-medium">{importResult.total}</div>
                  <div>Created:</div>
                  <div className="font-medium text-green-600">{importResult.created}</div>
                  <div>Updated:</div>
                  <div className="font-medium text-blue-600">{importResult.updated}</div>
                  <div>Skipped:</div>
                  <div className="font-medium text-muted-foreground">{importResult.skipped}</div>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              disabled={!uploadedFile || !selectedLocale || !selectedFormat || isUploading}
              onClick={handleImport}
            >
              {isUploading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Icons.upload className="mr-2 h-4 w-4" />
                  Import Translations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Supported formats */}
        <Card>
          <CardHeader>
            <CardTitle>Supported Formats</CardTitle>
            <CardDescription>
              Choose from a variety of translation file formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {supportedFormats.map((format) => (
                <div
                  key={format.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <span className="text-2xl">{format.icon}</span>
                  <div>
                    <p className="font-medium">{format.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format.extension}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
