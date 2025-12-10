import { field, section } from "@/components/form/form-system";

/**
 * Homepage Form Schema
 * Matches HomePageContent in types/cms.types.ts
 */
export const homePageSchema = () => ({
  sections: [
    // Hero Section
    section(
      "hero",
      "Hero Section",
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
        }),
        field.text("hero.primaryCTA.label", "Primary Button Label", {
          required: true,
          placeholder: "Shop Collection",
        }),
        field.url("hero.primaryCTA.href", "Primary Button Link", {
          required: true,
          placeholder: "/products",
        }),
        field.text("hero.secondaryCTA.label", "Secondary Button Label", {
          placeholder: "New Arrivals",
        }),
        field.url("hero.secondaryCTA.href", "Secondary Button Link", {
          placeholder: "/products?category=new-arrivals",
        }),
        field.url("hero.image", "Hero Image URL", {
          placeholder: "https://images.unsplash.com/...",
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

    // Marquee Section
    section(
      "marquee",
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

    // Brand Story Section
    section(
      "brandStory",
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
        }),
        field.textarea("brandStory.paragraphs.1", "Paragraph 2", {
          rows: 3,
          placeholder: "Every piece in our collection is thoughtfully designed...",
        }),
        field.textarea("brandStory.paragraphs.2", "Paragraph 3", {
          rows: 3,
          placeholder: "From the streets of Dhaka to wardrobes worldwide...",
        }),
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
        field.url("brandStory.images.0", "Image 1 URL", {
          placeholder: "https://images.unsplash.com/...",
        }),
        field.url("brandStory.images.1", "Image 2 URL", {
          placeholder: "https://images.unsplash.com/...",
        }),
        field.text("brandStory.cta.label", "CTA Label", {
          placeholder: "Learn More",
        }),
        field.url("brandStory.cta.href", "CTA Link", {
          placeholder: "/about",
        }),
      ],
      { cols: 2 }
    ),

    // Featured Products Section
    section(
      "featuredProducts",
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
        }),
        field.text("featuredProducts.cta.label", "CTA Label", {
          placeholder: "View All Products",
        }),
        field.url("featuredProducts.cta.href", "CTA Link", {
          placeholder: "/products",
        }),
      ],
      { cols: 2 }
    ),

    // Testimonials Section
    section(
      "testimonials",
      "Testimonials",
      [
        field.text("testimonials.badge", "Badge", {
          placeholder: "What Our Customers Say",
        }),
        field.text("testimonials.headline", "Headline", {
          placeholder: "REAL STYLE, REAL PEOPLE",
        }),
        // Testimonial 1
        field.text("testimonials.items.0.name", "Person 1 Name", {
          placeholder: "Rafiq Ahmed",
        }),
        field.text("testimonials.items.0.location", "Person 1 Location", {
          placeholder: "Dhaka",
        }),
        field.number("testimonials.items.0.rating", "Person 1 Rating", {
          placeholder: "5",
        }),
        field.textarea("testimonials.items.0.text", "Person 1 Review", {
          rows: 2,
          placeholder: "The quality is absolutely unmatched...",
        }),
        field.url("testimonials.items.0.avatar", "Person 1 Avatar URL", {
          placeholder: "https://images.unsplash.com/...",
        }),
        // Testimonial 2
        field.text("testimonials.items.1.name", "Person 2 Name", {
          placeholder: "Fatima Khan",
        }),
        field.text("testimonials.items.1.location", "Person 2 Location", {
          placeholder: "Chittagong",
        }),
        field.number("testimonials.items.1.rating", "Person 2 Rating", {
          placeholder: "5",
        }),
        field.textarea("testimonials.items.1.text", "Person 2 Review", {
          rows: 2,
          placeholder: "Finally found a brand that understands modern streetwear...",
        }),
        field.url("testimonials.items.1.avatar", "Person 2 Avatar URL", {
          placeholder: "https://images.unsplash.com/...",
        }),
        // Testimonial 3
        field.text("testimonials.items.2.name", "Person 3 Name", {
          placeholder: "Imran Hassan",
        }),
        field.text("testimonials.items.2.location", "Person 3 Location", {
          placeholder: "Sylhet",
        }),
        field.number("testimonials.items.2.rating", "Person 3 Rating", {
          placeholder: "5",
        }),
        field.textarea("testimonials.items.2.text", "Person 3 Review", {
          rows: 2,
          placeholder: "Customer service is amazing...",
        }),
        field.url("testimonials.items.2.avatar", "Person 3 Avatar URL", {
          placeholder: "https://images.unsplash.com/...",
        }),
      ],
      { cols: 2 }
    ),

    // Instagram Feed Section
    section(
      "instagramFeed",
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
        }),
        field.url("instagramFeed.images.0", "Image 1 URL", {
          placeholder: "https://images.unsplash.com/...",
        }),
        field.url("instagramFeed.images.1", "Image 2 URL", {
          placeholder: "https://images.unsplash.com/...",
        }),
        field.url("instagramFeed.images.2", "Image 3 URL", {
          placeholder: "https://images.unsplash.com/...",
        }),
        field.url("instagramFeed.images.3", "Image 4 URL", {
          placeholder: "https://images.unsplash.com/...",
        }),
        field.url("instagramFeed.images.4", "Image 5 URL", {
          placeholder: "https://images.unsplash.com/...",
        }),
        field.url("instagramFeed.images.5", "Image 6 URL", {
          placeholder: "https://images.unsplash.com/...",
        }),
        field.text("instagramFeed.cta.label", "CTA Label", {
          placeholder: "Follow on Instagram",
        }),
        field.url("instagramFeed.cta.href", "CTA Link", {
          placeholder: "https://instagram.com/bigboss.bd",
        }),
      ],
      { cols: 2 }
    ),

    // Newsletter Section
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
        }),
        field.text("newsletter.placeholder", "Input Placeholder", {
          placeholder: "Enter your email",
        }),
        field.text("newsletter.buttonText", "Button Text", {
          placeholder: "Subscribe",
        }),
        field.textarea("newsletter.disclaimer", "Disclaimer", {
          rows: 2,
          placeholder: "By subscribing, you agree to our Privacy Policy and consent to receive updates.",
        }),
      ],
      { cols: 2 }
    ),
  ],
});
