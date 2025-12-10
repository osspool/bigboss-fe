import { field, section } from "@/components/form/form-system";

/**
 * About Us Page Form Schema
 * Matches AboutPageContent in types/cms.types.ts
 */
export const aboutPageSchema = () => ({
  sections: [
    // Hero Section
    section(
      "hero",
      "Hero Section",
      [
        field.text("hero.badge", "Badge", {
          placeholder: "Our Story",
        }),
        field.text("hero.headline", "Headline", {
          required: true,
          placeholder: "BORN TO STAND OUT",
        }),
        field.textarea("hero.description", "Description", {
          rows: 3,
          placeholder: "BigBoss was founded in 2020 with a simple yet powerful mission...",
        }),
        field.url("hero.image", "Hero Image URL", {
          placeholder: "https://images.unsplash.com/...",
        }),
      ],
      { cols: 2 }
    ),

    // Story Section
    section(
      "story",
      "Our Story Section",
      [
        field.text("story.title", "Title", {
          placeholder: "The BigBoss Journey",
        }),
        field.textarea("story.paragraphs.0", "Paragraph 1", {
          rows: 3,
          placeholder: "What started as a small passion project...",
        }),
        field.textarea("story.paragraphs.1", "Paragraph 2", {
          rows: 3,
          placeholder: "Every piece in our collection is thoughtfully designed...",
        }),
        field.textarea("story.paragraphs.2", "Paragraph 3", {
          rows: 3,
          placeholder: "From our humble beginnings...",
        }),
      ],
      { cols: 1 }
    ),

    // Values Section
    section(
      "values",
      "Values Section",
      [
        field.text("values.title", "Title", {
          placeholder: "What We Stand For",
        }),
        // Value 1
        field.text("values.items.0.icon", "Value 1 Icon", {
          placeholder: "Gem",
          description: "Icon names: Gem, Heart, Leaf, Users",
        }),
        field.text("values.items.0.title", "Value 1 Title", {
          placeholder: "Premium Quality",
        }),
        field.textarea("values.items.0.description", "Value 1 Description", {
          rows: 2,
          placeholder: "We never compromise on materials or craftsmanship.",
        }),
        // Value 2
        field.text("values.items.1.icon", "Value 2 Icon", {
          placeholder: "Heart",
        }),
        field.text("values.items.1.title", "Value 2 Title", {
          placeholder: "Customer First",
        }),
        field.textarea("values.items.1.description", "Value 2 Description", {
          rows: 2,
          placeholder: "Your satisfaction is our priority.",
        }),
        // Value 3
        field.text("values.items.2.icon", "Value 3 Icon", {
          placeholder: "Leaf",
        }),
        field.text("values.items.2.title", "Value 3 Title", {
          placeholder: "Sustainability",
        }),
        field.textarea("values.items.2.description", "Value 3 Description", {
          rows: 2,
          placeholder: "We're committed to reducing our environmental impact.",
        }),
        // Value 4
        field.text("values.items.3.icon", "Value 4 Icon", {
          placeholder: "Users",
        }),
        field.text("values.items.3.title", "Value 4 Title", {
          placeholder: "Community",
        }),
        field.textarea("values.items.3.description", "Value 4 Description", {
          rows: 2,
          placeholder: "BigBoss is more than a brand—it's a community.",
        }),
      ],
      { cols: 2 }
    ),

    // Stats
    section(
      "stats",
      "Statistics",
      [
        field.text("stats.0.value", "Stat 1 Value", {
          placeholder: "10,000+",
        }),
        field.text("stats.0.label", "Stat 1 Label", {
          placeholder: "Happy Customers",
        }),
        field.text("stats.1.value", "Stat 2 Value", {
          placeholder: "500+",
        }),
        field.text("stats.1.label", "Stat 2 Label", {
          placeholder: "Products",
        }),
        field.text("stats.2.value", "Stat 3 Value", {
          placeholder: "50+",
        }),
        field.text("stats.2.label", "Stat 3 Label", {
          placeholder: "Team Members",
        }),
        field.text("stats.3.value", "Stat 4 Value", {
          placeholder: "4.8",
        }),
        field.text("stats.3.label", "Stat 4 Label", {
          placeholder: "Average Rating",
        }),
      ],
      { cols: 2 }
    ),

    // Team Section
    section(
      "team",
      "Team Section",
      [
        field.text("team.title", "Title", {
          placeholder: "Meet Our Team",
        }),
        field.textarea("team.description", "Description", {
          rows: 2,
          placeholder: "The passionate people behind BigBoss who work tirelessly to bring you the best.",
        }),
        // Team Member 1
        field.text("team.members.0.name", "Member 1 Name", {
          placeholder: "Rafiq Ahmed",
        }),
        field.text("team.members.0.role", "Member 1 Role", {
          placeholder: "Founder & CEO",
        }),
        field.url("team.members.0.image", "Member 1 Image", {
          placeholder: "https://images.unsplash.com/...",
        }),
        field.text("team.members.0.bio", "Member 1 Bio", {
          placeholder: "Visionary leader with 10+ years in fashion industry.",
        }),
        // Team Member 2
        field.text("team.members.1.name", "Member 2 Name", {
          placeholder: "Fatima Khan",
        }),
        field.text("team.members.1.role", "Member 2 Role", {
          placeholder: "Creative Director",
        }),
        field.url("team.members.1.image", "Member 2 Image", {
          placeholder: "https://images.unsplash.com/...",
        }),
        field.text("team.members.1.bio", "Member 2 Bio", {
          placeholder: "Award-winning designer bringing global trends to local style.",
        }),
        // Team Member 3
        field.text("team.members.2.name", "Member 3 Name", {
          placeholder: "Imran Hassan",
        }),
        field.text("team.members.2.role", "Member 3 Role", {
          placeholder: "Head of Operations",
        }),
        field.url("team.members.2.image", "Member 3 Image", {
          placeholder: "https://images.unsplash.com/...",
        }),
        field.text("team.members.2.bio", "Member 3 Bio", {
          placeholder: "Operations expert ensuring quality at every step.",
        }),
        // Team Member 4
        field.text("team.members.3.name", "Member 4 Name", {
          placeholder: "Nadia Rahman",
        }),
        field.text("team.members.3.role", "Member 4 Role", {
          placeholder: "Marketing Lead",
        }),
        field.url("team.members.3.image", "Member 4 Image", {
          placeholder: "https://images.unsplash.com/...",
        }),
        field.text("team.members.3.bio", "Member 4 Bio", {
          placeholder: "Digital marketing specialist building our brand story.",
        }),
      ],
      { cols: 2 }
    ),

    // CTA Section
    section(
      "cta",
      "Call to Action",
      [
        field.text("cta.title", "Title", {
          placeholder: "Join the Movement",
        }),
        field.textarea("cta.description", "Description", {
          rows: 2,
          placeholder: "Be part of the BigBoss community. Follow us on social media...",
        }),
        field.text("cta.buttonText", "Button Text", {
          placeholder: "Shop Now",
        }),
        field.url("cta.buttonLink", "Button Link", {
          placeholder: "/products",
        }),
      ],
      { cols: 2 }
    ),
  ],
});
