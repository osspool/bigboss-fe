import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";

interface HeroData {
  badge?: string;
  headline?: string[];
  highlightedWord?: string;
  description?: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  image?: string;
  floatingBadge?: { value: string; label: string };
}

interface HeroProps {
  data?: HeroData;
}

export function Hero({ data }: HeroProps) {
  // Default values
  const badge = data?.badge || "Winter Collection 2024";
  const headline = data?.headline || ["DEFINE", "YOUR", "STYLE"];
  const highlightedWord = data?.highlightedWord || "STYLE";
  const description = data?.description || "Premium streetwear crafted for those who dare to stand out. Elevate your wardrobe with pieces that make a statement.";
  const primaryCTA = data?.primaryCTA || { label: "Shop Collection", href: "/products" };
  const secondaryCTA = data?.secondaryCTA || { label: "New Arrivals", href: "/products?category=new-arrivals" };
  const image = data?.image || "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800";
  const floatingBadge = data?.floatingBadge || { value: "30%", label: "Off First Order" };

  return (
    <section className="relative min-h-[90vh] flex items-center bg-primary text-primary-foreground overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full">
          <span className="absolute top-[10%] left-[5%] font-display text-[20vw] leading-none">
            BIG
          </span>
          <span className="absolute bottom-[10%] right-[5%] font-display text-[20vw] leading-none">
            BOSS
          </span>
        </div>
      </div>

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-up">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary-foreground/70 mb-4">
                {badge}
              </p>
              <h1 className="font-display text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight">
                {headline.map((word, idx) => (
                  <span key={idx}>
                    {word === highlightedWord ? (
                      <span className="italic">{word}</span>
                    ) : (
                      word
                    )}
                    {idx < headline.length - 1 && <br />}
                  </span>
                ))}
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-md">
              {description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link href={primaryCTA.href}>
                  {primaryCTA.label}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link href={secondaryCTA.href}>
                  {secondaryCTA.label}
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block animate-fade-in delay-300">
            <div className="aspect-4/5 relative">
              <img
                src={image}
                alt="BigBoss Collection"
                className="w-full h-full object-cover"
              />
              {/* Floating badge */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 bg-background text-foreground p-6 shadow-xl">
                <p className="font-display text-4xl">{floatingBadge.value}</p>
                <p className="text-sm uppercase tracking-wider">{floatingBadge.label}</p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
