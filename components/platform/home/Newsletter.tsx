"use client";
import { useState } from "react";
import { Section, Container } from "@classytic/clarity/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Welcome to the family!",
        description: "You've been subscribed. Check your inbox for 10% off.",
      });
      setEmail("");
    }
  };

  return (
    <Section padding="xl" background="muted">
      <Container maxWidth="4xl">
        <div className="text-center">
          <h2 className="font-display text-4xl md:text-6xl mb-4">
            GET 10% OFF
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Subscribe to our newsletter and be the first to know about new drops, 
            exclusive offers, and style inspiration.
          </p>
          
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base"
              required
            />
            <Button type="submit" size="lg" className="shrink-0">
              Subscribe
            </Button>
          </form>
          
          <p className="text-xs text-muted-foreground mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </p>
        </div>
      </Container>
    </Section>
  );
}
