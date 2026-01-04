import { Gem, Heart, Leaf, Users, LucideIcon } from "lucide-react";
import { Section, Container } from "@classytic/clarity/layout";
import { getCmsPage } from "@/lib/sdk";
import { cmsPages } from "@/lib/cms-data";
import type { AboutPageContent } from "@/types";

export const revalidate = 3600;

export const metadata = {
  title: "About Us - Our Story",
  description: "Learn about our story, mission, and the team behind the brand.",
};

const iconMap: Record<string, LucideIcon> = { Gem, Heart, Leaf, Users };

export default async function AboutPage() {
  let content = cmsPages.about.content as AboutPageContent;

  // Try to fetch from CMS, fall back to static data if not found
  try {
    const response = await getCmsPage({ slug: "about-us" });
    if (response.success && response.data?.content) {
      content = response.data.content as unknown as AboutPageContent;
    }
  } catch (error) {
    // Silently use static fallback data if CMS fetch fails
    console.log("Using static fallback data for about page");
  }

  return (
    <>
      {/* Hero Section */}
      <Section padding="xl" background="muted">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {content.hero?.badge && (
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium mb-4">
                  {content.hero.badge}
                </span>
              )}
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
                {content.hero?.headline}
              </h1>
              <p className="text-lg text-muted-foreground">
                {content.hero?.description}
              </p>
            </div>
            {content.hero?.image && (
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                <img
                  src={content.hero.image}
                  alt="About us"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </Container>
      </Section>

      {/* Story Section */}
      <Section padding="xl">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl mb-8 text-center">
              {content.story?.title}
            </h2>
            <div className="space-y-6 text-muted-foreground text-lg">
              {content.story?.paragraphs?.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Values Section */}
      <Section padding="xl" background="muted">
        <Container>
          <h2 className="font-display text-3xl md:text-4xl mb-12 text-center">
            {content.values?.title}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.values?.items?.map((value, index) => {
              const Icon = iconMap[value.icon] || Gem;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary text-primary-foreground flex items-center justify-center">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-xl mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      {content.stats && content.stats.length > 0 && (
        <Section padding="lg">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {content.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-display text-4xl md:text-5xl mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Team Section */}
      {content.team && (
        <Section padding="xl" background="muted">
          <Container>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl mb-4">
                {content.team.title}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {content.team.description}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {content.team.members?.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="aspect-square bg-muted mb-4 overflow-hidden">
                    {member.image && (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <h3 className="font-display text-lg">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* CTA Section */}
      {content.cta && (
        <Section padding="xl" className="bg-primary text-primary-foreground">
          <Container>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl mb-4">
                {content.cta.title}
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                {content.cta.description}
              </p>
              <a
                href={content.cta.buttonLink}
                className="inline-flex items-center justify-center bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-12 px-8 font-medium transition-colors"
              >
                {content.cta.buttonText}
              </a>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
