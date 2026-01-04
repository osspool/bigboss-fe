import { Instagram, ExternalLink } from "lucide-react";
import { Section, Container } from "@classytic/clarity/layout";
import { Button } from "@/components/ui/button";
import { getCMSSection } from "@/lib/cms-data";

export function InstagramFeed() {
  const data = getCMSSection<{
    badge: string;
    headline: string;
    description: string;
    images: string[];
    cta: { label: string; href: string };
  }>('home', 'instagramFeed');

  if (!data) return null;

  return (
    <Section padding="xl" background="muted">
      <Container>
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
            {data.badge}
          </p>
          <h2 className="font-display text-4xl md:text-5xl mb-4">{data.headline}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {data.description}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {data.images.map((image, index) => (
            <a
              key={index}
              href={data.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden"
            >
              <img
                src={image}
                alt={`Instagram post ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Instagram className="h-8 w-8 text-primary-foreground" />
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild>
            <a href={data.cta.href} target="_blank" rel="noopener noreferrer">
              <Instagram className="mr-2 h-5 w-5" />
              {data.cta.label}
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
