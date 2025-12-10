import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

export function BrandStory() {
  return (
    <Section padding="xl">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Images */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600"
                  alt="Brand Story"
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>
              <div className="space-y-4 pt-12">
                <img
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600"
                  alt="Brand Story"
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>
            </div>
            {/* Stats overlay */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-background border border-border p-6 flex gap-8">
              <div className="text-center">
                <p className="font-display text-3xl">10K+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl">500+</p>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:pl-8">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Our Story
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6">
              BORN TO
              <br />
              STAND OUT
            </h2>
            <div className="space-y-4 text-muted-foreground mb-8">
              <p>
                BigBoss was founded with a simple mission: create premium streetwear
                that empowers individuals to express their unique identity without compromise.
              </p>
              <p>
                Every piece in our collection is thoughtfully designed and crafted
                with attention to detail, using only the finest materials. We believe
                that great style shouldn't come at the expense of comfort or quality.
              </p>
              <p>
                From the streets of Dhaka to wardrobes worldwide, BigBoss continues
                to push boundaries and redefine what it means to dress with confidence.
              </p>
            </div>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
