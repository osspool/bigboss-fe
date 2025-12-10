/**
 * Review Types
 *
 * Type definitions for product reviews and ratings.
 * Includes review models, user info, and API responses.
 */

// ==================== Review User ====================

/**
 * User information displayed with reviews
 */
export interface ReviewUser {
  /** User unique identifier */
  id: string;
  /** User display name */
  name: string;
  /** User avatar URL */
  avatar?: string;
  /** Whether this is a verified purchase */
  verifiedPurchase?: boolean;
}

// ==================== Review ====================

/**
 * Product review structure
 */
export interface Review {
  /** Review unique identifier */
  id: string;
  /** User who wrote the review */
  user: ReviewUser;
  /** Product ID being reviewed */
  productId: string;
  /** Order ID (if verified purchase) */
  orderId?: string;
  /** Rating (1-5 stars) */
  rating: number;
  /** Review title/headline */
  title?: string;
  /** Review text content */
  comment: string;
  /** Review images/photos */
  images?: string[];
  /** Number of users who found this helpful */
  helpful?: number;
  /** Number of users who found this unhelpful */
  unhelpful?: number;
  /** Whether review is verified (from actual purchase) */
  verified?: boolean;
  /** Admin approval status */
  status?: "pending" | "approved" | "rejected";
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt?: string;
}

// ==================== Review Summary ====================

/**
 * Aggregated review statistics for a product
 */
export interface ReviewSummary {
  /** Average rating (0-5) */
  averageRating: number;
  /** Total number of reviews */
  totalReviews: number;
  /** Rating distribution */
  ratingDistribution: {
    /** Number of 5-star reviews */
    5: number;
    /** Number of 4-star reviews */
    4: number;
    /** Number of 3-star reviews */
    3: number;
    /** Number of 2-star reviews */
    2: number;
    /** Number of 1-star reviews */
    1: number;
  };
  /** Percentage recommended */
  recommendationRate?: number;
}

// ==================== Review Filter & Sort ====================

/**
 * Review filtering options
 */
export interface ReviewFilter {
  /** Filter by rating */
  rating?: number;
  /** Filter verified purchases only */
  verifiedOnly?: boolean;
  /** Filter by presence of images */
  withImages?: boolean;
  /** Filter by review status */
  status?: "pending" | "approved" | "rejected";
}

/**
 * Review sorting options
 */
export type ReviewSortOption =
  | "newest"        // Most recent first
  | "oldest"        // Oldest first
  | "highest"       // Highest rating first
  | "lowest"        // Lowest rating first
  | "helpful";      // Most helpful first

// ==================== Review API Payloads ====================

/**
 * Create review request payload
 */
export interface CreateReviewPayload {
  /** Product ID to review */
  productId: string;
  /** Rating (1-5) */
  rating: number;
  /** Review title (optional) */
  title?: string;
  /** Review comment */
  comment: string;
  /** Review images (URLs) */
  images?: string[];
  /** Order ID (for verified reviews) */
  orderId?: string;
}

/**
 * Update review request payload
 */
export interface UpdateReviewPayload {
  /** Updated rating */
  rating?: number;
  /** Updated title */
  title?: string;
  /** Updated comment */
  comment?: string;
  /** Updated images */
  images?: string[];
}

/**
 * Mark review as helpful/unhelpful
 */
export interface ReviewHelpfulnessPayload {
  /** Review ID */
  reviewId: string;
  /** Whether marked as helpful (true) or unhelpful (false) */
  helpful: boolean;
}

// ==================== Review API Responses ====================

/**
 * Review list response
 */
export interface ReviewListResponse {
  success: boolean;
  data: Review[];
  summary?: ReviewSummary;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

/**
 * Single review response
 */
export interface ReviewResponse {
  success: boolean;
  data: Review;
}

/**
 * Review summary response
 */
export interface ReviewSummaryResponse {
  success: boolean;
  data: ReviewSummary;
}

// ==================== Review Moderation ====================

/**
 * Admin review moderation action
 */
export interface ReviewModerationAction {
  /** Review ID */
  reviewId: string;
  /** Action to take */
  action: "approve" | "reject" | "delete";
  /** Moderation reason/notes */
  reason?: string;
  /** Moderator user ID */
  moderatedBy: string;
}

/**
 * Review report (user-submitted flag)
 */
export interface ReviewReport {
  /** Report ID */
  _id: string;
  /** Review being reported */
  reviewId: string;
  /** User who reported */
  reportedBy: string;
  /** Report reason */
  reason: "spam" | "inappropriate" | "offensive" | "fake" | "other";
  /** Additional details */
  details?: string;
  /** Report status */
  status: "pending" | "reviewed" | "resolved";
  /** Created timestamp */
  createdAt: string;
}
