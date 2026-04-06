export const CLOUDINARY_CLOUD_NAME = "dpgu3fuyh";
export const CLOUDINARY_UPLOAD_PRESET = "university_marketplace";

export const COLLECTIONS = {
  users: "users",
  listings: "listings",
  conversations: "conversations",
  messages: "messages",
  savedItems: "savedItems",
} as const;

export const STORAGE_PATHS = {
  profileImages: "profile_images",
  listingImages: "listing_images",
} as const;

export const ALLOWED_EMAIL_DOMAINS = [
  "unc.edu",
  "kenan-flagler.unc.edu",
  "business.unc.edu",
];

export const CATEGORIES = [
  { value: "textbooks", label: "Textbooks", icon: "📚" },
  { value: "electronics", label: "Electronics", icon: "💻" },
  { value: "furniture", label: "Furniture", icon: "🪑" },
  { value: "clothing", label: "Clothing", icon: "👕" },
  { value: "tickets", label: "Tickets", icon: "🎟️" },
  { value: "transportation", label: "Transportation", icon: "🚲" },
  { value: "housing", label: "Housing", icon: "🏠" },
  { value: "services", label: "Services", icon: "🔧" },
  { value: "food", label: "Food", icon: "🍕" },
  { value: "other", label: "Other", icon: "📦" },
] as const;

export const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "likeNew", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
] as const;

export const LOCATIONS = [
  { value: "northCampus", label: "North Campus" },
  { value: "southCampus", label: "South Campus" },
  { value: "offCampus", label: "Off Campus" },
  { value: "franklinStreet", label: "Franklin Street" },
  { value: "campusCenter", label: "Campus Center" },
  { value: "other", label: "Other" },
] as const;
