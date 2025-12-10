import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";

const categories = [
  {
    title: "Men",
    href: "/products?parentCategory=men",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800",
    count: "124 Products",
  },
  {
    title: "Women",
    href: "/products?parentCategory=women",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800",
    count: "98 Products",
  },
  {
    title: "Accessories",
    href: "/products?category=accessories",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800",
    count: "56 Products",
  },
];

export function Categories() {
  return (
    <Section padding="xl">
      <Container>
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Browse
            </p>
            <h2 className="font-display text-4xl md:text-5xl">CATEGORIES</h2>
          </div>
          <Link
            href="/products"
            className="hidden md:flex items-center gap-2 text-sm font-medium uppercase tracking-wider hover:underline"
          >
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.title}
              href={category.href}
              className="group relative aspect-[3/4] overflow-hidden bg-muted"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-primary-foreground">
                <p className="text-sm text-primary-foreground/70 mb-1">
                  {category.count}
                </p>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-3xl md:text-4xl">
                    {category.title}
                  </h3>
                  <ArrowUpRight className="h-6 w-6 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
