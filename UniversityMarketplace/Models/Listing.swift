import Foundation

struct Listing: Codable, Identifiable, Hashable {
    static func == (lhs: Listing, rhs: Listing) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }

    let id: String
    let sellerID: String
    var title: String
    var description: String
    var price: Double
    var category: ListingCategory
    var condition: ListingCondition
    var imageURLs: [String]
    var locationTag: LocationTag
    var isSold: Bool
    var isActive: Bool
    var bundleID: String?
    var viewCount: Int
    var savedCount: Int
    var createdAt: Date
    var updatedAt: Date
    var sellerName: String
    var sellerImageURL: String?
    var sellerRating: Double

    static func new(
        sellerID: String,
        title: String,
        description: String,
        price: Double,
        category: ListingCategory,
        condition: ListingCondition,
        imageURLs: [String],
        locationTag: LocationTag,
        sellerName: String,
        sellerImageURL: String?,
        sellerRating: Double
    ) -> Listing {
        Listing(
            id: UUID().uuidString,
            sellerID: sellerID,
            title: title,
            description: description,
            price: price,
            category: category,
            condition: condition,
            imageURLs: imageURLs,
            locationTag: locationTag,
            isSold: false,
            isActive: true,
            bundleID: nil,
            viewCount: 0,
            savedCount: 0,
            createdAt: Date(),
            updatedAt: Date(),
            sellerName: sellerName,
            sellerImageURL: sellerImageURL,
            sellerRating: sellerRating
        )
    }
}
