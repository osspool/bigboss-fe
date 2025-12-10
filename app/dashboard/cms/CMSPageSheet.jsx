"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormSheet } from "@/components/custom/ui/sheet-wrapper";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormGenerator } from "@/components/form/form-system";
import { useCMSPage, useCMSUpdate } from "@/hooks/query/useCMS";
import { getDefaultPageContent } from "@/constants/cms-pages";
import { getFormSchemaForPage } from "./forms";
import { toast } from "sonner";

/**
 * Flatten nested object for form (dot notation keys)
 */
function flattenObject(obj, prefix = "") {
  const flattened = {};
  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }
  return flattened;
}

/**
 * Unflatten form values back to nested object
 */
function unflattenObject(flat) {
  const result = {};
  for (const key in flat) {
    const value = flat[key];
    if (value !== undefined && value !== null && value !== "") {
      const keys = key.split(".");
      let current = result;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    }
  }
  return result;
}

export function CMSPageSheet({ token, open, onOpenChange, pageConfig }) {
  const slug = pageConfig?.slug;
  
  // Fetch existing page data
  const { data: existingPage, isLoading } = useCMSPage(slug, {
    enabled: !!slug,
  });

  // Update mutation - backend auto-creates if missing
  const updateMutation = useCMSUpdate(token);

  const formSchema = useMemo(() => {
    if (!slug) return null;
    return getFormSchemaForPage(slug);
  }, [slug]);

  const form = useForm({
    defaultValues: {
      status: "draft",
      metadata: { title: "", description: "" },
    },
  });

  // Load existing data or defaults when sheet opens
  useEffect(() => {
    if (!open) {
      form.reset({ status: "draft", metadata: { title: "", description: "" } });
      return;
    }

    if (existingPage) {
      const flatContent = flattenObject(existingPage.content || {});
      form.reset({
        status: existingPage.status || "draft",
        ...flatContent,
        metadata: existingPage.metadata || { title: "", description: "" },
      });
    } else if (slug && !isLoading) {
      const defaultContent = getDefaultPageContent(slug);
      const flatContent = flattenObject(defaultContent);
      form.reset({
        status: "draft",
        ...flatContent,
        metadata: { title: pageConfig?.name || "", description: pageConfig?.description || "" },
      });
    }
  }, [existingPage, slug, open, pageConfig, isLoading]);

  const handleSubmit = async (values) => {
    try {
      const { status, metadata, ...flatContent } = values;
      const content = unflattenObject(flatContent);
      
      // Single update call - backend handles create-if-missing
      await updateMutation.mutateAsync({
        slug,
        data: {
          name: pageConfig.name,
          status,
          content,
          metadata,
        },
      });

      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save: " + error.message);
    }
  };

  if (!pageConfig) return null;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={pageConfig.icon + " " + pageConfig.name}
      description={pageConfig.description}
      size="xl"
      formId="cms-page-form"
      submitLabel="Save Page"
      submitDisabled={updateMutation.isPending}
      submitLoading={updateMutation.isPending}
    >
      <Form {...form}>
        <form id="cms-page-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Page Info */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <p className="text-sm font-medium">
                Page: <code className="text-xs bg-muted px-2 py-1 rounded">{pageConfig.slug}</code>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Route: {pageConfig.route}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => window.open(pageConfig.route, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Live
            </Button>
          </div>

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Draft</Badge>
                    </SelectItem>
                    <SelectItem value="published">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Published</Badge>
                    </SelectItem>
                    <SelectItem value="archived">
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Archived</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Only published pages are visible on the website</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dynamic Form Content */}
          {formSchema && (
            <FormGenerator schema={formSchema} control={form.control} disabled={updateMutation.isPending} />
          )}

          {/* SEO Metadata */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-base font-semibold">SEO Metadata</h3>
            
            <FormField
              control={form.control}
              name="metadata.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Page title for search engines" />
                  </FormControl>
                  <FormDescription>Recommended: 50-60 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Brief description for search results" />
                  </FormControl>
                  <FormDescription>Recommended: 150-160 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </FormSheet>
  );
}
