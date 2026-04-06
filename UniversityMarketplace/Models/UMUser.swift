import Foundation

struct UMUser: Codable, Identifiable {
    let id: String
    var email: String
    var displayName: String
    var graduationYear: Int
    var housingArea: String
    var latitude: Double?
    var longitude: Double?
    var profileImageURL: String?
    var isEmailVerified: Bool
    var blockedUserIDs: [String]
    var createdAt: Date
    var updatedAt: Date
    var averageRating: Double
    var reviewCount: Int
    var listingCount: Int

    static func new(id: String, email: String) -> UMUser {
        UMUser(
            id: id,
            email: email,
            displayName: "",
            graduationYear: Calendar.current.component(.year, from: Date()),
            housingArea: "",
            latitude: nil,
            longitude: nil,
            profileImageURL: nil,
            isEmailVerified: true,
            blockedUserIDs: [],
            createdAt: Date(),
            updatedAt: Date(),
            averageRating: 0,
            reviewCount: 0,
            listingCount: 0
        )
    }
}
