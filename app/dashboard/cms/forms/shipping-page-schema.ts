import { field, section } from "@/components/form/form-system";

/**
 * Shipping & Delivery Page Form Schema
 * Matches ShippingPageContent in types/cms.types.ts
 */
export const shippingPageSchema = () => ({
  sections: [
    // Header
    section(
      "header",
      "Page Header",
      [
        field.text("title", "Page Title", {
          required: true,
          placeholder: "Shipping & Delivery",
        }),
        field.textarea("subtitle", "Subtitle", {
          rows: 2,
          placeholder: "Fast, reliable delivery across Bangladesh...",
        }),
      ],
      { cols: 1 }
    ),

    // Delivery Method 1
    section(
      "deliveryMethod1",
      "Delivery Method 1: Express",
      [
        field.text("deliveryMethods.0.icon", "Icon", {
          placeholder: "Zap",
          description: "Icon names: Zap, Truck, Gift",
        }),
        field.text("deliveryMethods.0.name", "Name", {
          placeholder: "Express Delivery",
        }),
        field.text("deliveryMethods.0.duration", "Duration", {
          placeholder: "1-2 business days",
        }),
        field.text("deliveryMethods.0.price", "Price", {
          placeholder: "৳120",
        }),
        field.textarea("deliveryMethods.0.description", "Description", {
          rows: 2,
          placeholder: "Priority handling and fastest delivery option.",
        }),
      ],
      { cols: 2 }
    ),

    // Delivery Method 2
    section(
      "deliveryMethod2",
      "Delivery Method 2: Standard",
      [
        field.text("deliveryMethods.1.icon", "Icon", {
          placeholder: "Truck",
        }),
        field.text("deliveryMethods.1.name", "Name", {
          placeholder: "Standard Delivery",
        }),
        field.text("deliveryMethods.1.duration", "Duration", {
          placeholder: "3-5 business days",
        }),
        field.text("deliveryMethods.1.price", "Price", {
          placeholder: "৳60",
        }),
        field.textarea("deliveryMethods.1.description", "Description", {
          rows: 2,
          placeholder: "Reliable delivery at an economical price.",
        }),
      ],
      { cols: 2 }
    ),

    // Delivery Method 3
    section(
      "deliveryMethod3",
      "Delivery Method 3: Free",
      [
        field.text("deliveryMethods.2.icon", "Icon", {
          placeholder: "Gift",
        }),
        field.text("deliveryMethods.2.name", "Name", {
          placeholder: "Free Shipping",
        }),
        field.text("deliveryMethods.2.duration", "Duration", {
          placeholder: "3-5 business days",
        }),
        field.text("deliveryMethods.2.price", "Price", {
          placeholder: "Free",
        }),
        field.textarea("deliveryMethods.2.description", "Description", {
          rows: 2,
          placeholder: "Complimentary shipping on all orders over ৳2000.",
        }),
      ],
      { cols: 2 }
    ),

    // Delivery Areas
    section(
      "deliveryAreas",
      "Delivery Areas",
      [
        field.text("deliveryAreas.title", "Section Title", {
          placeholder: "Delivery Areas & Times",
        }),
        // Area 1
        field.text("deliveryAreas.areas.0.name", "Area 1 Name", {
          placeholder: "Dhaka City",
        }),
        field.text("deliveryAreas.areas.0.duration", "Area 1 Duration", {
          placeholder: "1-2 days",
        }),
        field.text("deliveryAreas.areas.0.cost", "Area 1 Cost", {
          placeholder: "৳60 / Free over ৳2000",
        }),
        // Area 2
        field.text("deliveryAreas.areas.1.name", "Area 2 Name", {
          placeholder: "Dhaka Suburbs",
        }),
        field.text("deliveryAreas.areas.1.duration", "Area 2 Duration", {
          placeholder: "2-3 days",
        }),
        field.text("deliveryAreas.areas.1.cost", "Area 2 Cost", {
          placeholder: "৳80 / Free over ৳2000",
        }),
        // Area 3
        field.text("deliveryAreas.areas.2.name", "Area 3 Name", {
          placeholder: "Chittagong",
        }),
        field.text("deliveryAreas.areas.2.duration", "Area 3 Duration", {
          placeholder: "3-4 days",
        }),
        field.text("deliveryAreas.areas.2.cost", "Area 3 Cost", {
          placeholder: "৳100 / Free over ৳2500",
        }),
        // Area 4
        field.text("deliveryAreas.areas.3.name", "Area 4 Name", {
          placeholder: "Sylhet",
        }),
        field.text("deliveryAreas.areas.3.duration", "Area 4 Duration", {
          placeholder: "3-4 days",
        }),
        field.text("deliveryAreas.areas.3.cost", "Area 4 Cost", {
          placeholder: "৳100 / Free over ৳2500",
        }),
        // Area 5
        field.text("deliveryAreas.areas.4.name", "Area 5 Name", {
          placeholder: "Rajshahi",
        }),
        field.text("deliveryAreas.areas.4.duration", "Area 5 Duration", {
          placeholder: "4-5 days",
        }),
        field.text("deliveryAreas.areas.4.cost", "Area 5 Cost", {
          placeholder: "৳120 / Free over ৳2500",
        }),
        // Area 6
        field.text("deliveryAreas.areas.5.name", "Area 6 Name", {
          placeholder: "Other Districts",
        }),
        field.text("deliveryAreas.areas.5.duration", "Area 6 Duration", {
          placeholder: "4-5 days",
        }),
        field.text("deliveryAreas.areas.5.cost", "Area 6 Cost", {
          placeholder: "৳120 / Free over ৳3000",
        }),
      ],
      { cols: 3 }
    ),

    // Order Tracking
    section(
      "orderTracking",
      "Order Tracking Section",
      [
        field.text("orderTracking.title", "Title", {
          placeholder: "Track Your Order",
        }),
        field.textarea("orderTracking.description", "Description", {
          rows: 2,
          placeholder: "Stay updated on your order status every step of the way.",
        }),
        // Step 1
        field.text("orderTracking.steps.0.title", "Step 1 Title", {
          placeholder: "Order Confirmed",
        }),
        field.text("orderTracking.steps.0.description", "Step 1 Description", {
          placeholder: "Your order has been received and confirmed.",
        }),
        // Step 2
        field.text("orderTracking.steps.1.title", "Step 2 Title", {
          placeholder: "Processing",
        }),
        field.text("orderTracking.steps.1.description", "Step 2 Description", {
          placeholder: "We're preparing your items for shipment.",
        }),
        // Step 3
        field.text("orderTracking.steps.2.title", "Step 3 Title", {
          placeholder: "Shipped",
        }),
        field.text("orderTracking.steps.2.description", "Step 3 Description", {
          placeholder: "Your order is on its way!",
        }),
        // Step 4
        field.text("orderTracking.steps.3.title", "Step 4 Title", {
          placeholder: "Out for Delivery",
        }),
        field.text("orderTracking.steps.3.description", "Step 4 Description", {
          placeholder: "Your package is out for delivery today.",
        }),
        // Step 5
        field.text("orderTracking.steps.4.title", "Step 5 Title", {
          placeholder: "Delivered",
        }),
        field.text("orderTracking.steps.4.description", "Step 5 Description", {
          placeholder: "Your order has been delivered. Enjoy!",
        }),
      ],
      { cols: 2 }
    ),

    // Policies
    section(
      "policies",
      "Shipping Policies",
      [
        // Policy 1
        field.text("policies.0.title", "Policy 1 Title", {
          placeholder: "Shipping Cutoff Times",
        }),
        field.textarea("policies.0.content", "Policy 1 Content", {
          rows: 2,
          placeholder: "Orders placed before 2:00 PM (BST) on business days are processed the same day.",
        }),
        // Policy 2
        field.text("policies.1.title", "Policy 2 Title", {
          placeholder: "Packaging",
        }),
        field.textarea("policies.1.content", "Policy 2 Content", {
          rows: 2,
          placeholder: "All orders are carefully packaged to ensure your items arrive in perfect condition.",
        }),
        // Policy 3
        field.text("policies.2.title", "Policy 3 Title", {
          placeholder: "Delivery Attempts",
        }),
        field.textarea("policies.2.content", "Policy 3 Content", {
          rows: 2,
          placeholder: "Our delivery partners will make up to 3 delivery attempts.",
        }),
        // Policy 4
        field.text("policies.3.title", "Policy 4 Title", {
          placeholder: "Cash on Delivery (COD)",
        }),
        field.textarea("policies.3.content", "Policy 4 Content", {
          rows: 2,
          placeholder: "We offer Cash on Delivery for your convenience.",
        }),
        field.text("policies.3.list.0", "Policy 4 List Item 1", {
          placeholder: "Available for orders up to ৳10,000",
        }),
        field.text("policies.3.list.1", "Policy 4 List Item 2", {
          placeholder: "No additional charges for COD",
        }),
        field.text("policies.3.list.2", "Policy 4 List Item 3", {
          placeholder: "Payment collected at time of delivery",
        }),
      ],
      { cols: 1 }
    ),

    // FAQ
    section(
      "faq",
      "Frequently Asked Questions",
      [
        // FAQ 1
        field.text("faq.0.question", "FAQ 1 Question", {
          placeholder: "How can I track my order?",
        }),
        field.textarea("faq.0.answer", "FAQ 1 Answer", {
          rows: 2,
          placeholder: "Once your order is shipped, you'll receive an SMS and email with your tracking number.",
        }),
        // FAQ 2
        field.text("faq.1.question", "FAQ 2 Question", {
          placeholder: "Can I change my delivery address after ordering?",
        }),
        field.textarea("faq.1.answer", "FAQ 2 Answer", {
          rows: 2,
          placeholder: "Address changes are possible if the order hasn't been shipped yet.",
        }),
        // FAQ 3
        field.text("faq.2.question", "FAQ 3 Question", {
          placeholder: "What if I'm not home during delivery?",
        }),
        field.textarea("faq.2.answer", "FAQ 3 Answer", {
          rows: 2,
          placeholder: "Our delivery partner will attempt to contact you before delivery.",
        }),
        // FAQ 4
        field.text("faq.3.question", "FAQ 4 Question", {
          placeholder: "Do you deliver on weekends?",
        }),
        field.textarea("faq.3.answer", "FAQ 4 Answer", {
          rows: 2,
          placeholder: "Yes, we deliver on Saturdays in most areas.",
        }),
      ],
      { cols: 1 }
    ),

    // Contact Section
    section(
      "contactSection",
      "Contact Section",
      [
        field.text("contactSection.title", "Title", {
          placeholder: "Need Help?",
        }),
        field.textarea("contactSection.description", "Description", {
          rows: 2,
          placeholder: "Our customer service team is available to assist you with any shipping-related questions.",
        }),
        field.email("contactSection.email", "Email", {
          placeholder: "support@bigboss.com",
        }),
        field.text("contactSection.phone", "Phone", {
          placeholder: "+880 1XXX-XXXXXX",
        }),
        field.text("contactSection.hours", "Hours", {
          placeholder: "Sunday - Thursday, 10AM - 6PM (BST)",
        }),
      ],
      { cols: 2 }
    ),
  ],
});
