import Foundation

struct Message: Codable, Identifiable, Hashable {
    let id: String
    let conversationID: String
    let senderID: String
    var text: String
    var imageURL: String?
    var createdAt: Date

    var isFromCurrentUser: Bool = false

    enum CodingKeys: String, CodingKey {
        case id, conversationID, senderID, text, imageURL, createdAt
    }

    static func new(
        conversationID: String,
        senderID: String,
        text: String,
        imageURL: String? = nil
    ) -> Message {
        Message(
            id: UUID().uuidString,
            conversationID: conversationID,
            senderID: senderID,
            text: text,
            imageURL: imageURL,
            createdAt: Date()
        )
    }
}
