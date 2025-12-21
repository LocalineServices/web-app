"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useLocales } from "@/hooks/use-translations";
import { useToast } from "@/hooks/use-toast";
import { useProjectPermissions } from "@/hooks/use-project-permissions";

const exportFormats = [
  { id: "json-flat", name: "JSON (Flat)", description: "Simple key-value pairs" },
  { id: "json-nested", name: "JSON (Nested)", description: "Nested object structure" },
  { id: "csv", name: "CSV", description: "Spreadsheet compatible" },
  { id: "yaml", name: "YAML", description: "Human-readable format" },
];

function getLocaleFlagUrl(localeCode: string): string {
  // Extract country code from locale (e.g., "en_US" -> "us", "de_DE" -> "de")
  const parts = localeCode.toLowerCase().split('_');
  const countryCode = parts.length > 1 ? parts[1] : parts[0];
  return `https://flagcdn.com/w320/${countryCode}.png`;
}

interface LocaleItem {
  locale: {
    code: string;
    language: string;
  }
}

export default function ExportPage() {
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
  
  const [selectedFormat, setSelectedFormat] = React.useState("json-flat");
  const [selectedLocales, setSelectedLocales] = React.useState<string[]>([]);
  const [includeEmpty, setIncludeEmpty] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  // Select all locales by default when loaded
  React.useEffect(() => {
    if (locales.length > 0 && selectedLocales.length === 0) {
      setSelectedLocales(locales.map(l => l.locale.code));
    }
  }, [locales, selectedLocales.length]);
  
  // Don't render content for editors
  if (permissions.isEditor) {
    return null;
  }

  const toggleLocale = (code: string) => {
    setSelectedLocales((prev) =>
      prev.includes(code)
        ? prev.filter((l) => l !== code)
        : [...prev, code]
    );
  };

  const handleExport = async () => {
    if (selectedLocales.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one language",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        format: selectedFormat,
        locales: selectedLocales.join(','),
        includeEmpty: includeEmpty.toString(),
      });

      const response = await fetch(
        `/api/v1/projects/${projectId}/export?${params}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || 'translations.json';

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Translations exported successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to export translations",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
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
          <h1 className="text-2xl font-bold tracking-tight">Export Translations</h1>
          <p className="text-muted-foreground">
            Export your translations to various file formats
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Export options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>
              Configure your export settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Format selection */}
            <div className="space-y-2">
              <Label>File Format</Label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportFormats.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      <div className="flex flex-col">
                        <span className="text-left">{format.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Language selection */}
            <div className="space-y-3">
              <Label>Languages to Export</Label>
              {localesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Icons.spinner className="h-6 w-6 animate-spin" />
                </div>
              ) : locales.length === 0 ? (
                <p className="text-sm text-muted-foreground">No locales found</p>
              ) : (
                <div className="grid gap-2">
                  {locales.map((localeItem: LocaleItem) => (
                    <div
                      key={localeItem.locale.code}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedLocales.includes(localeItem.locale.code)}
                          onCheckedChange={() => toggleLocale(localeItem.locale.code)}
                        />
                        <Image 
                          src={getLocaleFlagUrl(localeItem.locale.code)} 
                          alt={localeItem.locale.language}
                          width={20}
                          height={15}
                          className="h-4 w-auto"
                        />
                        <span>{localeItem.locale.language}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {localeItem.locale.code}
                      </span>
                    </div>
                    ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Additional options */}
            <div className="space-y-3">
              <Label>Additional Options</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="include-empty"
                  checked={includeEmpty}
                  onCheckedChange={(checked) => setIncludeEmpty(checked as boolean)}
                />
                <Label htmlFor="include-empty" className="font-normal">
                  Include empty translations
                </Label>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              disabled={selectedLocales.length === 0 || isExporting}
              onClick={handleExport}
            >
              {isExporting ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Icons.download className="mr-2 h-4 w-4" />
                  Export {selectedLocales.length} Language
                  {selectedLocales.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Format info */}
        <Card>
          <CardHeader>
            <CardTitle>Format Preview</CardTitle>
            <CardDescription>
              Preview of the selected export format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4">
              <pre className="text-sm overflow-auto">
                {selectedFormat === "json-flat" && `{
  "common.welcome": "Welcome",
  "common.login": "Log in",
  "common.logout": "Log out"
}`}
                {selectedFormat === "json-nested" && `{
  "common": {
    "welcome": "Welcome",
    "login": "Log in",
    "logout": "Log out"
  }
}`}
                {selectedFormat === "yaml" && `common:
  welcome: Welcome
  login: Log in
  logout: Log out`}
                {selectedFormat === "properties" && `common.welcome=Welcome
common.login=Log in
common.logout=Log out`}
                {selectedFormat === "csv" && `key,en
common.welcome,Welcome
common.login,Log in
common.logout,Log out`}
                {(selectedFormat === "xliff" || selectedFormat === "xliff2") && `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2">
  <file source-language="en">
    <trans-unit id="common.welcome">
      <source>Welcome</source>
    </trans-unit>
  </file>
</xliff>`}
                {selectedFormat === "gettext" && `msgid "common.welcome"
msgstr "Welcome"

msgid "common.login"
msgstr "Log in"`}
                {selectedFormat === "strings" && `"common.welcome" = "Welcome";
"common.login" = "Log in";
"common.logout" = "Log out";`}
                {selectedFormat === "android" && `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string name="common_welcome">Welcome</string>
  <string name="common_login">Log in</string>
</resources>`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
