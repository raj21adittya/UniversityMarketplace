import Foundation

enum AppConstants {
    static let universityDomain = "unc.edu"
    static let appName = "UNC Marketplace"
    static let maxListingImages = 5
    static let maxImageSizePixels: CGFloat = 800
    static let imageCompressionQuality: CGFloat = 0.7
    static let recentlyViewedLimit = 20
    static let listingsPageSize = 20

    enum StoragePath {
        static let profileImages = "profile_images"
        static let listingImages = "listing_images"
    }

    enum Collection {
        static let users = "users"
        static let listings = "listings"
        static let conversations = "conversations"
        static let messages = "messages"
        static let offers = "offers"
        static let reviews = "reviews"
        static let reports = "reports"
        static let savedItems = "savedItems"
    }
}
