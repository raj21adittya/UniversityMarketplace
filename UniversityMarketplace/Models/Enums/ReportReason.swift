import Foundation

enum ReportReason: String, Codable, CaseIterable, Identifiable {
    case spam
    case scam
    case inappropriate
    case prohibited
    case harassment
    case other

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .spam: "Spam"
        case .scam: "Scam"
        case .inappropriate: "Inappropriate Content"
        case .prohibited: "Prohibited Item"
        case .harassment: "Harassment"
        case .other: "Other"
        }
    }
}
