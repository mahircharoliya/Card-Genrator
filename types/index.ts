export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  profileImage?: string;
  createdAt: string;
  businessProfile?: BusinessProfile;
}

export interface FestivalCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  isVisible: boolean;
  order: number;
  createdAt: string;
  cards?: FestivalCard[];
  cardCount?: number;
}

export interface FestivalCard {
  id: string;
  title: string;
   festivalDate: string;
  categoryId: string;
  category?: FestivalCategory;
  thumbnail: string;
  highResImage: string;
  primaryColor: string;
  secondaryColor: string;
  status: "DRAFT" | "PUBLISHED";
  downloadCount: number;
  viewCount: number;
  isTrending: boolean;
  isFeatured: boolean;
  tags: string[];
  logoX: number;
  logoY: number;
  logoWidth: number;
  logoHeight: number;
  businessNameX: number;
  businessNameY: number;
  businessNameFontSize: number;
  businessNameColor: string;
  phoneX: number;
  phoneY: number;
  phoneColor: string;
  emailX: number;
  emailY: number;
  emailColor: string;
  websiteX: number;
  websiteY: number;
  websiteColor: string;
  addressX: number;
  addressY: number;
  addressColor: string;
  taglineX: number;
  taglineY: number;
  taglineColor: string;
  fontFamily: string;
  createdAt: string;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  tagline?: string;
  gstNumber?: string;
  logo?: string;
}

export interface DownloadHistory {
  id: string;
  userId: string;
  cardId: string;
  card?: FestivalCard;
  format: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalCards: number;
  totalDownloads: number;
  totalCategories: number;
  recentUsers: User[];
  recentCards: FestivalCard[];
}

export interface CardCustomization {
  businessName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  tagline?: string;
  gstNumber?: string;
  logo?: string;
}
