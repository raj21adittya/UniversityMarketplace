import Foundation

enum ListingCondition: String, Codable, CaseIterable, Identifiable {
    case new
    case likeNew
    case good
    case fair
    case poor

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .new: "New"
        case .likeNew: "Like New"
        case .good: "Good"
        case .fair: "Fair"
        case .poor: "Poor"
        }
    }

    var color: String {
        switch self {
        case .new: "00A86B"
        case .likeNew: "4B9CD3"
        case .good: "FFB347"
        case .fair: "FF8C00"
        case .poor: "DC3545"
        }
    }
}
