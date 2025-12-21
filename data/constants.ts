// BigBoss Categories
export const CATEGORIES = {
    men: {
      label: "Men",
      slug: "men",
      image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&h=500&fit=crop",
      subcategories: [
        { label: "T-Shirts", slug: "t-shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop" },
        { label: "Hoodies", slug: "hoodies", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100&h=100&fit=crop" },
        { label: "Jackets", slug: "jackets", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&h=100&fit=crop" },
        { label: "Pants", slug: "pants", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100&h=100&fit=crop" },
        { label: "Shorts", slug: "shorts", image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=100&h=100&fit=crop" },
        { label: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=100&h=100&fit=crop" },
      ],
    },
    women: {
      label: "Women",
      slug: "women",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop",
      subcategories: [
        { label: "Tops", slug: "tops", image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=100&h=100&fit=crop" },
        { label: "Dresses", slug: "dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop" },
        { label: "Hoodies", slug: "hoodies", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&h=100&fit=crop" },
        { label: "Pants", slug: "pants", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=100&h=100&fit=crop" },
        { label: "Skirts", slug: "skirts", image: "https://images.unsplash.com/photo-1583496661160-fb5886a0uj3a?w=100&h=100&fit=crop" },
        { label: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=100&h=100&fit=crop" },
      ],
    },
    kids: {
      label: "Kids",
      slug: "kids",
      image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=500&fit=crop",
      subcategories: [
        { label: "Boys", slug: "boys", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=100&h=100&fit=crop" },
        { label: "Girls", slug: "girls", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=100&h=100&fit=crop" },
      ],
    },
    collections: {
      label: "Collections",
      slug: "collections",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
      subcategories: [
        { label: "New Arrivals", slug: "new-arrivals", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop" },
        { label: "Best Sellers", slug: "best-sellers", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&h=100&fit=crop" },
        { label: "Sale", slug: "sale", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&h=100&fit=crop" },
        { label: "Limited Edition", slug: "limited-edition", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop" },
      ],
    },
  } as const;
  
  export const CATEGORY_LIST = Object.values(CATEGORIES);
  
  // Navigation items
  export const NAV_ITEMS = [
    { label: "New", href: "/products?tags=new-arrivals" },
    { label: "Men", href: "/products?parentCategory=men" },
    { label: "Women", href: "/products?parentCategory=women" },
    { label: "Kids", href: "/products?parentCategory=kids" },
    { label: "Sale", href: "/products?tags=sale", highlight: true },
  ];
  
  // Footer links
  export const FOOTER_LINKS = {
    shop: {
      title: "Shop",
      links: [
        { label: "New Arrivals", href: "/products?tags=new-arrivals" },
        { label: "Best Sellers", href: "/products?tags=best-sellers" },
        { label: "Men", href: "/products?parentCategory=men" },
        { label: "Women", href: "/products?parentCategory=women" },
        { label: "Sale", href: "/products?tags=sale" },
      ],
    },
    help: {
      title: "Help",
      links: [
        { label: "Contact Us", href: "/contact" },
        { label: "Shipping Info", href: "/shipping" },
        { label: "Returns & Exchanges", href: "/returns" },
        { label: "Size Guide", href: "/size-guide" },
        { label: "FAQs", href: "/faqs" },
      ],
    },
    company: {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Store Locator", href: "/stores" },
      ],
    },
    legal: {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
      ],
    },
  };
  
  // Social links
  export const SOCIAL_LINKS = [
    { label: "Instagram", href: "https://instagram.com/bigboss", icon: "instagram" },
    { label: "Twitter", href: "https://twitter.com/bigboss", icon: "twitter" },
    { label: "Facebook", href: "https://facebook.com/bigboss", icon: "facebook" },
    { label: "TikTok", href: "https://tiktok.com/@bigboss", icon: "tiktok" },
  ];
  
  // Size options
  export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

  // Color options (for display)
  export const COLORS = [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Gray", value: "#6B7280" },
    { name: "Navy", value: "#1E3A5F" },
    { name: "Olive", value: "#4B5320" },
    { name: "Burgundy", value: "#722F37" },
    { name: "Red", value: "#DC2626" },
    { name: "Blue", value: "#2563EB" },
    { name: "Green", value: "#16A34A" },
    { name: "Yellow", value: "#EAB308" },
    { name: "Purple", value: "#9333EA" },
    { name: "Pink", value: "#EC4899" },
    { name: "Orange", value: "#F97316" },
    { name: "Teal", value: "#14B8A6" },
    { name: "Brown", value: "#92400E" },
    { name: "Beige", value: "#D4B896" },
    { name: "Cream", value: "#FFFDD0" },
    { name: "Charcoal", value: "#36454F" },
  ] as const;

  // Predefined variation types for products
  export const VARIATION_TYPES = {
    SIZE: {
      name: "Size",
      options: SIZES.map(size => ({
        value: size,
        priceModifier: 0,
        quantity: 0,
        images: []
      })),
    },
    COLOR: {
      name: "Color",
      options: COLORS.map(color => ({
        value: color.name,
        priceModifier: 0,
        quantity: 0,
        images: []
      })),
    },
  } as const;

  // Available variation options for product forms
  export const AVAILABLE_VARIATIONS = [
    { value: "Size", label: "Size", type: "SIZE" },
    { value: "Color", label: "Color", type: "COLOR" },
  ] as const;

  // Product style options
  export const PRODUCT_STYLES = [
    { value: "casual", label: "Casual" },
    { value: "street", label: "Street" },
    { value: "urban", label: "Urban" },
    { value: "desi", label: "Desi" },
    { value: "formal", label: "Formal" },
    { value: "sport", label: "Sport" },
    { value: "ethnic", label: "Ethnic" },
    { value: "party", label: "Party" },
  ] as const;

  // Price formatting
  export const formatPrice = (amount: number, currency = "BDT"): string => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate discount percentage
  export const getDiscountPercentage = (original: number, discounted: number): number => {
    return Math.round(((original - discounted) / original) * 100);
  };

  

  export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

// Size Guide Data
export interface SizeTableData {
  category: string;
  description: string;
  headers: string[];
  rows: string[][];
}

export interface FitType {
  name: string;
  description: string;
  recommendation: string;
}

export const SIZE_GUIDE = {
  sizeTables: [
    {
      category: "T-Shirts & Tops",
      description: "All measurements are in inches. For the best fit, measure a similar garment that fits you well.",
      headers: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
      rows: [
        ["XS", "34-36", "26", "16", "7.5"],
        ["S", "36-38", "27", "17", "8"],
        ["M", "38-40", "28", "18", "8.5"],
        ["L", "40-42", "29", "19", "9"],
        ["XL", "42-44", "30", "20", "9.5"],
        ["XXL", "44-46", "31", "21", "10"],
      ],
    },
    {
      category: "Hoodies & Jackets",
      description: "Outerwear measurements. Consider layering when choosing your size.",
      headers: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
      rows: [
        ["XS", "36-38", "25", "17", "24"],
        ["S", "38-40", "26", "18", "25"],
        ["M", "40-42", "27", "19", "26"],
        ["L", "42-44", "28", "20", "27"],
        ["XL", "44-46", "29", "21", "28"],
        ["XXL", "46-48", "30", "22", "29"],
      ],
    },
    {
      category: "Pants & Shorts",
      description: "Waist is measured at the natural waistline. Inseam varies by style.",
      headers: ["Size", "Waist", "Hip", "Inseam (Pants)", "Inseam (Shorts)"],
      rows: [
        ["XS", "28-30", "34-36", "30", "7"],
        ["S", "30-32", "36-38", "31", "7.5"],
        ["M", "32-34", "38-40", "32", "8"],
        ["L", "34-36", "40-42", "32", "8.5"],
        ["XL", "36-38", "42-44", "33", "9"],
        ["XXL", "38-40", "44-46", "33", "9.5"],
      ],
    },
  ] as SizeTableData[],
  fitTypes: {
    title: "Understanding Fit Types",
    types: [
      {
        name: "Slim Fit",
        description: "Tailored close to the body for a modern, streamlined look. Best for lean body types.",
        recommendation: "If you prefer more room, consider sizing up.",
      },
      {
        name: "Regular Fit",
        description: "Classic cut with comfortable room through the body. Works well for most body types.",
        recommendation: "Order your usual size for a balanced fit.",
      },
      {
        name: "Relaxed Fit",
        description: "Generous room throughout for maximum comfort. Ideal for a casual, laid-back style.",
        recommendation: "Order your usual size or size down for a less oversized look.",
      },
      {
        name: "Oversized Fit",
        description: "Intentionally roomy with dropped shoulders. Perfect for streetwear aesthetics.",
        recommendation: "These run large by design. Consider your usual size.",
      },
    ] as FitType[],
  },
  tips: {
    title: "How to Measure",
    items: [
      "Use a soft measuring tape for accurate measurements.",
      "Measure over light clothing or undergarments.",
      "For chest, measure around the fullest part with arms at your sides.",
      "For waist, measure at your natural waistline (usually at the belly button).",
      "For hips, measure around the fullest part of your hips.",
      "When in doubt between two sizes, choose the larger size for comfort.",
    ],
  },
} as const;