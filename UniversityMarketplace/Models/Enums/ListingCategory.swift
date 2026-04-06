import Foundation

enum ListingCategory: String, Codable, CaseIterable, Identifiable {
    case furniture
    case kitchen
    case appliances
    case books
    case electronics
    case clothing
    case sports
    case tickets
    case transportation
    case other

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .furniture: "Furniture"
        case .kitchen: "Kitchen"
        case .appliances: "Appliances"
        case .books: "Books"
        case .electronics: "Electronics"
        case .clothing: "Clothing"
        case .sports: "Sports"
        case .tickets: "Tickets"
        case .transportation: "Transportation"
        case .other: "Other"
        }
    }

    var iconName: String {
        switch self {
        case .furniture: "sofa.fill"
        case .kitchen: "fork.knife"
        case .appliances: "washer.fill"
        case .books: "book.fill"
        case .electronics: "desktopcomputer"
        case .clothing: "tshirt.fill"
        case .sports: "sportscourt.fill"
        case .tickets: "ticket.fill"
        case .transportation: "bicycle"
        case .other: "ellipsis.circle.fill"
        }
    }
}
