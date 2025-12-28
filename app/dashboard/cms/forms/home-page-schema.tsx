import { field, section } from "@/components/form/form-system";
import { ALL_ROUTES } from "@/constants/routes";
import { Sparkles, MessageSquare, Instagram, Mail, Image, Trophy } from "lucide-react";

/**
 * Homepage Form Schema with Tabs
 * Matches HomePageContent in types/cms.types.ts
 */
export const homePageSchema = () => ({
  // Define tabs for the CMS form
  tabs: [
    {
      id: "hero",
      label: "Hero",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      id: "content",
      label: "Content",
      icon: <Image className="h-4 w-4" />,
    },
    {
      id: "social",
      label: "Social",
      icon: <Instagram className="h-4 w-4" />,
    },
    {
      id: "engagement",
      label: "Engagement",
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ],

  // Sections organized by tab
  sections: {
    // === HERO TAB ===
    hero: [
      section(
        "hero-content",
        "Hero Content",
        [
          field.text("hero.badge", "Badge Text", {
            placeholder: "Winter Collection 2024",
            description: "Small badge above headline",
          }),
          field.text("hero.headline.0", "Headline Line 1", {
            required: true,
            placeholder: "DEFINE",
          }),
          field.text("hero.headline.1", "Headline Line 2", {
            placeholder: "YOUR",
          }),
          field.text("hero.headline.2", "Headline Line 3", {
            placeholder: "STYLE",
          }),
          field.text("hero.highlightedWord", "Highlighted Word", {
            placeholder: "STYLE",
            description: "Word to display in italic",
          }),
          field.textarea("hero.description", "Description", {
            placeholder: "Premium streetwear crafted for those who dare to stand out...",
            rows: 3,
            fullWidth: true,
          }),
        ],
        { cols: 2 }
      ),

      section(
        "hero-cta",
        "Call to Action Buttons",
        [
          field.text("hero.primaryCTA.label", "Primary Button Label", {
            required: true,
            placeholder: "Shop Collection",
          }),
          field.combobox("hero.primaryCTA.href", "Primary Button Link", ALL_ROUTES, {
            required: true,
            placeholder: "/products",
            description: "Select a page or type a custom link (e.g., /products, /about)",
            searchPlaceholder: "Search pages or type custom link...",
            emptyText: "Type a custom link like /products",
          }),
          field.text("hero.secondaryCTA.label", "Secondary Button Label", {
            placeholder: "New Arrivals",
          }),
          field.combobox("hero.secondaryCTA.href", "Secondary Button Link", ALL_ROUTES, {
            placeholder: "/products?tags=new-arrivals",
            description: "Select a page or type a custom link",
            searchPlaceholder: "Search pages or type custom link...",
            emptyText: "Type a custom link",
          }),
        ],
        { cols: 2 }
      ),

      section(
        "hero-visuals",
        "Visual Elements",
        [
          field.text("hero.image", "Hero Image URL", {
            placeholder: "https://images.unsplash.com/...",
            description: "Full URL to hero background image",
            fullWidth: true,
          }),
          field.text("hero.floatingBadge.value", "Floating Badge Value", {
            placeholder: "30%",
          }),
          field.text("hero.floatingBadge.label", "Floating Badge Label", {
            placeholder: "Off First Order",
          }),
        ],
        { cols: 2 }
      ),

      section(
        "marquee-section",
        "Marquee Announcements",
        [
          field.text("marquee.items.0", "Item 1", {
            placeholder: "FREE SHIPPING OVER ৳2000",
          }),
          field.text("marquee.items.1", "Item 2", {
            placeholder: "NEW ARRIVALS WEEKLY",
          }),
          field.text("marquee.items.2", "Item 3", {
            placeholder: "PREMIUM QUALITY",
          }),
          field.text("marquee.items.3", "Item 4", {
            placeholder: "EASY RETURNS",
          }),
        ],
        { cols: 2 }
      ),
    ],

    // === CONTENT TAB ===
    content: [
      section(
        "brand-story-content",
        "Brand Story",
        [
          field.text("brandStory.badge", "Badge", {
            placeholder: "Our Story",
          }),
          field.text("brandStory.headline.0", "Headline Line 1", {
            placeholder: "BORN TO",
          }),
          field.text("brandStory.headline.1", "Headline Line 2", {
            placeholder: "STAND OUT",
          }),
          field.textarea("brandStory.paragraphs.0", "Paragraph 1", {
            rows: 3,
            placeholder: "BigBoss was founded with a simple mission...",
            fullWidth: true,
          }),
          field.textarea("brandStory.paragraphs.1", "Paragraph 2", {
            rows: 3,
            placeholder: "Every piece in our collection is thoughtfully designed...",
            fullWidth: true,
          }),
          field.textarea("brandStory.paragraphs.2", "Paragraph 3", {
            rows: 3,
            placeholder: "From the streets of Dhaka to wardrobes worldwide...",
            fullWidth: true,
          }),
        ],
        { cols: 1 }
      ),

      section(
        "brand-story-stats",
        "Statistics",
        [
          field.text("brandStory.stats.0.value", "Stat 1 Value", {
            placeholder: "10K+",
          }),
          field.text("brandStory.stats.0.label", "Stat 1 Label", {
            placeholder: "Happy Customers",
          }),
          field.text("brandStory.stats.1.value", "Stat 2 Value", {
            placeholder: "500+",
          }),
          field.text("brandStory.stats.1.label", "Stat 2 Label", {
            placeholder: "Products",
          }),
        ],
        { cols: 2 }
      ),

      section(
        "brand-story-images",
        "Images & CTA",
        [
          field.text("brandStory.images.0", "Image 1 URL", {
            placeholder: "https://images.unsplash.com/...",
            description: "Full URL to first brand story image",
          }),
          field.text("brandStory.images.1", "Image 2 URL", {
            placeholder: "https://images.unsplash.com/...",
            description: "Full URL to second brand story image",
          }),
          field.text("brandStory.cta.label", "CTA Label", {
            placeholder: "Learn More",
          }),
          field.combobox("brandStory.cta.href", "CTA Link", ALL_ROUTES, {
            placeholder: "/about",
            description: "Select a page or type a custom link",
            searchPlaceholder: "Search pages or type custom link...",
            emptyText: "Type a custom link",
          }),
        ],
        { cols: 2 }
      ),

      section(
        "featured-products",
        "Featured Products Section",
        [
          field.text("featuredProducts.badge", "Badge", {
            placeholder: "Curated Selection",
          }),
          field.text("featuredProducts.headline", "Headline", {
            placeholder: "TRENDING NOW",
          }),
          field.textarea("featuredProducts.description", "Description", {
            placeholder: "Our most-loved pieces, handpicked for you...",
            rows: 2,
            fullWidth: true,
          }),
          field.text("featuredProducts.cta.label", "CTA Label", {
            placeholder: "View All Products",
          }),
          field.combobox("featuredProducts.cta.href", "CTA Link", ALL_ROUTES, {
            placeholder: "/products",
            description: "Select a page or type a custom link",
            searchPlaceholder: "Search pages or type custom link...",
            emptyText: "Type a custom link",
          }),
        ],
        { cols: 1 }
      ),
    ],

    // === SOCIAL TAB ===
    social: [
      section(
        "testimonials-header",
        "Testimonials",
        [
          field.text("testimonials.badge", "Badge", {
            placeholder: "What Our Customers Say",
          }),
          field.text("testimonials.headline", "Headline", {
            placeholder: "REAL STYLE, REAL PEOPLE",
          }),
        ],
        { cols: 2 }
      ),

      section(
        "testimonial-1",
        "Testimonial 1",
        [
          field.text("testimonials.items.0.name", "Name", {
            placeholder: "Rafiq Ahmed",
          }),
          field.text("testimonials.items.0.location", "Location", {
            placeholder: "Dhaka",
          }),
          field.number("testimonials.items.0.rating", "Rating", {
            placeholder: "5",
            min: 1,
            max: 5,
            description: "Rating from 1-5 stars",
          }),
          field.text("testimonials.items.0.avatar", "Avatar URL", {
            placeholder: "https://images.unsplash.com/...",
            description: "Full URL to avatar image",
          }),
          field.textarea("testimonials.items.0.text", "Review", {
            rows: 2,
            placeholder: "The quality is absolutely unmatched...",
            fullWidth: true,
          }),
        ],
        { cols: 2, collapsible: true, defaultOpen: true }
      ),

      section(
        "testimonial-2",
        "Testimonial 2",
        [
          field.text("testimonials.items.1.name", "Name", {
            placeholder: "Fatima Khan",
          }),
          field.text("testimonials.items.1.location", "Location", {
            placeholder: "Chittagong",
          }),
          field.number("testimonials.items.1.rating", "Rating", {
            placeholder: "5",
            min: 1,
            max: 5,
            description: "Rating from 1-5 stars",
          }),
          field.text("testimonials.items.1.avatar", "Avatar URL", {
            placeholder: "https://images.unsplash.com/...",
            description: "Full URL to avatar image",
          }),
          field.textarea("testimonials.items.1.text", "Review", {
            rows: 2,
            placeholder: "Finally found a brand that understands modern streetwear...",
            fullWidth: true,
          }),
        ],
        { cols: 2, collapsible: true, defaultOpen: false }
      ),

      section(
        "testimonial-3",
        "Testimonial 3",
        [
          field.text("testimonials.items.2.name", "Name", {
            placeholder: "Imran Hassan",
          }),
          field.text("testimonials.items.2.location", "Location", {
            placeholder: "Sylhet",
          }),
          field.number("testimonials.items.2.rating", "Rating", {
            placeholder: "5",
            min: 1,
            max: 5,
            description: "Rating from 1-5 stars",
          }),
          field.text("testimonials.items.2.avatar", "Avatar URL", {
            placeholder: "https://images.unsplash.com/...",
            description: "Full URL to avatar image",
          }),
          field.textarea("testimonials.items.2.text", "Review", {
            rows: 2,
            placeholder: "Customer service is amazing...",
            fullWidth: true,
          }),
        ],
        { cols: 2, collapsible: true, defaultOpen: false }
      ),

      section(
        "instagram-feed",
        "Instagram Feed",
        [
          field.text("instagramFeed.badge", "Badge", {
            placeholder: "Follow Us",
          }),
          field.text("instagramFeed.headline", "Headline", {
            placeholder: "@BIGBOSS.BD",
          }),
          field.textarea("instagramFeed.description", "Description", {
            placeholder: "Join our community and show us how you style BigBoss.",
            rows: 2,
            fullWidth: true,
          }),
          field.text("instagramFeed.images.0", "Image 1 URL", {
            placeholder: "https://images.unsplash.com/...",
            description: "Full URL to image",
          }),
          field.text("instagramFeed.images.1", "Image 2 URL", {
            placeholder: "https://images.unsplash.com/...",
            description: "Full URL to image",
          }),
          field.text("instagramFeed.images.2", "Image 3 URL", {
            placeholder: "https://images.unsplash.com/...",
            description: "Full URL to image",
          }),
          field.text("instagramFeed.images.3", "Image 4 URL", {
            placeholder: "https://images.unsplash.com/...",
            description: "Full URL to image",
          }),
          field.text("instagramFeed.images.4", "Image 5 URL", {
            placeholder: "https://images.unsplash.com/...",
            description: "Full URL to image",
          }),
          field.text("instagramFeed.images.5", "Image 6 URL", {
            placeholder: "https://images.unsplash.com/...",
            description: "Full URL to image",
          }),
          field.text("instagramFeed.cta.label", "CTA Label", {
            placeholder: "Follow on Instagram",
          }),
          field.text("instagramFeed.cta.href", "CTA Link", {
            placeholder: "https://instagram.com/bigboss.bd",
            description: "Full URL to your Instagram profile",
            fullWidth: true,
          }),
        ],
        { cols: 2 }
      ),
    ],

    // === ENGAGEMENT TAB ===
    engagement: [
      section(
        "newsletter",
        "Newsletter Section",
        [
          field.text("newsletter.headline", "Headline", {
            placeholder: "JOIN THE MOVEMENT",
          }),
          field.textarea("newsletter.description", "Description", {
            rows: 2,
            placeholder: "Subscribe for exclusive drops, early access, and 10% off your first order.",
            fullWidth: true,
          }),
          field.text("newsletter.placeholder", "Input Placeholder", {
            placeholder: "Enter your email",
            description: "Placeholder text for email input",
          }),
          field.text("newsletter.buttonText", "Button Text", {
            placeholder: "Subscribe",
          }),
          field.textarea("newsletter.disclaimer", "Disclaimer", {
            rows: 2,
            placeholder: "By subscribing, you agree to our Privacy Policy and consent to receive updates.",
            fullWidth: true,
          }),
        ],
        { cols: 1 }
      ),
    ],
  },
});
