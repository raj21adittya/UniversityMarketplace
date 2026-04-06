import Foundation

enum LocationTag: String, Codable, CaseIterable, Identifiable {
    case southCampus
    case northCampus
    case midCampus
    case franklinStreet
    case carrboro
    case chapelHillOther

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .southCampus: "South Campus"
        case .northCampus: "North Campus"
        case .midCampus: "Mid Campus"
        case .franklinStreet: "Franklin Street"
        case .carrboro: "Carrboro"
        case .chapelHillOther: "Chapel Hill (Other)"
        }
    }
}
