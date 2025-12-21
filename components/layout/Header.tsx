"use client";

import { useState, useMemo, memo } from "react";
import Link from "next/link";
import { Menu, X, Search, User, ChevronDown, ChevronRight, LogOut, Settings, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { HeaderSearch } from "./HeaderSearch";
import { MobileSearchOverlay } from "./MobileSearchOverlay";
import { useCategoriesSafe } from "@/contexts/CategoryContext";
import { Button } from "@/components/ui/button";
import { CartBadge } from "@/components/platform/cart/CartBadge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CategoryTreeNode } from "@/types/category.types";

interface HeaderProps {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
    roles?: string[];
    phone?: string;
  } | null;
  token?: string | null;
}

// Memoized mobile category item to prevent re-renders
const MobileCategoryItem = memo(function MobileCategoryItem({
  category,
  isOpen,
  onToggle,
  onClose,
}: {
  category: CategoryTreeNode;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const children = category.children || [];
  const hasChildren = children.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={`/products?category=${category.slug}`}
        onClick={onClose}
        className="flex items-center px-6 py-3 text-base font-medium hover:bg-accent transition-colors"
      >
        {category.name}
      </Link>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-3 text-base font-medium hover:bg-accent transition-colors">
        <span>{category.name}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="bg-accent/50">
        <Link
          href={`/products?parentCategory=${category.slug}`}
          onClick={onClose}
          className="block px-10 py-2.5 text-sm text-foreground hover:text-primary transition-colors"
        >
          View All {category.name}
        </Link>
        {children.map((child) => (
          <Link
            key={child.slug}
            href={`/products?parentCategory=${category.slug}&category=${child.slug}`}
            onClick={onClose}
            className="block px-10 py-2.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {child.name}
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});

// Memoized desktop mega menu item
const DesktopCategoryMenu = memo(function DesktopCategoryMenu({
  category,
}: {
  category: CategoryTreeNode;
}) {
  const children = category.children || [];
  const categoryImage = category.image?.url;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="group flex items-center gap-1 text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary outline-none">
        {category.name}
        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        sideOffset={16}
        className="w-[600px] p-0 bg-background border-border shadow-xl z-50"
      >
        <div className="grid grid-cols-3 gap-0">
          {/* Category Image */}
          <div className="col-span-1 relative overflow-hidden">
            <img
              src={categoryImage || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop`}
              alt={category.name}
              className="w-full h-full object-cover min-h-[280px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-display text-xl font-bold mb-2">{category.name}</h3>
              <Link
                href={`/products?parentCategory=${category.slug}`}
                className="inline-flex items-center text-white text-sm font-medium hover:underline"
              >
                Shop All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Subcategories Grid */}
          <div className="col-span-2 p-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Categories
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {children.map((child) => (
                <DropdownMenuItem key={child.slug} asChild className="p-0">
                  <Link
                    href={`/products?parentCategory=${category.slug}&category=${child.slug}`}
                    className="flex items-center gap-3 py-2 px-0 cursor-pointer hover:text-primary transition-colors group/item"
                  >
                    {child.image?.url && (
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={child.image.url}
                          alt={child.name}
                          className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <span className="text-sm font-medium">{child.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>

            {/* Featured Link */}
            <div className="mt-6 pt-4 border-t border-border">
              <Link
                href={`/products?parentCategory=${category.slug}`}
                className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
              >
                View All {category.name} <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export function Header({ user, token }: HeaderProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [showBanner, setShowBanner] = useState(true);
  const isLoggedIn = !!user;

  // Get categories from context (prefetched on server)
  const { categoryTree } = useCategoriesSafe();

  // Filter categories for navigation (exclude collections-type categories)
  const navCategories = useMemo(() => {
    return categoryTree.filter(cat => cat.slug !== "collections");
  }, [categoryTree]);

  const toggleCategory = (slug: string) => {
    setOpenCategories(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };

  const closeSheet = () => setIsSheetOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        {/* Announcement Bar */}
        {showBanner && (
          <div className="bg-primary text-primary-foreground py-2 text-sm px-4">
            <div className="flex items-center">
              <div className="w-6 shrink-0" />
              <p className="font-medium tracking-wide text-center flex-1">
                FREE SHIPPING ON ORDERS OVER ৳5,000 | USE CODE: BIGBOSS10
              </p>
              <button
                onClick={() => setShowBanner(false)}
                className="w-6 h-6 shrink-0 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                aria-label="Close announcement"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Header */}
        <Container>
          <nav className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Mobile Menu Button */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden p-2 -ml-2"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 bg-background border-border">
                <SheetHeader className="p-6 border-b border-border">
                  <SheetTitle>
                    <img
                      src="/bigboss-logo.png"
                      alt="BIGBOSS"
                      className="h-5 w-auto"
                    />
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-[calc(100%-80px)]">
                  {/* User Section */}
                  <div className="p-4 border-b border-border">
                    {isLoggedIn && user ? (
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          size="sm"
                          asChild
                        >
                          <Link href="/login" onClick={closeSheet}>
                            Sign In
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          size="sm"
                          asChild
                        >
                          <Link href="/register" onClick={closeSheet}>
                            Register
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Search Button */}
                  <div className="px-4 py-3 border-b border-border">
                    <button
                      onClick={() => {
                        setIsSheetOpen(false);
                        setIsSearchOpen(true);
                      }}
                      className="flex items-center gap-3 w-full h-10 px-3 rounded-md border border-input bg-muted/40 text-muted-foreground hover:bg-muted/60 transition-colors"
                    >
                      <Search className="size-4" />
                      <span className="text-sm">Search products...</span>
                    </button>
                  </div>

                  {/* Navigation */}
                  <div className="flex-1 overflow-y-auto py-4">
                    {/* All Products Link */}
                    <Link
                      href="/products"
                      onClick={closeSheet}
                      className="flex items-center px-6 py-3 text-base font-medium hover:bg-accent transition-colors"
                    >
                      All Products
                    </Link>

                    {/* Dynamic Categories with Subcategories */}
                    {categoryTree.map((category) => (
                      <MobileCategoryItem
                        key={category.slug}
                        category={category}
                        isOpen={openCategories.includes(category.slug)}
                        onToggle={() => toggleCategory(category.slug)}
                        onClose={closeSheet}
                      />
                    ))}

                    {/* Sale Link */}
                    <Link
                      href="/products?tags=sale"
                      onClick={closeSheet}
                      className="flex items-center px-6 py-3 text-base font-medium text-destructive hover:bg-accent transition-colors"
                    >
                      Sale
                    </Link>
                  </div>

                  {/* Bottom Actions for Logged In User */}
                  {isLoggedIn && (
                    <div className="border-t border-border p-4 space-y-1">
                      <Link
                        href="/profile/my-orders"
                        onClick={closeSheet}
                        className="flex items-center gap-3 px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                      >
                        <Package className="h-4 w-4" />
                        My Orders
                      </Link>
                      <Link
                        href="/account"
                        onClick={closeSheet}
                        className="flex items-center gap-3 px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Account Settings
                      </Link>
                      <form action="/api/auth/signout" method="POST">
                        <button
                          type="submit"
                          onClick={closeSheet}
                          className="flex items-center gap-3 px-2 py-2 text-sm text-destructive hover:bg-accent rounded-md transition-colors w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <img
                src="/bigboss-logo.png"
                alt="BIGBOSS"
                className="h-5 md:h-6 w-auto"
              />
            </Link>

            {/* Desktop Navigation with Mega Menu */}
            <div className="hidden lg:flex items-center gap-6">
              {/* All Products - Simple Link */}
              <Link
                href="/products"
                className="text-sm font-medium tracking-wide uppercase transition-colors link-underline"
              >
                All
              </Link>

              {/* Dynamic Categories with Mega Menu Dropdowns */}
              {navCategories.map((category) => (
                <DesktopCategoryMenu key={category.slug} category={category} />
              ))}

              {/* Sale - Simple Link with highlight */}
              <Link
                href="/products?tags=sale"
                className="text-sm font-medium tracking-wide uppercase transition-colors link-underline text-destructive"
              >
                Sale
              </Link>
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:block flex-1 max-w-md mx-8">
              <HeaderSearch />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* User Account */}
              {isLoggedIn && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-sm font-semibold">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-background border-border">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile/my-orders" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Account Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <form action="/api/auth/signout" method="POST">
                        <button
                          type="submit"
                          className="flex items-center text-destructive cursor-pointer w-full"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/login">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              )}

              {/* Cart */}
              <CartBadge token={token} />
            </div>
          </nav>
        </Container>
      </header>

      {/* Mobile Search Overlay */}
      <MobileSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
