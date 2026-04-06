import Foundation

enum OfferStatus: String, Codable {
    case pending
    case accepted
    case declined
    case countered
    case expired
}
