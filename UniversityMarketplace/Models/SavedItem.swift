import Foundation

struct SavedItem: Codable, Identifiable {
    let id: String
    let userID: String
    let listingID: String
    var savedAt: Date
}
