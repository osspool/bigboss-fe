/**
 * CMS Types - Aligned with lib/cms-data.ts structure
 */

// ==================== Core Types ====================

export type CMSPageStatus = "draft" | "published" | "archived";

export interface CMSMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface CMSPage<T = Record<string, unknown>> {
  _id?: string;
  name: string;
  slug: string;
  status: CMSPageStatus;
  content: T;
  metadata: CMSMetadata;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CMSPagePayload {
  name?: string;
  status?: CMSPageStatus;
  content?: Record<string, unknown>;
  metadata?: Partial<CMSMetadata>;
}

// ==================== Shared Types ====================

interface CTA {
  label: string;
  href: string;
}

interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

// ==================== Page Content Types ====================
// Matches structure in lib/cms-data.ts

/**
 * Home Page Content
 */
export interface HomePageContent {
  hero: {
    badge: string;
    headline: string[];
    highlightedWord?: string;
    description: string;
    primaryCTA: CTA;
    secondaryCTA?: CTA;
    image?: string;
    floatingBadge?: { value: string; label: string };
  };
  marquee: {
    items: string[];
  };
  brandStory: {
    badge: string;
    headline: string[];
    paragraphs: string[];
    stats: Array<{ value: string; label: string }>;
    images: string[];
    cta: CTA;
  };
  featuredProducts: {
    badge: string;
    headline: string;
    description: string;
    cta: CTA;
  };
  testimonials: {
    badge: string;
    headline: string;
    items: Array<{
      id: number;
      name: string;
      location: string;
      rating: number;
      text: string;
      avatar: string;
    }>;
  };
  instagramFeed: {
    badge: string;
    headline: string;
    description: string;
    images: string[];
    cta: CTA;
  };
  features?: {
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  promoBanner?: {
    headline: string;
    subheadline: string;
    description: string;
    cta: CTA;
    backgroundImage: string;
  };
  lookbook?: {
    badge: string;
    headline: string;
    description: string;
    items: Array<{
      id: number;
      title: string;
      image: string;
      href: string;
    }>;
  };
  newsletter?: {
    headline: string;
    description: string;
    placeholder: string;
    buttonText: string;
    disclaimer: string;
  };
}

/**
 * Privacy/Terms/Cookies Page Content (Text pages with sections)
 */
export interface PolicyPageContent {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: Array<{
    title: string;
    content?: string;
    list?: string[];
    subsections?: Array<{
      title: string;
      content: string;
    }>;
    contact?: ContactInfo;
  }>;
}

/**
 * Returns Page Content
 */
export interface ReturnsPageContent {
  title: string;
  subtitle: string;
  steps: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  sections: Array<{
    type: "policy" | "grid" | "text";
    title: string;
    highlight?: { title: string; content: string };
    columns?: Array<{
      title: string;
      variant: "success" | "destructive";
      items: string[];
    }>;
    content?: string;
    paragraphs?: Array<string | { text: string; bold?: boolean; suffix?: string }>;
    list?: string[];
    footer?: string;
  }>;
  contactSection: {
    title: string;
    content: string;
    email: string;
    phone: string;
    hours: string;
  };
}

/**
 * FAQ Page Content
 */
export interface FAQPageContent {
  title: string;
  subtitle: string;
  categories: Array<{
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  }>;
  contactSection: {
    title: string;
    description: string;
    email: string;
    phone: string;
    hours: string;
  };
}

/**
 * About Page Content
 */
export interface AboutPageContent {
  hero: {
    badge: string;
    headline: string;
    description: string;
    image: string;
  };
  story: {
    title: string;
    paragraphs: string[];
  };
  values: {
    title: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  stats: Array<{ value: string; label: string }>;
  team: {
    title: string;
    description: string;
    members: Array<{
      name: string;
      role: string;
      image: string;
      bio: string;
    }>;
  };
  cta: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
}

/**
 * Contact Page Content
 * Note: contactInfo icons are static (MapPin, Phone, Mail) - no icon field needed
 */
export interface ContactPageContent {
  title: string;
  subtitle: string;
  contactInfo: Array<{
    title: string;
    lines: string[];
  }>;
  form: {
    title: string;
    description: string;
    fields: Array<{
      name: string;
      label: string;
      type: string;
      placeholder?: string;
      required: boolean;
      options?: string[];
    }>;
    submitText: string;
  };
  faq?: {
    title: string;
    description: string;
    link: string;
    linkText: string;
  };
  socialTitle?: string;
  socials: Array<{
    platform: string;
    handle: string;
    url: string;
  }>;
  map?: {
    title: string;
    embedUrl: string;
  };
}

/**
 * Size Guide Page Content
 */
export interface SizeGuidePageContent {
  title: string;
  subtitle: string;
  howToMeasure: {
    title: string;
    description: string;
    measurements: Array<{
      name: string;
      icon: string;
      instruction: string;
    }>;
  };
  sizeTables: Array<{
    category: string;
    description: string;
    headers: string[];
    rows: string[][];
  }>;
  fitTypes: {
    title: string;
    types: Array<{
      name: string;
      description: string;
      recommendation: string;
    }>;
  };
  tips: {
    title: string;
    items: string[];
  };
  helpSection: {
    title: string;
    description: string;
    email: string;
    phone: string;
  };
}

// ==================== Slug to Content Type Map ====================

export type CMSContentBySlug = {
  home: HomePageContent;
  "privacy-policy": PolicyPageContent;
  "terms-conditions": PolicyPageContent;
  cookies: PolicyPageContent;
  "returns-refunds": ReturnsPageContent;
  faqs: FAQPageContent;
  "about-us": AboutPageContent;
  contact: ContactPageContent;
  "size-guide": SizeGuidePageContent;
};

export type CMSSlug = keyof CMSContentBySlug;
