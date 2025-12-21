// Navigation and Category Constants for BigBoss Retail

// Currency formatting
export const CURRENCY = "৳";
export const CURRENCY_LOCALE = "en-BD";

export function formatPrice(price: number): string {
  return `${CURRENCY}${price.toLocaleString(CURRENCY_LOCALE)}`;
}

export function getDiscountPercentage(original: number, current: number): number {
  return Math.round(((original - current) / original) * 100);
}

// Available tag filters for product listing
export const TAG_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "New Arrivals", value: "new-arrivals" },
  { label: "Best Sellers", value: "best-sellers" },
  { label: "On Sale", value: "sale" },
] as const;

// Sort options that map to API sort params
export const SORT_OPTIONS = [
  { label: "Newest", value: "newest", apiSort: "-createdAt" },
  { label: "Price: Low to High", value: "price-asc", apiSort: "basePrice" },
  { label: "Price: High to Low", value: "price-desc", apiSort: "-basePrice" },
  { label: "Best Selling", value: "best-selling", apiSort: "-stats.totalSales" },
  { label: "Top Rated", value: "top-rated", apiSort: "-averageRating" },
] as const;

// Default price limits for filter slider
export const DEFAULT_PRICE_LIMIT = { min: 0, max: 50000 };

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 24;
export const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;

export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Category types
export interface Subcategory {
  label: string;
  slug: string;
  image?: string;
}

export interface Category {
  label: string;
  slug: string;
  image?: string;
  subcategories: Subcategory[];
}

export const CATEGORIES = {
  men: {
    label: "Men",
    slug: "men",
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400&h=500&fit=crop",
    subcategories: [
      { label: "T-Shirts", slug: "t-shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop" },
      { label: "Hoodies", slug: "hoodies", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=80&h=80&fit=crop" },
      { label: "Jeans", slug: "jeans", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&h=80&fit=crop" },
      { label: "Jackets", slug: "jackets", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=80&h=80&fit=crop" },
      { label: "Sneakers", slug: "sneakers", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=80&h=80&fit=crop" },
      { label: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=80&h=80&fit=crop" },
    ],
  },
  women: {
    label: "Women",
    slug: "women",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop",
    subcategories: [
      { label: "Tops", slug: "tops", image: "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=80&h=80&fit=crop" },
      { label: "Dresses", slug: "dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=80&h=80&fit=crop" },
      { label: "Jeans", slug: "jeans", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=80&h=80&fit=crop" },
      { label: "Jackets", slug: "jackets", image: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=80&h=80&fit=crop" },
      { label: "Sneakers", slug: "sneakers", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=80&h=80&fit=crop" },
      { label: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=80&h=80&fit=crop" },
    ],
  },
  kids: {
    label: "Kids",
    slug: "kids",
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=500&fit=crop",
    subcategories: [
      { label: "T-Shirts", slug: "t-shirts", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=80&h=80&fit=crop" },
      { label: "Hoodies", slug: "hoodies", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=80&h=80&fit=crop" },
      { label: "Pants", slug: "pants", image: "https://images.unsplash.com/photo-1598032895397-5799f5e8c92f?w=80&h=80&fit=crop" },
      { label: "Jackets", slug: "jackets", image: "https://images.unsplash.com/photo-1622290291119-b7450dc1e2e1?w=80&h=80&fit=crop" },
      { label: "Sneakers", slug: "sneakers", image: "https://images.unsplash.com/photo-1514989771522-458c9b6c035a?w=80&h=80&fit=crop" },
    ],
  },
  collections: {
    label: "Collections",
    slug: "collections",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea6c52dd?w=400&h=500&fit=crop",
    subcategories: [
      { label: "New Arrivals", slug: "new-arrivals" },
      { label: "Best Sellers", slug: "best-sellers" },
      { label: "Limited Edition", slug: "limited-edition" },
      { label: "Sale", slug: "sale" },
    ],
  },
} satisfies Record<string, Category>;

export const FOOTER_LINKS = {
  shop: {
    title: "Shop",
    links: [
      { label: "New Arrivals", href: "/products?tags[in]=new-arrivals" },
      { label: "Best Sellers", href: "/products?tags[in]=best-sellers" },
      { label: "Sale", href: "/products?tags[in]=sale" },
      { label: "All Products", href: "/products" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      // { label: "Careers", href: "/careers" },
      // { label: "Stores", href: "/stores" },
    ],
  },
  help: {
    title: "Help",
    links: [
      { label: "Shipping & Returns", href: "/returns" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "FAQ", href: "/faqs" },
      // { label: "Track Order", href: "/track-order" },
    ],
  },
  // legal: {
  //   title: "Legal",
  //   links: [
  //     { label: "Privacy Policy", href: "/privacy" },
  //     { label: "Terms of Service", href: "/legal/terms" },
  //     { label: "Refund Policy", href: "/legal/refunds" },
  //   ],
  // },
} as const;

