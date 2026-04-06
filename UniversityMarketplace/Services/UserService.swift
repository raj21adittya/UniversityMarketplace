import Foundation
import FirebaseFirestore

final class UserService {
    private let db = Firestore.firestore()
    private var usersRef: CollectionReference {
        db.collection(AppConstants.Collection.users)
    }

    func createUser(_ user: UMUser) async throws {
        try usersRef.document(user.id).setData(from: user)
    }

    func fetchUser(id: String) async throws -> UMUser? {
        let snapshot = try await usersRef.document(id).getDocument()
        return try snapshot.data(as: UMUser.self)
    }

    func updateUser(_ user: UMUser) async throws {
        var updated = user
        updated.updatedAt = Date()
        try usersRef.document(user.id).setData(from: updated, merge: true)
    }

    func userExists(id: String) async throws -> Bool {
        let snapshot = try await usersRef.document(id).getDocument()
        return snapshot.exists
    }

    func blockUser(currentUserID: String, blockedID: String) async throws {
        try await usersRef.document(currentUserID).updateData([
            "blockedUserIDs": FieldValue.arrayUnion([blockedID])
        ])
    }

    func unblockUser(currentUserID: String, blockedID: String) async throws {
        try await usersRef.document(currentUserID).updateData([
            "blockedUserIDs": FieldValue.arrayRemove([blockedID])
        ])
    }

    func incrementListingCount(for userID: String, by value: Int) async throws {
        try await usersRef.document(userID).updateData([
            "listingCount": FieldValue.increment(Int64(value))
        ])
    }
}
