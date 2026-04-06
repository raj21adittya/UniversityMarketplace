import Foundation
import FirebaseFirestore

final class SavedItemService {
    private let db = Firestore.firestore()

    private func savedRef(for userID: String) -> CollectionReference {
        db.collection(AppConstants.Collection.users)
            .document(userID)
            .collection(AppConstants.Collection.savedItems)
    }

    func saveItem(userID: String, listingID: String) async throws {
        let item = SavedItem(id: listingID, userID: userID, listingID: listingID, savedAt: Date())
        try savedRef(for: userID).document(listingID).setData(from: item)
    }

    func unsaveItem(userID: String, listingID: String) async throws {
        try await savedRef(for: userID).document(listingID).delete()
    }

    func isSaved(userID: String, listingID: String) async throws -> Bool {
        let doc = try await savedRef(for: userID).document(listingID).getDocument()
        return doc.exists
    }

    func fetchSavedItems(userID: String) async throws -> [SavedItem] {
        let snapshot = try await savedRef(for: userID)
            .order(by: "savedAt", descending: true)
            .getDocuments()
        return snapshot.documents.compactMap { try? $0.data(as: SavedItem.self) }
    }
}
