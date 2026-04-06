import Foundation

extension String {
    private static let allowedDomains = [
        "@unc.edu",
        "@kenan-flagler.unc.edu",
        "@business.unc.edu"
    ]

    var isValidUNCEmail: Bool {
        let trimmed = self.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        return Self.allowedDomains.contains { domain in
            trimmed.hasSuffix(domain) && trimmed.count > domain.count
        }
    }

    var isNotEmpty: Bool {
        !trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
}
