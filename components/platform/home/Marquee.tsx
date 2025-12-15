import { cn } from "@/lib/utils";

interface MarqueeData {
  items?: string[];
}

interface MarqueeProps {
  className?: string;
  data?: MarqueeData;
}

export function Marquee({ className, data }: MarqueeProps) {
  const defaultPhrases = [
    "FREE SHIPPING OVER ৳5,000",
    "★",
    "NEW ARRIVALS WEEKLY",
    "★",
    "PREMIUM QUALITY",
    "★",
    "EASY RETURNS",
    "★",
    "AUTHENTIC STREETWEAR",
    "★",
  ];

  const phrases = data?.items?.flatMap((item) => [item, "★"]) || defaultPhrases;

  return (
    <div
      className={cn(
        "bg-primary text-primary-foreground py-3 overflow-hidden",
        className
      )}
    >
      <div className="animate-marquee flex whitespace-nowrap">
        {[...phrases, ...phrases].map((phrase, i) => (
          <span
            key={i}
            className="mx-4 text-sm font-medium uppercase tracking-wider"
          >
            {phrase}
          </span>
        ))}
      </div>
    </div>
  );
}
