export enum OfferStatus {
  DRAFT = 'DRAFT',
  PENDING_MODERATION = 'PENDING_MODERATION',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

export enum UserTier {
  FREE = 'FREE',
  PROMO = 'PROMO',
  PREMIUM = 'PREMIUM',
}

export interface Business {
  id: string;
  legalName: string;
  tradingName: string;
  description?: string;
  address?: string;
  city: string;
  country: string;
  phone?: string;
  email: string;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  categoryTags: string[];
  avgStarRating?: number;
  totalReviews?: number;
  status: string; // Assuming BusinessStatus enum from backend
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionType {
  code: string;
  label: string;
  description?: string;
  iconUrl?: string;
}

export interface Offer {
  id: string;
  businessId: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  imageUrl?: string;
  externalUrl?: string;
  creditCost: number;
  leadCost: number; // New field
  status: OfferStatus;
  validFrom: string;
  validTo: string;
  totalLimit: number | null;
  dailyLimit: number | null;
  perUserLimit: number;
  isPremium: boolean;
  isHighValue: boolean;
  unlockCount: number;
  redemptionCount: number;
  viewCount: number;
  primaryPromotionTypeCode: string;
  secondaryPromotionTypeCodes: string[];
  discountDetails: any; // JSON field
  timeDetails: any; // JSON field
  eligibilityDetails: any; // JSON field
  aiModerationResult: any; // JSON field
  publicUrlSlug?: string; // New field added to fix TS error
  createdAt: string;
  updatedAt: string;
  business?: Business; // Included when fetching offer details
  primaryPromotionType?: PromotionType; // Included when fetching offer details
}

export interface UnlockedOffer {
  id: string;
  userId: string;
  offerId: string;
  businessId: string;
  uniqueCouponCode: string;
  qrCodeData: string; // Data URL for QR code image
  isRedeemed: boolean;
  redeemedAt: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  offer?: Offer;
  business?: Business;
}