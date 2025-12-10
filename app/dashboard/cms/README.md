# CMS Implementation Guide

## Overview

A complete Content Management System for managing predefined website pages. The system allows admins to update page content through a JSON editor without requiring code changes or deployments.

## Features

✅ **Predefined Pages**: 9 managed pages (Home, About, Contact, FAQs, Privacy, Terms, Returns, Size Guide, Shipping)
✅ **JSON-based Editor**: Edit page content as JSON with validation
✅ **Status Management**: Draft, Published, Archived states
✅ **SEO Metadata**: Title, description, keywords for each page
✅ **Real-time Preview**: JSON preview in the editor
✅ **Auto-revalidation**: Cache clearing after updates
✅ **Fallback Support**: Uses static data if CMS fails
✅ **Type-safe**: Full TypeScript support

## File Structure

```
/app/dashboard/cms/
  ├── page.jsx                    # CMS dashboard page
  ├── CMSLibraryClient.jsx        # Main dashboard UI
  ├── CMSPageSheet.jsx            # Page editor sheet
  └── README.md                   # This file

/hooks/query/
  └── useCMS.js                   # React Query hooks

/constants/
  └── cms-pages.js                # Predefined page configs

/api/platform/
  └── cms-api.ts                  # CMS API client

/app/(home)/
  ├── page.js                     # Homepage (✅ CMS integrated)
  ├── faqs/page.tsx               # FAQs page (✅ CMS integrated)
  ├── contact/page.tsx            # Contact page (needs update)
  ├── returns/page.tsx            # Returns page (needs update)
  └── ...other pages              # Other pages (need updates)

/components/platform/home/
  ├── Hero.tsx                    # ✅ Accepts CMS data
  ├── Marquee.tsx                 # ✅ Accepts CMS data
  ├── FeaturedProducts.tsx        # ✅ Accepts CMS data
  └── ...other components         # (can be updated as needed)
```

## Usage

### 1. Admin Dashboard

Navigate to `/dashboard/cms` to manage pages.

**Features:**
- Search pages by name, slug, or description
- View page status (Published, Draft, Archived)
- Edit page content through JSON editor
- Preview changes before publishing
- Add SEO metadata

### 2. Editing Page Content

1. Click "Edit" on any page card
2. Update the JSON content in the editor
3. Ensure JSON is valid (editor validates automatically)
4. Add SEO metadata (optional)
5. Set status to "Published" to make live
6. Click "Update Page"

Content is automatically revalidated and visible on the frontend immediately.

### 3. Frontend Integration

Pages fetch CMS content at build time with ISR revalidation:

```typescript
// Example: Homepage
export const revalidate = 300; // 5 minutes

export default async function HomePage() {
  // Fetch CMS content with fallback
  let cmsContent = null;
  
  try {
    cmsContent = await cmsApi.getBySlug({ slug: "home" });
  } catch (error) {
    console.warn("Failed to fetch CMS content, using fallback:", error);
  }

  const content = cmsContent?.content || cmsPages.home.content;
  
  return <Hero data={content.hero} />;
}
```

### 4. Component Props Pattern

Components accept `data` props with fallback defaults:

```typescript
interface HeroData {
  badge?: string;
  headline?: string[];
  description?: string;
  // ...more fields
}

interface HeroProps {
  data?: HeroData;
}

export function Hero({ data }: HeroProps) {
  const badge = data?.badge || "Default Badge";
  // Use data or fallback
}
```

## Predefined Pages

| Page | Slug | Route | Status |
|------|------|-------|--------|
| 🏠 Home | `home` | `/` | ✅ Integrated |
| ℹ️ About | `about-us` | `/about` | ⚠️ Component update needed |
| 📧 Contact | `contact` | `/contact` | ⚠️ Page update needed |
| ❓ FAQs | `faqs` | `/faqs` | ✅ Integrated |
| 🔒 Privacy | `privacy-policy` | `/privacy` | ⚠️ Page update needed |
| 📜 Terms | `terms-conditions` | `/terms` | ⚠️ Page update needed |
| ↩️ Returns | `returns-refunds` | `/returns` | ⚠️ Page update needed |
| 📏 Size Guide | `size-guide` | `/size-guide` | ⚠️ Page update needed |
| 🚚 Shipping | `shipping-delivery` | `/shipping` | ⚠️ Page update needed |

## Content Structure Examples

### Homepage (`home`)
```json
{
  "hero": {
    "badge": "Winter Collection 2024",
    "headline": ["DEFINE", "YOUR", "STYLE"],
    "highlightedWord": "STYLE",
    "description": "Premium streetwear...",
    "primaryCTA": { "label": "Shop Now", "href": "/products" },
    "secondaryCTA": { "label": "New Arrivals", "href": "/products?category=new" },
    "image": "https://...",
    "floatingBadge": { "value": "30%", "label": "Off First Order" }
  },
  "marquee": {
    "items": ["FREE SHIPPING", "NEW ARRIVALS", "PREMIUM QUALITY"]
  },
  "featuredProducts": {
    "badge": "Curated Selection",
    "headline": "TRENDING NOW",
    "description": "Our most-loved pieces...",
    "cta": { "label": "View All", "href": "/products" }
  }
}
```

### FAQs (`faqs`)
```json
{
  "title": "Frequently Asked Questions",
  "categories": [
    {
      "name": "Ordering & Payment",
      "questions": [
        {
          "question": "How do I place an order?",
          "answer": "Browse our products..."
        }
      ]
    }
  ]
}
```

### Text Pages (`privacy-policy`, `terms-conditions`, etc.)
```json
{
  "title": "Privacy Policy",
  "content": "Your privacy is important...",
  "lastUpdated": "2024-01-15"
}
```

## API Reference

### Hooks

```javascript
// List all pages (admin)
const { data, isLoading } = useCMSList(token, { limit: 50, sort: "-updatedAt" });

// Get single page (public)
const { data: page } = useCMSPage("home");

// Update page (admin)
const { updatePage, isUpdating } = useCMSActions(token);
await updatePage({ slug: "home", data: { status: "published", content: {...} } });
```

### API Client

```typescript
// Get page by slug (public)
const page = await cmsApi.getBySlug({ slug: "home" });

// Update page by slug (admin)
await cmsApi.updateBySlug({ 
  token, 
  slug: "home", 
  data: { content: {...}, status: "published" } 
});

// Get or create page (admin)
await cmsApi.getOrCreateBySlug({ 
  token, 
  slug: "home",
  defaults: { name: "Home Page", content: {...} }
});
```

## Revalidation

After updating a page, the system automatically:

1. Invalidates React Query cache
2. Calls `/revalidate` API route
3. Revalidates Next.js ISR cache by tag and path

Manual revalidation:
```bash
POST /revalidate
{
  "slug": "home",
  "type": "both"
}
```

## Best Practices

1. **Always use fallbacks**: Components should work with or without CMS data
2. **Validate JSON**: Use the editor's validation before saving
3. **Test changes**: Use "Draft" status to test before publishing
4. **Keep structure consistent**: Follow the documented content structures
5. **Use SEO metadata**: Improve search engine visibility
6. **Revalidate manually**: If ISR cache seems stale

## Troubleshooting

**Page not updating?**
- Check page status is "Published"
- Wait for revalidation (up to 5 minutes)
- Check browser cache (hard refresh)

**JSON validation error?**
- Use a JSON validator (jsonlint.com)
- Check for trailing commas
- Ensure proper quotes and brackets

**Fallback data showing?**
- Check CMS API is accessible
- Verify page exists in database
- Check browser console for errors

## Future Enhancements

- [ ] Rich text editor (WYSIWYG)
- [ ] Image upload integration
- [ ] Version history/rollback
- [ ] Multi-language support
- [ ] Content scheduling
- [ ] Preview mode before publishing
- [ ] Drag-and-drop page builder

## Support

For issues or questions, contact the development team.
