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
  const repeatCount = 4;

  return (
    <div
      className={cn(
        "bg-primary text-primary-foreground py-3 overflow-hidden",
        className
      )}
    >
      <div className="animate-marquee flex w-max whitespace-nowrap">
        {Array.from({ length: repeatCount }).map((_, copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center gap-x-8"
            aria-hidden={copy > 0}
          >
            {phrases.map((phrase, i) => (
              <span
                key={`${copy}-${i}`}
                className="text-sm font-medium uppercase tracking-wider"
              >
                {phrase}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
