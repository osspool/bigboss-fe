import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { getCMSSection } from "@/lib/cms-data";

interface LookbookItem {
  id: number;
  title: string;
  image: string;
  href: string;
}

export function Lookbook() {
  const data = getCMSSection<{
    badge: string;
    headline: string;
    description: string;
    items: LookbookItem[];
  }>('home', 'lookbook');

  if (!data) return null;

  return (
    <Section padding="xl">
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

        <div className="grid md:grid-cols-3 gap-4">
          {data.items.map((item, index) => (
            <Link
              key={item.id}
              href={item.href}
              className="group relative aspect-[3/4] overflow-hidden animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-2xl text-foreground mb-2">
                  {item.title}
                </h3>
                <span className="inline-flex items-center text-sm font-medium text-foreground group-hover:underline">
                  Explore
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
