// CMS Data Structure - Simulating database content
// This can be replaced with API calls to fetch from backend

export interface CMSPage {
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  content: Record<string, any>;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const cmsPages: Record<string, CMSPage> = {
  home: {
    name: 'Home Page',
    slug: 'home',
    status: 'published',
    content: {
      hero: {
        badge: 'Winter Collection 2024',
        headline: ['DEFINE', 'YOUR', 'STYLE'],
        highlightedWord: 'STYLE',
        description: 'Premium streetwear crafted for those who dare to stand out. Elevate your wardrobe with pieces that make a statement.',
        primaryCTA: { label: 'Shop Collection', href: '/products' },
        secondaryCTA: { label: 'New Arrivals', href: '/products?tags=new-arrivals' },
        image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800',
        floatingBadge: { value: '30%', label: 'Off First Order' },
      },
      marquee: {
        items: ['FREE SHIPPING OVER ৳2000', 'NEW ARRIVALS WEEKLY', 'PREMIUM QUALITY', 'EASY RETURNS'],
      },
      brandStory: {
        badge: 'Our Story',
        headline: ['BORN TO', 'STAND OUT'],
        paragraphs: [
          'BigBoss was founded with a simple mission: create premium streetwear that empowers individuals to express their unique identity without compromise.',
          'Every piece in our collection is thoughtfully designed and crafted with attention to detail, using only the finest materials. We believe that great style shouldn\'t come at the expense of comfort or quality.',
          'From the streets of Dhaka to wardrobes worldwide, BigBoss continues to push boundaries and redefine what it means to dress with confidence.',
        ],
        stats: [
          { value: '10K+', label: 'Happy Customers' },
          { value: '500+', label: 'Products' },
        ],
        images: [
          'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600',
        ],
        cta: { label: 'Learn More', href: '/about' },
      },
      featuredProducts: {
        badge: 'Curated Selection',
        headline: 'TRENDING NOW',
        description: 'Our most-loved pieces, handpicked for you. From essentials to statement makers.',
        cta: { label: 'View All Products', href: '/products' },
      },
      testimonials: {
        badge: 'What Our Customers Say',
        headline: 'REAL STYLE, REAL PEOPLE',
        items: [
          {
            id: 1,
            name: 'Rafiq Ahmed',
            location: 'Dhaka',
            rating: 5,
            text: 'The quality is absolutely unmatched. I\'ve been shopping here for 2 years and every piece feels premium.',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          },
          {
            id: 2,
            name: 'Fatima Khan',
            location: 'Chittagong',
            rating: 5,
            text: 'Finally found a brand that understands modern streetwear. The fit is perfect every time!',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          },
          {
            id: 3,
            name: 'Imran Hassan',
            location: 'Sylhet',
            rating: 5,
            text: 'Customer service is amazing. They helped me find the perfect size and style. Highly recommend!',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          },
        ],
      },
      instagramFeed: {
        badge: 'Follow Us',
        headline: '@BIGBOSS.BD',
        description: 'Join our community and show us how you style BigBoss.',
        images: [
          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
          'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
        ],
        cta: { label: 'Follow on Instagram', href: 'https://instagram.com/bigboss.bd' },
      },
      features: {
        items: [
          { icon: 'Truck', title: 'Free Shipping', description: 'On orders over ৳2000' },
          { icon: 'RefreshCw', title: 'Easy Returns', description: '14-day return policy' },
          { icon: 'Shield', title: 'Secure Payment', description: '100% secure checkout' },
          { icon: 'Headphones', title: '24/7 Support', description: 'Dedicated customer care' },
        ],
      },
      promoBanner: {
        headline: 'WINTER SALE',
        subheadline: 'Up to 50% off selected items',
        description: 'Limited time only. Don\'t miss out on our biggest sale of the season.',
        cta: { label: 'Shop Sale', href: '/products?tags=sale' },
        backgroundImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920',
      },
      lookbook: {
        badge: 'Style Guide',
        headline: 'THE LOOKBOOK',
        description: 'Get inspired by our curated style guides and seasonal collections.',
        items: [
          {
            id: 1,
            title: 'Street Essential',
            image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800',
            href: '/products?style=street',
          },
          {
            id: 2,
            title: 'Casual Comfort',
            image: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800',
            href: '/products?style=casual',
          },
          {
            id: 3,
            title: 'Urban Edge',
            image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800',
            href: '/products?style=urban',
          },
        ],
      },
      newsletter: {
        headline: 'JOIN THE MOVEMENT',
        description: 'Subscribe for exclusive drops, early access, and 10% off your first order.',
        placeholder: 'Enter your email',
        buttonText: 'Subscribe',
        disclaimer: 'By subscribing, you agree to our Privacy Policy and consent to receive updates.',
      },
    },
    metadata: {
      title: 'BigBoss - Premium Streetwear | Define Your Style',
      description: 'Shop premium streetwear at BigBoss. Discover the latest trends in fashion with free shipping over ৳2000.',
      keywords: ['streetwear', 'fashion', 'bangladesh', 'clothing', 'premium'],
      ogImage: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200',
    },
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
  },

  privacy: {
    name: 'Privacy Policy',
    slug: 'privacy',
    status: 'published',
    content: {
      title: 'Privacy Policy',
      lastUpdated: 'December 2024',
      sections: [
        {
          title: '1. Information We Collect',
          content: 'At BigBoss, we collect information you provide directly to us, including:',
          list: [
            'Name, email address, and phone number when you create an account or place an order',
            'Shipping and billing address for order fulfillment',
            'Payment information (processed securely through our payment partners)',
            'Communication preferences and marketing consent',
            'Product reviews and feedback you submit',
          ],
        },
        {
          title: '2. How We Use Your Information',
          content: 'We use the information we collect to:',
          list: [
            'Process and fulfill your orders',
            'Send order confirmations and shipping updates',
            'Respond to your inquiries and customer service requests',
            'Send promotional communications (with your consent)',
            'Improve our products, services, and website experience',
            'Prevent fraud and enhance security',
          ],
        },
        {
          title: '3. Information Sharing',
          content: 'We do not sell your personal information. We may share your information with:',
          list: [
            'Shipping carriers to deliver your orders',
            'Payment processors to complete transactions',
            'Service providers who assist our operations',
            'Law enforcement when required by law',
          ],
        },
        {
          title: '4. Data Security',
          content: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted using SSL technology.',
        },
        {
          title: '5. Your Rights',
          content: 'You have the right to:',
          list: [
            'Access and review your personal information',
            'Update or correct inaccurate information',
            'Request deletion of your personal data',
            'Opt-out of marketing communications',
            'Data portability upon request',
          ],
        },
        {
          title: '6. Cookies',
          content: 'We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can manage cookie preferences through your browser settings.',
        },
        {
          title: '7. Contact Us',
          content: 'If you have questions about this Privacy Policy or our data practices, please contact us at:',
          contact: {
            email: 'privacy@bigboss.com',
            phone: '+880 1XXX-XXXXXX',
            address: 'Dhaka, Bangladesh',
          },
        },
      ],
    },
    metadata: {
      title: 'Privacy Policy - BigBoss',
      description: 'Learn how BigBoss collects, uses, and protects your personal information.',
      keywords: ['privacy policy', 'data protection', 'bigboss'],
    },
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
  },

  returns: {
    name: 'Returns & Exchanges',
    slug: 'returns',
    status: 'published',
    content: {
      title: 'Returns & Exchanges',
      subtitle: 'Not completely satisfied? We\'ve got you covered with our hassle-free return policy.',
      steps: [
        {
          icon: 'Package',
          title: 'Initiate Return',
          description: 'Contact our customer service or log into your account to start a return request within 14 days of delivery.',
        },
        {
          icon: 'Clock',
          title: 'Pack Your Item',
          description: 'Pack the item securely in its original packaging with all tags attached. Include your order number.',
        },
        {
          icon: 'RefreshCw',
          title: 'Ship It Back',
          description: 'Use our prepaid shipping label or ship via your preferred carrier to our returns center.',
        },
        {
          icon: 'CheckCircle',
          title: 'Get Refunded',
          description: 'Once we receive and inspect your return, your refund will be processed within 5-7 business days.',
        },
      ],
      sections: [
        {
          type: 'policy',
          title: 'Return Policy',
          highlight: {
            title: '14-Day Return Window',
            content: 'You have 14 days from the date of delivery to return any item for a full refund. Items must be unworn, unwashed, and in their original condition with all tags attached.',
          },
        },
        {
          type: 'grid',
          title: 'Eligible Items',
          columns: [
            {
              title: 'Returnable',
              variant: 'success',
              items: [
                'Clothing items in original condition',
                'Accessories with original packaging',
                'Items with tags still attached',
                'Unworn and unwashed products',
              ],
            },
            {
              title: 'Non-Returnable',
              variant: 'destructive',
              items: [
                'Undergarments and swimwear',
                'Items marked as "Final Sale"',
                'Personalized or customized items',
                'Items showing signs of wear',
              ],
            },
          ],
        },
        {
          type: 'text',
          title: 'Exchanges',
          content: 'Want a different size or color? We\'re happy to exchange your item for you. Here\'s how:',
          list: [
            'Contact our customer service team with your order number and desired exchange',
            'We\'ll send you a prepaid shipping label for the return',
            'Once we receive your item, we\'ll ship out the replacement',
            'If there\'s a price difference, we\'ll adjust accordingly',
          ],
        },
        {
          type: 'text',
          title: 'Refund Information',
          paragraphs: [
            'Refunds will be processed to your original payment method within 5-7 business days after we receive and inspect your return.',
            { text: 'Original shipping charges', bold: true, suffix: ' are non-refundable unless the return is due to our error (wrong item sent, defective product, etc.).' },
            { text: 'Sale items', bold: true, suffix: ' can be returned for store credit only, unless otherwise specified.' },
          ],
        },
        {
          type: 'text',
          title: 'Damaged or Defective Items',
          content: 'Received a damaged or defective item? We sincerely apologize. Please contact us within 48 hours of delivery with:',
          list: [
            'Your order number',
            'Photos of the damaged/defective item',
            'Description of the issue',
          ],
          footer: 'We\'ll arrange a free return and send you a replacement immediately.',
        },
      ],
      contactSection: {
        title: 'Need Help?',
        content: 'Our customer service team is here to assist you with any questions about returns or exchanges.',
        email: 'support@bigboss.com',
        phone: '+880 1XXX-XXXXXX',
        hours: 'Sunday - Thursday, 10AM - 6PM (BST)',
      },
    },
    metadata: {
      title: 'Returns & Exchanges - BigBoss',
      description: 'Learn about our hassle-free 14-day return policy and exchange process at BigBoss.',
      keywords: ['returns', 'exchanges', 'refund', 'bigboss'],
    },
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
  },
  faq: {
    name: 'Frequently Asked Questions',
    slug: 'faq',
    status: 'published',
    content: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to the most common questions about BigBoss.',
      categories: [
        {
          title: 'Orders & Shipping',
          items: [
            {
              question: 'How long does shipping take?',
              answer: 'Standard shipping within Bangladesh takes 3-5 business days. Express shipping (1-2 business days) is available for an additional fee. Dhaka city orders typically arrive within 24-48 hours.',
            },
            {
              question: 'How can I track my order?',
              answer: 'Once your order is shipped, you\'ll receive an email with your tracking number. You can also track your order by logging into your account and viewing your order history.',
            },
            {
              question: 'Do you ship internationally?',
              answer: 'Currently, we only ship within Bangladesh. We\'re working on expanding our delivery network to serve customers internationally in the near future.',
            },
            {
              question: 'What are the shipping costs?',
              answer: 'Shipping is FREE on all orders over ৳2000. For orders below ৳2000, a flat rate of ৳60 applies for standard delivery within Dhaka and ৳120 for outside Dhaka.',
            },
          ],
        },
        {
          title: 'Returns & Exchanges',
          items: [
            {
              question: 'What is your return policy?',
              answer: 'We offer a 14-day return policy. Items must be unworn, unwashed, and in their original condition with all tags attached. Visit our Returns & Exchanges page for detailed instructions.',
            },
            {
              question: 'How do I initiate a return?',
              answer: 'To start a return, log into your account and navigate to your order history. Select the item you wish to return and follow the prompts. Alternatively, contact our customer service team.',
            },
            {
              question: 'When will I receive my refund?',
              answer: 'Once we receive and inspect your return, your refund will be processed within 5-7 business days to your original payment method.',
            },
            {
              question: 'Can I exchange for a different size?',
              answer: 'Yes! We\'re happy to exchange items for different sizes or colors, subject to availability. Contact our support team with your order number and desired exchange.',
            },
          ],
        },
        {
          title: 'Products & Sizing',
          items: [
            {
              question: 'How do I find my size?',
              answer: 'Check our Size Guide available on each product page. We provide detailed measurements for all our products. If you\'re between sizes, we generally recommend sizing up for a more relaxed fit.',
            },
            {
              question: 'What materials do you use?',
              answer: 'We use premium quality fabrics including 100% cotton, cotton blends, and sustainable materials. Each product page lists the specific material composition.',
            },
            {
              question: 'Are your products true to size?',
              answer: 'Our products are designed to be true to size, but fit may vary by style. Check the product description for specific fit notes (slim, regular, relaxed) and customer reviews for additional guidance.',
            },
            {
              question: 'How do I care for my BigBoss items?',
              answer: 'Care instructions are included on the product label and product page. Generally, we recommend washing in cold water, avoiding bleach, and tumble drying on low heat to maintain quality.',
            },
          ],
        },
        {
          title: 'Payment & Security',
          items: [
            {
              question: 'What payment methods do you accept?',
              answer: 'We accept Cash on Delivery (COD), bKash, Nagad, Rocket, and bank transfers. All online payments are processed securely.',
            },
            {
              question: 'Is my payment information secure?',
              answer: 'Absolutely. We use industry-standard SSL encryption to protect your personal and payment information. We never store your complete payment details on our servers.',
            },
            {
              question: 'Can I pay in installments?',
              answer: 'Currently, we don\'t offer installment payment options. However, we\'re exploring partnerships with EMI providers for the future.',
            },
            {
              question: 'Do you charge for COD orders?',
              answer: 'There\'s no additional charge for Cash on Delivery orders. The total amount shown at checkout is what you\'ll pay to the delivery person.',
            },
          ],
        },
        {
          title: 'Account & Support',
          items: [
            {
              question: 'How do I create an account?',
              answer: 'Click on the account icon in the top right corner and select "Sign Up." You can register using your email address or phone number.',
            },
            {
              question: 'How can I contact customer support?',
              answer: 'You can reach us via email at support@bigboss.com, phone at +880 1XXX-XXXXXX (Sunday-Thursday, 10AM-6PM BST), or through our social media channels.',
            },
            {
              question: 'Do you have a loyalty program?',
              answer: 'Yes! BigBoss Rewards members earn points on every purchase that can be redeemed for discounts. Sign up for free through your account dashboard.',
            },
            {
              question: 'How do I subscribe to the newsletter?',
              answer: 'Scroll to the bottom of any page and enter your email in the newsletter signup form. You\'ll receive 10% off your first order plus exclusive access to new drops and sales.',
            },
          ],
        },
      ],
      contactSection: {
        title: 'Still have questions?',
        description: 'Our customer support team is here to help you with any questions not covered above.',
        email: 'support@bigboss.com',
        phone: '+880 1XXX-XXXXXX',
        hours: 'Sunday - Thursday, 10AM - 6PM (BST)',
      },
    },
    metadata: {
      title: 'FAQ - BigBoss',
      description: 'Find answers to frequently asked questions about orders, shipping, returns, products, and more at BigBoss.',
      keywords: ['faq', 'help', 'questions', 'support', 'bigboss'],
    },
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
  },

  cookies: {
    name: 'Cookie Policy',
    slug: 'cookies',
    status: 'published',
    content: {
      title: 'Cookie Policy',
      lastUpdated: 'December 2024',
      intro: 'This Cookie Policy explains how BigBoss uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.',
      sections: [
        {
          title: '1. What Are Cookies?',
          content: 'Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.',
        },
        {
          title: '2. Types of Cookies We Use',
          subsections: [
            {
              title: 'Essential Cookies',
              content: 'These cookies are strictly necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you such as setting your privacy preferences, logging in, or filling in forms.',
            },
            {
              title: 'Performance Cookies',
              content: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site.',
            },
            {
              title: 'Functional Cookies',
              content: 'These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.',
            },
            {
              title: 'Targeting Cookies',
              content: 'These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.',
            },
          ],
        },
        {
          title: '3. How Long Do Cookies Stay?',
          content: 'Session cookies are temporary and are deleted when you close your browser. Persistent cookies remain on your device for a set period of time specified in the cookie. We use both session and persistent cookies.',
        },
        {
          title: '4. How to Control Cookies',
          content: 'You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.',
          list: [
            'Chrome: Settings > Privacy and Security > Cookies',
            'Firefox: Options > Privacy & Security > Cookies',
            'Safari: Preferences > Privacy > Cookies',
            'Edge: Settings > Cookies and Site Permissions',
          ],
        },
        {
          title: '5. Third-Party Cookies',
          content: 'In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the website and deliver advertisements on and through the website.',
        },
        {
          title: '6. Updates to This Policy',
          content: 'We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. When we post changes to this policy, we will revise the "Last Updated" date at the top of this policy.',
        },
        {
          title: '7. Contact Us',
          content: 'If you have any questions about our use of cookies, please contact us at:',
          contact: {
            email: 'privacy@bigboss.com',
            phone: '+880 1XXX-XXXXXX',
            address: 'Dhaka, Bangladesh',
          },
        },
      ],
    },
    metadata: {
      title: 'Cookie Policy - BigBoss',
      description: 'Learn how BigBoss uses cookies and similar technologies on our website.',
      keywords: ['cookies', 'privacy', 'tracking', 'bigboss'],
    },
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
  },

  terms: {
    name: 'Terms of Service',
    slug: 'terms',
    status: 'published',
    content: {
      title: 'Terms of Service',
      lastUpdated: 'December 2024',
      intro: 'Please read these Terms of Service carefully before using the BigBoss website. By accessing or using our service, you agree to be bound by these terms.',
      sections: [
        {
          title: '1. Acceptance of Terms',
          content: 'By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our website.',
        },
        {
          title: '2. Use of Website',
          content: 'You may use our website for lawful purposes only. You agree not to:',
          list: [
            'Use the website in any way that violates applicable laws or regulations',
            'Attempt to gain unauthorized access to any part of the website',
            'Use the website to transmit harmful code or interfere with its operation',
            'Collect or harvest any information from the website without permission',
            'Impersonate any person or entity or misrepresent your affiliation',
          ],
        },
        {
          title: '3. Account Registration',
          content: 'When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your password and for all activities that occur under your account.',
        },
        {
          title: '4. Products and Pricing',
          content: 'All products are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without notice. We make every effort to display accurate pricing, but errors may occur.',
        },
        {
          title: '5. Orders and Payment',
          content: 'When you place an order, you are making an offer to purchase. We reserve the right to accept or decline your order. Payment must be made at the time of ordering or upon delivery for COD orders.',
        },
        {
          title: '6. Shipping and Delivery',
          content: 'Delivery times are estimates only and are not guaranteed. We are not responsible for delays caused by shipping carriers, customs, or events beyond our control. Risk of loss passes to you upon delivery.',
        },
        {
          title: '7. Returns and Refunds',
          content: 'Our return and refund policy is detailed on our Returns & Exchanges page. By making a purchase, you agree to the terms of our return policy.',
        },
        {
          title: '8. Intellectual Property',
          content: 'All content on this website, including text, graphics, logos, images, and software, is the property of BigBoss or its content suppliers and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.',
        },
        {
          title: '9. Limitation of Liability',
          content: 'BigBoss shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the website or products purchased through the website.',
        },
        {
          title: '10. Indemnification',
          content: 'You agree to indemnify and hold harmless BigBoss and its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the website or violation of these terms.',
        },
        {
          title: '11. Changes to Terms',
          content: 'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on the website. Your continued use of the website constitutes acceptance of the modified terms.',
        },
        {
          title: '12. Governing Law',
          content: 'These terms shall be governed by and construed in accordance with the laws of Bangladesh. Any disputes shall be subject to the exclusive jurisdiction of the courts of Bangladesh.',
        },
        {
          title: '13. Contact Information',
          content: 'For questions about these Terms of Service, please contact us:',
          contact: {
            email: 'legal@bigboss.com',
            phone: '+880 1XXX-XXXXXX',
            address: 'Dhaka, Bangladesh',
          },
        },
      ],
    },
    metadata: {
      title: 'Terms of Service - BigBoss',
      description: 'Read the terms and conditions for using the BigBoss website and services.',
      keywords: ['terms', 'conditions', 'legal', 'bigboss'],
    },
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
  },

  about: {
    name: 'About Us',
    slug: 'about',
    status: 'published',
    content: {
      hero: {
        badge: 'Our Story',
        headline: 'BORN TO STAND OUT',
        description: 'BigBoss was founded in 2020 with a simple yet powerful mission: to create premium streetwear that empowers individuals to express their unique identity without compromise.',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
      },
      story: {
        title: 'The BigBoss Journey',
        paragraphs: [
          'What started as a small passion project in the heart of Dhaka has grown into one of Bangladesh\'s most recognized streetwear brands. Our founder, inspired by global street culture and local craftsmanship, set out to create clothing that bridges the gap between international trends and authentic Bengali identity.',
          'Every piece in our collection is thoughtfully designed and crafted with meticulous attention to detail. We source only the finest materials and work with skilled artisans who share our commitment to quality. We believe that great style shouldn\'t come at the expense of comfort or durability.',
          'From our humble beginnings, BigBoss has grown to serve thousands of customers across Bangladesh. But our mission remains the same: to help you express your unique style with confidence.',
        ],
      },
      values: {
        title: 'What We Stand For',
        items: [
          {
            icon: 'Gem',
            title: 'Premium Quality',
            description: 'We never compromise on materials or craftsmanship. Every piece is made to last.',
          },
          {
            icon: 'Heart',
            title: 'Customer First',
            description: 'Your satisfaction is our priority. We\'re here to help you look and feel your best.',
          },
          {
            icon: 'Leaf',
            title: 'Sustainability',
            description: 'We\'re committed to reducing our environmental impact through responsible practices.',
          },
          {
            icon: 'Users',
            title: 'Community',
            description: 'BigBoss is more than a brand—it\'s a community of individuals who dare to stand out.',
          },
        ],
      },
      stats: [
        { value: '10,000+', label: 'Happy Customers' },
        { value: '500+', label: 'Products' },
        { value: '50+', label: 'Team Members' },
        { value: '4.8', label: 'Average Rating' },
      ],
      team: {
        title: 'Meet Our Team',
        description: 'The passionate people behind BigBoss who work tirelessly to bring you the best.',
        members: [
          {
            name: 'Rafiq Ahmed',
            role: 'Founder & CEO',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            bio: 'Visionary leader with 10+ years in fashion industry.',
          },
          {
            name: 'Fatima Khan',
            role: 'Creative Director',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
            bio: 'Award-winning designer bringing global trends to local style.',
          },
          {
            name: 'Imran Hassan',
            role: 'Head of Operations',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
            bio: 'Operations expert ensuring quality at every step.',
          },
          {
            name: 'Nadia Rahman',
            role: 'Marketing Lead',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
            bio: 'Digital marketing specialist building our brand story.',
          },
        ],
      },
      cta: {
        title: 'Join the Movement',
        description: 'Be part of the BigBoss community. Follow us on social media and be the first to know about new drops and exclusive offers.',
        buttonText: 'Shop Now',
        buttonLink: '/products',
      },
    },
    metadata: {
      title: 'About Us - BigBoss',
      description: 'Learn about BigBoss, our story, mission, and the team behind Bangladesh\'s premier streetwear brand.',
      keywords: ['about', 'story', 'team', 'mission', 'bigboss'],
    },
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
  },

  contact: {
    name: 'Contact Us',
    slug: 'contact',
    status: 'published',
    content: {
      title: 'Get In Touch',
      subtitle: 'Have a question or feedback? We\'d love to hear from you. Reach out through any of the channels below.',
      contactInfo: [
        {
          icon: 'MapPin',
          title: 'Visit Us',
          lines: ['BigBoss Headquarters', 'House 42, Road 11, Block E', 'Banani, Dhaka 1213', 'Bangladesh'],
        },
        {
          icon: 'Phone',
          title: 'Call Us',
          lines: ['+880 1XXX-XXXXXX', '+880 1XXX-XXXXXX', 'Sunday - Thursday', '10:00 AM - 6:00 PM BST'],
        },
        {
          icon: 'Mail',
          title: 'Email Us',
          lines: ['General: hello@bigboss.com', 'Support: support@bigboss.com', 'Press: press@bigboss.com', 'Careers: careers@bigboss.com'],
        },
      ],
      form: {
        title: 'Send Us a Message',
        description: 'Fill out the form below and we\'ll get back to you within 24 hours.',
        fields: [
          { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name', required: true },
          { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com', required: true },
          { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '01XXX-XXXXXX', required: false },
          { name: 'subject', label: 'Subject', type: 'select', options: ['General Inquiry', 'Order Support', 'Returns & Exchanges', 'Partnerships', 'Press & Media', 'Other'], required: true },
          { name: 'message', label: 'Message', type: 'textarea', placeholder: 'How can we help you?', required: true },
        ],
        submitText: 'Send Message',
      },
      faq: {
        title: 'Quick Answers',
        description: 'Check our FAQ for instant answers to common questions.',
        link: '/faqs',
        linkText: 'Visit FAQ Page',
      },
      socialTitle: 'Connect With Us',
      socials: [
        { platform: 'Instagram', handle: '@bigboss.bd', url: 'https://instagram.com/bigboss.bd' },
        { platform: 'Facebook', handle: '/bigbossbd', url: 'https://facebook.com/bigbossbd' },
        { platform: 'Twitter', handle: '@bigboss_bd', url: 'https://twitter.com/bigboss_bd' },
      ],
      map: {
        title: 'Find Us',
        embedUrl: 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d14607.604248453179!2d90.38425380000001!3d23.750907299999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e0!3m2!1sen!2sbd!4v1765202020500!5m2!1sen!2sbd',
      },
    },
    metadata: {
      title: 'Contact Us - BigBoss',
      description: 'Get in touch with BigBoss. Contact us for orders, support, partnerships, or general inquiries.',
      keywords: ['contact', 'support', 'help', 'bigboss'],
    },
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
  },

  sizeGuide: {
    name: 'Size Guide',
    slug: 'size-guide',
    status: 'published',
    content: {
      title: 'Size Guide',
      subtitle: 'Find your perfect fit with our comprehensive size charts and measurement guides.',
      howToMeasure: {
        title: 'How to Measure',
        description: 'For the best fit, take measurements over underwear. Keep the tape measure snug but not tight.',
        measurements: [
          {
            name: 'Chest',
            icon: 'Ruler',
            instruction: 'Measure around the fullest part of your chest, keeping the tape measure horizontal.',
          },
          {
            name: 'Waist',
            icon: 'Ruler',
            instruction: 'Measure around your natural waistline, which is the narrowest part of your waist.',
          },
          {
            name: 'Hips',
            icon: 'Ruler',
            instruction: 'Measure around the fullest part of your hips, keeping the tape measure horizontal.',
          },
          {
            name: 'Inseam',
            icon: 'Ruler',
            instruction: 'Measure from the crotch seam to the bottom of the leg along the inside seam.',
          },
        ],
      },
      sizeTables: [
        {
          category: 'Men\'s Tops',
          description: 'T-shirts, shirts, hoodies, and jackets',
          headers: ['Size', 'Chest (in)', 'Chest (cm)', 'Length (in)', 'Length (cm)'],
          rows: [
            ['XS', '34-36', '86-91', '27', '69'],
            ['S', '36-38', '91-97', '28', '71'],
            ['M', '38-40', '97-102', '29', '74'],
            ['L', '40-42', '102-107', '30', '76'],
            ['XL', '42-44', '107-112', '31', '79'],
            ['XXL', '44-46', '112-117', '32', '81'],
          ],
        },
        {
          category: 'Men\'s Bottoms',
          description: 'Pants, jeans, and shorts',
          headers: ['Size', 'Waist (in)', 'Waist (cm)', 'Hip (in)', 'Hip (cm)', 'Inseam (in)'],
          rows: [
            ['28', '28', '71', '36', '91', '32'],
            ['30', '30', '76', '38', '97', '32'],
            ['32', '32', '81', '40', '102', '32'],
            ['34', '34', '86', '42', '107', '32'],
            ['36', '36', '91', '44', '112', '32'],
            ['38', '38', '97', '46', '117', '32'],
          ],
        },
        {
          category: 'Women\'s Tops',
          description: 'T-shirts, blouses, hoodies, and jackets',
          headers: ['Size', 'Bust (in)', 'Bust (cm)', 'Waist (in)', 'Waist (cm)'],
          rows: [
            ['XS', '31-32', '79-81', '24-25', '61-64'],
            ['S', '33-34', '84-86', '26-27', '66-69'],
            ['M', '35-36', '89-91', '28-29', '71-74'],
            ['L', '37-39', '94-99', '30-32', '76-81'],
            ['XL', '40-42', '102-107', '33-35', '84-89'],
            ['XXL', '43-45', '109-114', '36-38', '91-97'],
          ],
        },
        {
          category: 'Women\'s Bottoms',
          description: 'Pants, jeans, skirts, and shorts',
          headers: ['Size', 'Waist (in)', 'Waist (cm)', 'Hip (in)', 'Hip (cm)'],
          rows: [
            ['XS', '24-25', '61-64', '34-35', '86-89'],
            ['S', '26-27', '66-69', '36-37', '91-94'],
            ['M', '28-29', '71-74', '38-39', '97-99'],
            ['L', '30-32', '76-81', '40-42', '102-107'],
            ['XL', '33-35', '84-89', '43-45', '109-114'],
            ['XXL', '36-38', '91-97', '46-48', '117-122'],
          ],
        },
        {
          category: 'Kids\' Sizes',
          description: 'By age range',
          headers: ['Size', 'Age', 'Height (in)', 'Height (cm)', 'Chest (in)', 'Waist (in)'],
          rows: [
            ['2-3Y', '2-3 years', '36-39', '92-98', '21', '20'],
            ['4-5Y', '4-5 years', '41-44', '104-110', '23', '21'],
            ['6-7Y', '6-7 years', '45-48', '116-122', '25', '22'],
            ['8-9Y', '8-9 years', '50-53', '128-134', '27', '23'],
            ['10-11Y', '10-11 years', '55-58', '140-146', '29', '24'],
            ['12-13Y', '12-13 years', '59-63', '152-158', '31', '25'],
          ],
        },
      ],
      fitTypes: {
        title: 'Understanding Fit Types',
        types: [
          {
            name: 'Slim Fit',
            description: 'Fitted through the chest and waist with a tapered silhouette. Best for a modern, tailored look.',
            recommendation: 'If between sizes, size up for comfort.',
          },
          {
            name: 'Regular Fit',
            description: 'Classic fit with room through the body. Not too tight, not too loose.',
            recommendation: 'True to size for most body types.',
          },
          {
            name: 'Relaxed Fit',
            description: 'Loose, comfortable fit with extra room throughout. Perfect for layering.',
            recommendation: 'If you prefer less oversized, consider sizing down.',
          },
          {
            name: 'Oversized',
            description: 'Intentionally loose and boxy for a streetwear aesthetic.',
            recommendation: 'Designed to fit large. Order your usual size for the intended look.',
          },
        ],
      },
      tips: {
        title: 'Sizing Tips',
        items: [
          'When in doubt, size up for a more comfortable fit.',
          'Check the product description for specific fit notes on each item.',
          'Consider the fabric - cotton may shrink slightly after washing.',
          'For layering, you may want to go up one size.',
          'Read customer reviews for real-world fit feedback.',
        ],
      },
      helpSection: {
        title: 'Still Not Sure?',
        description: 'Our customer service team is happy to help you find your perfect fit.',
        email: 'support@bigboss.com',
        phone: '+880 1XXX-XXXXXX',
      },
    },
    metadata: {
      title: 'Size Guide - BigBoss',
      description: 'Find your perfect fit with our comprehensive size charts for men, women, and kids clothing.',
      keywords: ['size guide', 'sizing', 'measurements', 'fit', 'bigboss'],
    },
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
  },
};

// Helper function to get page data
export function getCMSPage(slug: string): CMSPage | undefined {
  return cmsPages[slug];
}

// Helper function to get specific section content
export function getCMSSection<T = any>(slug: string, section: string): T | undefined {
  const page = cmsPages[slug];
  if (!page) return undefined;
  return page.content[section] as T;
}
