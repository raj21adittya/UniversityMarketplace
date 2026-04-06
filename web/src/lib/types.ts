export interface UMUser {
  id: string;
  email: string;
  displayName: string;
  graduationYear: number;
  housingArea: string;
  latitude?: number;
  longitude?: number;
  profileImageURL?: string;
  isEmailVerified: boolean;
  blockedUserIDs: string[];
  createdAt: Date;
  updatedAt: Date;
  averageRating: number;
  reviewCount: number;
  listingCount: number;
}

export interface Listing {
  id: string;
  sellerID: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  imageURLs: string[];
  locationTag: string;
  isSold: boolean;
  isActive: boolean;
  bundleID?: string;
  viewCount: number;
  savedCount: number;
  createdAt: Date;
  updatedAt: Date;
  sellerName: string;
  sellerImageURL?: string;
  sellerRating: number;
}

export interface Conversation {
  id: string;
  participantIDs: string[];
  listingID: string;
  listingTitle: string;
  listingImageURL?: string;
  listingPrice: number;
  lastMessage: string;
  lastMessageAt: Date;
  lastSenderID: string;
  participantNames: Record<string, string>;
  participantImages: Record<string, string>;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationID: string;
  senderID: string;
  text: string;
  imageURL?: string;
  createdAt: Date;
}
