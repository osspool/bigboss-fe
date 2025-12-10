"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Edit,
  ExternalLink,
  FileText,
  Home,
  Info,
  Mail,
  HelpCircle,
  Shield,
  ScrollText,
  RotateCcw,
  Ruler,
  Truck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PREDEFINED_CMS_PAGES } from "@/constants/cms-pages";
import { CMSPageSheet } from "./CMSPageSheet";

const iconMap = {
  Home,
  Info,
  Mail,
  HelpCircle,
  Shield,
  ScrollText,
  RotateCcw,
  Ruler,
  Truck,
};

export function CMSLibraryClient({ token }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPage, setSelectedPage] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filter predefined pages
  const managedPages = useMemo(() => {
    return PREDEFINED_CMS_PAGES.filter((page) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        page.name.toLowerCase().includes(query) ||
        page.slug.toLowerCase().includes(query) ||
        page.description.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const handleEdit = (pageConfig) => {
    setSelectedPage(pageConfig);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content Pages</h1>
            <p className="text-muted-foreground mt-1">
              Manage your website pages and content
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {managedPages.length} Pages
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {managedPages.map((pageConfig) => (
          <Card
            key={pageConfig.slug}
            className="group hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleEdit(pageConfig)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {(() => {
                    const IconComponent = iconMap[pageConfig.icon];
                    return IconComponent ? (
                      <IconComponent className="h-5 w-5 text-foreground" />
                    ) : (
                      <FileText className="h-5 w-5 text-foreground" />
                    );
                  })()}
                </div>
                <CardTitle className="text-lg">{pageConfig.name}</CardTitle>
              </div>
              <CardDescription className="mt-2">
                {pageConfig.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(pageConfig);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Content
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(pageConfig.route, "_blank");
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {managedPages.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No pages found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search query
          </p>
        </div>
      )}

      {/* Edit Sheet */}
      <CMSPageSheet
        token={token}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        pageConfig={selectedPage}
      />
    </div>
  );
}
