/**
 * Predefined CMS Pages Configuration
 * These are the only pages that can be managed through the CMS dashboard
 * Frontend doesn't support dynamic page creation - only updating these predefined pages
 */

export const PREDEFINED_CMS_PAGES = [
  {
    slug: "home",
    name: "Home Page",
    description: "Main landing page with hero, featured products, testimonials",
    icon: "Home",
    route: "/",
    fields: ["hero", "marquee", "brandStory", "featuredProducts", "testimonials", "instagramFeed"],
  },
  {
    slug: "about-us",
    name: "About Us",
    description: "Company information, story, and mission",
    icon: "Info",
    route: "/about",
    fields: ["heading", "content", "team", "values"],
  },
  {
    slug: "contact",
    name: "Contact Us",
    description: "Contact information and form",
    icon: "Mail",
    route: "/contact",
    fields: ["email", "phone", "address", "social", "form"],
  },
  {
    slug: "faqs",
    name: "FAQs",
    description: "Frequently asked questions",
    icon: "HelpCircle",
    route: "/faqs",
    fields: ["categories", "questions"],
  },
  {
    slug: "privacy-policy",
    name: "Privacy Policy",
    description: "Privacy policy and data protection",
    icon: "Shield",
    route: "/privacy",
    fields: ["title", "content", "lastUpdated"],
  },
  {
    slug: "terms-conditions",
    name: "Terms & Conditions",
    description: "Terms of service and conditions",
    icon: "ScrollText",
    route: "/terms",
    fields: ["title", "content", "lastUpdated"],
  },
  {
    slug: "returns-refunds",
    name: "Returns & Refunds",
    description: "Return and refund policy",
    icon: "RotateCcw",
    route: "/returns",
    fields: ["title", "content", "process", "timeline"],
  },
  {
    slug: "size-guide",
    name: "Size Guide",
    description: "Product sizing information",
    icon: "Ruler",
    route: "/size-guide",
    fields: ["title", "content", "charts", "measurements"],
  },
  {
    slug: "shipping-delivery",
    name: "Shipping & Delivery",
    description: "Shipping methods and delivery information",
    icon: "Truck",
    route: "/shipping",
    fields: ["title", "content", "methods", "areas", "timeline"],
  },
];

/**
 * Get page config by slug
 */
export function getPageConfig(slug) {
  return PREDEFINED_CMS_PAGES.find((p) => p.slug === slug);
}

/**
 * Get default page content structure
 * Returns minimal default content for a new page
 */
export function getDefaultPageContent(slug) {
  const defaults = {
    home: {
      hero: {
        badge: "New Collection",
        headline: ["DEFINE", "YOUR", "STYLE"],
        description: "Premium streetwear for those who dare to stand out",
        primaryCTA: { label: "Shop Now", href: "/products" },
        secondaryCTA: { label: "Learn More", href: "/about" },
      },
      marquee: {
        items: ["FREE SHIPPING", "NEW ARRIVALS", "PREMIUM QUALITY"],
      },
    },
    "about-us": {
      heading: "About Us",
      content: "Tell your story here...",
    },
    contact: {
      email: "contact@example.com",
      phone: "+880 1234567890",
      address: "Dhaka, Bangladesh",
    },
    faqs: {
      categories: [],
      questions: [],
    },
    "privacy-policy": {
      title: "Privacy Policy",
      content: "Your privacy policy content here...",
      lastUpdated: new Date().toISOString(),
    },
    "terms-conditions": {
      title: "Terms & Conditions",
      content: "Your terms and conditions here...",
      lastUpdated: new Date().toISOString(),
    },
    "returns-refunds": {
      title: "Returns & Refunds Policy",
      content: "Your return policy here...",
    },
    "size-guide": {
      title: "Size Guide",
      content: "Sizing information here...",
    },
    "shipping-delivery": {
      title: "Shipping & Delivery",
      content: "Shipping information here...",
    },
  };

  return defaults[slug] || { title: "New Page", content: "" };
}
