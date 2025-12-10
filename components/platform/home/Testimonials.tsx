import { Star, Quote } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { getCMSSection } from "@/lib/cms-data";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
}

export function Testimonials() {
  const data = getCMSSection<{
    badge: string;
    headline: string;
    items: Testimonial[];
  }>('home', 'testimonials');

  if (!data) return null;

  return (
    <Section padding="xl">
      <Container>
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
            {data.badge}
          </p>
          <h2 className="font-display text-4xl md:text-5xl">{data.headline}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {data.items.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative bg-muted p-8 animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-muted-foreground/20" />
              
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
