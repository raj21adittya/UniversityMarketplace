import Foundation

struct Conversation: Codable, Identifiable, Hashable {
    static func == (lhs: Conversation, rhs: Conversation) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }

    let id: String
    let participantIDs: [String]
    let listingID: String
    let listingTitle: String
    let listingImageURL: String?
    let listingPrice: Double
    var lastMessage: String
    var lastMessageAt: Date
    var lastSenderID: String

    // Denormalized participant info for display without extra reads
    var participantNames: [String: String]       // [userID: displayName]
    var participantImages: [String: String]       // [userID: profileImageURL]

    var createdAt: Date

    /// Get the other participant's ID given the current user
    func otherUserID(currentUserID: String) -> String {
        participantIDs.first { $0 != currentUserID } ?? ""
    }

    func otherUserName(currentUserID: String) -> String {
        let otherID = otherUserID(currentUserID: currentUserID)
        return participantNames[otherID] ?? "User"
    }

    func otherUserImage(currentUserID: String) -> String? {
        let otherID = otherUserID(currentUserID: currentUserID)
        return participantImages[otherID]
    }

    static func new(
        buyerID: String,
        sellerID: String,
        listing: Listing,
        buyerName: String,
        buyerImage: String?,
        sellerName: String,
        sellerImage: String?
    ) -> Conversation {
        var names: [String: String] = [buyerID: buyerName, sellerID: sellerName]
        var images: [String: String] = [:]
        if let img = buyerImage { images[buyerID] = img }
        if let img = sellerImage { images[sellerID] = img }

        return Conversation(
            id: UUID().uuidString,
            participantIDs: [buyerID, sellerID].sorted(),
            listingID: listing.id,
            listingTitle: listing.title,
            listingImageURL: listing.imageURLs.first,
            listingPrice: listing.price,
            lastMessage: "",
            lastMessageAt: Date(),
            lastSenderID: buyerID,
            participantNames: names,
            participantImages: images,
            createdAt: Date()
        )
    }
}
