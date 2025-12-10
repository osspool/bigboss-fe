import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { getCmsPage } from "@/api/platform/cms-api";
import { cmsPages } from "@/lib/cms-data";
import { ContactFormClient } from "./ContactFormClient";
import type { ContactPageContent } from "@/types/cms.types";

export const revalidate = 1800;

export const metadata = {
  title: "Contact Us - Get in Touch",
  description:
    "Contact us for any questions, support, or inquiries. We're here to help!",
};

// Static icons for contact cards (index-based)
const contactIcons: LucideIcon[] = [MapPin, Phone, Mail];
const socialIconMap: Record<string, LucideIcon> = {
  Instagram,
  Facebook,
  Twitter,
};

export default async function ContactPage() {
  let content = cmsPages.contact.content as ContactPageContent;

  // Try to fetch from CMS, fall back to static data if not found
  try {
    const response = await getCmsPage({ slug: "contact" });
    if (response.success && response.data?.content) {
      content = response.data.content as unknown as ContactPageContent;
    }
  } catch (error) {
    // Silently use static fallback data if CMS fetch fails
    console.log("Using static fallback data for contact page");
  }

  return (
    <>
      {/* Header */}
      <Section padding="lg" background="muted">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl mb-4">
              {content.title}
            </h1>
            <p className="text-lg text-muted-foreground">{content.subtitle}</p>
          </div>
        </Container>
      </Section>

      {/* Contact Info Cards - Icons are static: MapPin, Phone, Mail */}
      <Section padding="lg">
        <Container>
          <div className="grid md:grid-cols-3 gap-6 -mt-20">
            {content.contactInfo?.map((info, index) => {
              const Icon = contactIcons[index] || Mail;
              return (
                <div
                  key={index}
                  className="bg-background border border-border p-8 text-center shadow-lg"
                >
                  <div className="w-14 h-14 mx-auto mb-4 bg-primary text-primary-foreground flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl mb-4">{info.title}</h3>
                  <div className="space-y-1 text-muted-foreground text-sm">
                    {info.lines.map((line, lineIndex) => (
                      <p key={lineIndex}>{line}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Form and Sidebar */}
      <Section>
        <Container>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="font-display text-2xl mb-2">
                {content.form?.title}
              </h2>
              <p className="text-muted-foreground mb-8">
                {content.form?.description}
              </p>
              <ContactFormClient formConfig={content.form} />
            </div>

            {/* Sidebar */}
            <div className="space-y-12">
              {/* Social Links */}
              {content.socials && content.socials.length > 0 && (
                <div>
                  <h3 className="font-display text-xl mb-4">
                    {content.socialTitle || "Follow Us"}
                  </h3>
                  <div className="flex gap-4">
                    {content.socials.map((social) => {
                      const Icon = socialIconMap[social.platform] || Instagram;
                      return (
                        <a
                          key={social.platform}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FAQs Link */}
              {content.faq && (
                <div className="bg-muted p-8">
                  <h3 className="font-display text-xl mb-2">
                    {content.faq.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {content.faq.description}
                  </p>
                  <a
                    href={content.faq.link}
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    {content.faq.linkText}{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {content.map?.embedUrl && (
        <Section>
          <Container>
            {/* Map */}
            <div>
              <h3 className="font-display text-xl mb-4">
                {content.map.title || "Find Us"}
              </h3>
              <div className="aspect-video bg-muted">
                <iframe
                  src={content.map.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
