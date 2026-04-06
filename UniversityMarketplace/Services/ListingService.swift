import Foundation
import FirebaseFirestore

final class ListingService {
    private let db = Firestore.firestore()
    private var listingsRef: CollectionReference {
        db.collection(AppConstants.Collection.listings)
    }

    func createListing(_ listing: Listing) async throws -> String {
        let docRef = listingsRef.document(listing.id)
        try docRef.setData(from: listing)
        return listing.id
    }

    func updateListing(_ listing: Listing) async throws {
        var updated = listing
        updated.updatedAt = Date()
        try listingsRef.document(listing.id).setData(from: updated, merge: true)
    }

    func deleteListing(id: String) async throws {
        try await listingsRef.document(id).delete()
    }

    func fetchListing(id: String) async throws -> Listing? {
        let snapshot = try await listingsRef.document(id).getDocument()
        return try snapshot.data(as: Listing.self)
    }

    func fetchRecentListings(limit: Int = AppConstants.listingsPageSize) async throws -> [Listing] {
        // Single-field query + client-side filtering to avoid needing composite index
        let snapshot = try await listingsRef
            .order(by: "createdAt", descending: true)
            .limit(to: limit * 2) // fetch extra to account for filtered-out items
            .getDocuments()

        return snapshot.documents
            .compactMap { try? $0.data(as: Listing.self) }
            .filter { $0.isActive && !$0.isSold }
            .prefix(limit)
            .map { $0 }
    }

    func fetchByCategory(_ category: ListingCategory, limit: Int = AppConstants.listingsPageSize) async throws -> [Listing] {
        let snapshot = try await listingsRef
            .whereField("category", isEqualTo: category.rawValue)
            .order(by: "createdAt", descending: true)
            .limit(to: limit * 2)
            .getDocuments()

        return snapshot.documents
            .compactMap { try? $0.data(as: Listing.self) }
            .filter { $0.isActive && !$0.isSold }
            .prefix(limit)
            .map { $0 }
    }

    func fetchBySeller(_ sellerID: String) async throws -> [Listing] {
        let snapshot = try await listingsRef
            .whereField("sellerID", isEqualTo: sellerID)
            .getDocuments()

        return snapshot.documents
            .compactMap { try? $0.data(as: Listing.self) }
            .sorted { $0.createdAt > $1.createdAt }
    }

    func searchListings(query: String, filters: SearchFilters) async throws -> [Listing] {
        // Fetch all active listings and filter client-side to avoid composite index requirements
        let snapshot = try await listingsRef
            .order(by: "createdAt", descending: true)
            .limit(to: 100)
            .getDocuments()

        var results = snapshot.documents
            .compactMap { try? $0.data(as: Listing.self) }
            .filter { $0.isActive && !$0.isSold }

        // Apply filters client-side
        if let category = filters.category {
            results = results.filter { $0.category == category }
        }
        if let condition = filters.condition {
            results = results.filter { $0.condition == condition }
        }
        if let location = filters.locationTag {
            results = results.filter { $0.locationTag == location }
        }

        let queryLower = query.lowercased()
        if !queryLower.isEmpty {
            results = results.filter {
                $0.title.lowercased().contains(queryLower) ||
                $0.description.lowercased().contains(queryLower)
            }
        }

        if let minPrice = filters.minPrice {
            results = results.filter { $0.price >= minPrice }
        }
        if let maxPrice = filters.maxPrice {
            results = results.filter { $0.price <= maxPrice }
        }

        return results
    }

    func markAsSold(_ listingID: String) async throws {
        try await listingsRef.document(listingID).updateData([
            "isSold": true,
            "isActive": false,
            "updatedAt": Timestamp(date: Date())
        ])
    }

    func incrementViewCount(_ listingID: String) async throws {
        try await listingsRef.document(listingID).updateData([
            "viewCount": FieldValue.increment(Int64(1))
        ])
    }

    func toggleSaved(listingID: String, increment: Bool) async throws {
        try await listingsRef.document(listingID).updateData([
            "savedCount": FieldValue.increment(Int64(increment ? 1 : -1))
        ])
    }

    func fetchListings(ids: [String]) async throws -> [Listing] {
        guard !ids.isEmpty else { return [] }
        let chunks = stride(from: 0, to: ids.count, by: 10).map {
            Array(ids[$0..<min($0 + 10, ids.count)])
        }

        var results: [Listing] = []
        for chunk in chunks {
            let snapshot = try await listingsRef
                .whereField(FieldPath.documentID(), in: chunk)
                .getDocuments()
            results += snapshot.documents.compactMap { try? $0.data(as: Listing.self) }
        }
        return results
    }
}

struct SearchFilters {
    var category: ListingCategory?
    var condition: ListingCondition?
    var locationTag: LocationTag?
    var minPrice: Double?
    var maxPrice: Double?

    var isActive: Bool {
        category != nil || condition != nil || locationTag != nil || minPrice != nil || maxPrice != nil
    }

    mutating func clear() {
        category = nil
        condition = nil
        locationTag = nil
        minPrice = nil
        maxPrice = nil
    }
}
