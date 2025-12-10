import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { getCMSSection } from "@/lib/cms-data";

export function PromoBanner() {
  const data = getCMSSection<{
    headline: string;
    subheadline: string;
    description: string;
    cta: { label: string; href: string };
    backgroundImage: string;
  }>('home', 'promoBanner');

  if (!data) return null;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={data.backgroundImage}
          alt="Promo background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-2xl text-primary-foreground">
          <p className="text-sm uppercase tracking-[0.3em] text-primary-foreground/70 mb-4 animate-fade-up">
            Limited Time Offer
          </p>
          <h2 className="font-display text-5xl md:text-7xl mb-4 animate-fade-up" style={{ animationDelay: '100ms' }}>
            {data.headline}
          </h2>
          <p className="text-2xl md:text-3xl font-light mb-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
            {data.subheadline}
          </p>
          <p className="text-lg text-primary-foreground/80 mb-8 animate-fade-up" style={{ animationDelay: '300ms' }}>
            {data.description}
          </p>
          <div className="animate-fade-up" style={{ animationDelay: '400ms' }}>
            <Button variant="hero" size="lg" asChild>
              <Link href={data.cta.href}>
                {data.cta.label}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
