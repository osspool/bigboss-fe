import { Truck, RefreshCw, Shield, Headphones, LucideIcon } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { getCMSSection } from "@/lib/cms-data";

const iconMap: Record<string, LucideIcon> = {
  Truck,
  RefreshCw,
  Shield,
  Headphones,
};

export function Features() {
  const data = getCMSSection<{
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  }>('home', 'features');

  if (!data) return null;

  return (
    <section className="py-12 border-y border-border">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {data.items.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Truck;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 mb-4 bg-muted flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
