import { Hero } from "@/components/platform/home/Hero";
import { Marquee } from "@/components/platform/home/Marquee";
import { Features } from "@/components/platform/home/Features";
import { Categories } from "@/components/platform/home/Categories";
import { FeaturedProducts } from "@/components/platform/home/FeaturedProducts";
import { PromoBanner } from "@/components/platform/home/PromoBanner";
import { BrandStory } from "@/components/platform/home/BrandStory";
import { Lookbook } from "@/components/platform/home/Lookbook";
import { Testimonials } from "@/components/platform/home/Testimonials";
import { InstagramFeed } from "@/components/platform/home/InstagramFeed";
import { Newsletter } from "@/components/platform/home/Newsletter";
import { getCmsPage } from "@/api/platform/cms-api";
import { cmsPages } from "@/lib/cms-data";

export const revalidate = 300; // 5 minutes

export default async function HomePage() {
  // Try API, fallback to static
  let content = cmsPages.home.content;
  
  try {
    const { data } = await getCmsPage({ slug: "home" });
    if (data?.content) content = data.content;
  } catch (error) {
    console.warn("CMS fetch failed, using fallback");
  }
  
  return (
    <div>
      <Hero data={content.hero} />
      <Marquee data={content.marquee} />
      <Features />
      <Categories />
      <FeaturedProducts data={content.featuredProducts} />
      <PromoBanner />
      <BrandStory data={content.brandStory} />
      <Lookbook />
      <Testimonials data={content.testimonials} />
      <InstagramFeed data={content.instagramFeed} />
      <Newsletter />
    </div>
  );
}
