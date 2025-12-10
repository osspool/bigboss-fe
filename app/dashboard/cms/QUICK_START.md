# CMS Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1️⃣ Access the Dashboard
Navigate to: **`/dashboard/cms`**

You'll see all 9 website pages in a grid.

### 2️⃣ Edit a Page
Click any page card or the "Edit" button.

**You'll get a 3-tab editor:**

| Tab | When to Use |
|-----|-------------|
| **📝 Form Editor** | **Recommended** - Easy fields for homepage, contact, etc. |
| **💻 JSON Editor** | Advanced - For complex nested data (testimonials, FAQ questions) |
| **👁️ Preview** | View formatted JSON before saving |

### 3️⃣ Save & Publish
1. Fill in the form fields or edit JSON
2. Set status to **"Published"** (make it live) or **"Draft"** (test first)
3. Click **"Update Page"**
4. Wait ~5 minutes for cache to refresh

---

## 📚 Page Types

### 🏠 Homepage (`home`) - **Specialized Form**
**Sections available:**
- **Hero Section**: Badge, 3-line headline, description, 2 CTAs, image, floating badge
- **Marquee**: 4 scrolling announcement items
- **Brand Story**: Badge, headline, 3 paragraphs, 2 stats, 2 images, CTA
- **Featured Products**: Badge, headline, description, CTA
- **Testimonials**: Badge, headline (items via JSON)
- **Instagram Feed**: Badge, headline, description

**Example - Update Hero:**
```
Badge Text: "Spring 2025 Collection"
Headline Line 1: "FRESH"
Headline Line 2: "NEW"
Headline Line 3: "DROPS"
Highlighted Word: "DROPS"
Description: "Check out our latest spring collection..."
Primary Button Label: "Shop Now"
Primary Button Link: "/products"
```

### 📧 Contact (`contact`) - **Specialized Form**
**Sections:**
- Page Information: Title, subtitle
- Contact Information: Email, phone, address, hours
- Social Media: Facebook, Instagram, Twitter, LinkedIn URLs
- Map: Latitude, longitude, Google Maps embed URL

**Example:**
```
Email: support@bigboss.com
Phone: +880 1234567890
Address: Gulshan, Dhaka, Bangladesh
Facebook URL: https://facebook.com/bigboss.bd
```

### ❓ FAQs (`faqs`) - **Hybrid Form**
**Form fields:**
- Title
- Subtitle

**JSON Editor for:**
- Categories & questions (complex nested structure)

**Example JSON structure:**
```json
{
  "title": "Frequently Asked Questions",
  "categories": [
    {
      "name": "Shipping",
      "questions": [
        {
          "question": "How long does shipping take?",
          "answer": "2-5 business days within Dhaka..."
        }
      ]
    }
  ]
}
```

### 📝 Text Pages - **Generic Form**
Used for: Privacy Policy, Terms, Returns, Size Guide, Shipping, About

**Fields:**
- Title
- Content (large textarea)
- Last Updated (date)

**Example:**
```
Title: "Privacy Policy"
Content: "At BigBoss, we value your privacy..."
Last Updated: 2024-12-07
```

---

## 🎯 Common Tasks

### Change Homepage Hero Text
1. Go to `/dashboard/cms`
2. Click **"🏠 Home Page"**
3. **Form Editor** tab
4. Scroll to **"Hero Section"**
5. Update fields: Badge, Headline, Description, Buttons
6. Set status: **"Published"**
7. Click **"Update Page"**

### Update Contact Info
1. Go to `/dashboard/cms`
2. Click **"📧 Contact Us"**
3. **Form Editor** tab
4. Update email, phone, address, social links
5. Set status: **"Published"**
6. Click **"Update Page"**

### Add New FAQ
1. Go to `/dashboard/cms`
2. Click **"❓ FAQs"**
3. **JSON Editor** tab (categories are nested arrays)
4. Add question to existing category:
```json
{
  "categories": [
    {
      "name": "General",
      "questions": [
        {
          "question": "What is your return policy?",
          "answer": "You can return within 30 days..."
        }
      ]
    }
  ]
}
```
5. Set status: **"Published"**
6. Click **"Update Page"**

### Update Privacy Policy
1. Go to `/dashboard/cms`
2. Click **"🔒 Privacy Policy"**
3. **Form Editor** tab (simple text page)
4. Update Title and Content fields
5. Update Last Updated date
6. Set status: **"Published"**
7. Click **"Update Page"**

---

## ⚡ Pro Tips

✅ **Use Form Editor** whenever possible (easier and cleaner)  
✅ **Use JSON Editor** for complex arrays (testimonials, FAQ questions)  
✅ **Draft first** - Test changes before publishing  
✅ **Preview tab** - Verify JSON structure is correct  
✅ **SEO metadata** - Add for better Google rankings  
✅ **Wait 5 minutes** - ISR cache takes time to revalidate  

---

## 🐛 Troubleshooting

**Page not updating?**
- Status must be **"Published"**
- Wait 5 minutes for cache
- Hard refresh (Ctrl+Shift+R)

**Form looks empty?**
- Some pages use JSON editor only
- Click "JSON Editor" tab

**JSON error?**
- Check for trailing commas
- Ensure proper quotes
- Validate at jsonlint.com

**Need help?**
- Check `CMS_IMPLEMENTATION.md` for details
- Check `README.md` for API reference

---

## 📞 Support

Questions? Contact your development team or check the documentation files in this directory.

**Files:**
- `QUICK_START.md` ← You are here
- `CMS_IMPLEMENTATION.md` ← Full technical details
- `README.md` ← API and usage reference
