"use client";

import { useState, useMemo } from "react";
import { ChevronRight, Check, LayoutGrid, Loader2 } from "lucide-react";
import { useCategoryTree } from "@/hooks/query";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  parentCategory: string | null;
  childCategory: string | null;
  onCategoryChange: (parent: string | null, child: string | null) => void;
}

export function CategoryFilter({
  parentCategory,
  childCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(parentCategory);

  // Get categories from React Query (globally cached)
  const { data: categoryResponse, isLoading } = useCategoryTree(undefined);
  const categoryTree = categoryResponse?.data || [];

  // Memoize flat category structure for efficient lookup
  const categories = useMemo(() => {
    return categoryTree.map(cat => ({
      slug: cat.slug,
      label: cat.name,
      subcategories: (cat.children || []).map(child => ({
        slug: child.slug,
        label: child.name,
      })),
    }));
  }, [categoryTree]);

  // Toggle expand/collapse without selecting
  const handleExpandToggle = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategory(prev => prev === slug ? null : slug);
  };

  // Select parent category
  const handleParentSelect = (slug: string) => {
    if (parentCategory === slug) {
      // Deselect if already selected
      onCategoryChange(null, null);
    } else {
      // Select parent and expand it
      setExpandedCategory(slug);
      onCategoryChange(slug, null);
    }
  };

  const handleChildClick = (parentSlug: string, childSlug: string) => {
    if (parentCategory === parentSlug && childCategory === childSlug) {
      // Deselect child but keep parent
      onCategoryChange(parentSlug, null);
    } else {
      onCategoryChange(parentSlug, childSlug);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          Categories
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div>
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          Categories
        </h3>
        <p className="text-sm text-muted-foreground py-4">No categories available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
        Categories
      </h3>
      <div className="space-y-1">
        {categories.map((cat) => {
          const isExpanded = expandedCategory === cat.slug;
          const isParentSelected = parentCategory === cat.slug;

          return (
            <div key={cat.slug} className="overflow-hidden">
              {/* Parent Category */}
              <div
                className={cn(
                  "w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-sm transition-all",
                  isParentSelected
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "bg-muted/30 hover:bg-muted"
                )}
              >
                <button
                  onClick={() => handleParentSelect(cat.slug)}
                  className="flex-1 text-left"
                >
                  {cat.label}
                </button>
                {cat.subcategories.length > 0 && (
                  <button
                    onClick={(e) => handleExpandToggle(cat.slug, e)}
                    className="p-1 -mr-1 rounded hover:bg-black/10"
                  >
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </button>
                )}
              </div>

              {/* Subcategories */}
              <div
                className={cn(
                  "grid transition-all duration-200 ease-in-out",
                  isExpanded
                    ? "grid-rows-[1fr] opacity-100 mt-1"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="ml-2 pl-3 border-l-2 border-muted space-y-0.5 py-2">
                    {cat.subcategories.map((sub) => {
                      const isChildSelected = parentCategory === cat.slug && childCategory === sub.slug;

                      return (
                        <button
                          key={sub.slug}
                          onClick={() => handleChildClick(cat.slug, sub.slug)}
                          className={cn(
                            "w-full flex items-center gap-2.5 py-2 px-3 rounded-md text-sm transition-all",
                            isChildSelected
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0",
                              isChildSelected
                                ? "bg-primary border-primary"
                                : "border-muted-foreground/30"
                            )}
                          >
                            {isChildSelected && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                          </div>
                          <span>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
