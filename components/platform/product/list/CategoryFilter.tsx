"use client";

import { useState } from "react";
import { ChevronRight, Check, LayoutGrid } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
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

  const handleParentClick = (slug: string) => {
    if (expandedCategory === slug) {
      // If clicking same category, toggle it off
      setExpandedCategory(null);
      if (parentCategory === slug) {
        onCategoryChange(null, null);
      }
    } else {
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

  return (
    <div>
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
        Categories
      </h3>
      <div className="space-y-1">
        {Object.values(CATEGORIES).map((cat) => {
          const isExpanded = expandedCategory === cat.slug;
          const isParentSelected = parentCategory === cat.slug;

          return (
            <div key={cat.slug} className="overflow-hidden">
              {/* Parent Category */}
              <button
                onClick={() => handleParentClick(cat.slug)}
                className={cn(
                  "w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-sm transition-all",
                  isParentSelected
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "bg-muted/30 hover:bg-muted"
                )}
              >
                <span>{cat.label}</span>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isExpanded && "rotate-90"
                  )}
                />
              </button>

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
