import Foundation
import FirebaseFirestore

final class MessageService {
    private let db = Firestore.firestore()

    private var conversationsRef: CollectionReference {
        db.collection(AppConstants.Collection.conversations)
    }

    private func messagesRef(conversationID: String) -> CollectionReference {
        conversationsRef.document(conversationID).collection(AppConstants.Collection.messages)
    }

    // MARK: - Conversations

    func findConversation(buyerID: String, sellerID: String, listingID: String) async throws -> Conversation? {
        let sorted = [buyerID, sellerID].sorted()
        let snapshot = try await conversationsRef
            .whereField("participantIDs", isEqualTo: sorted)
            .whereField("listingID", isEqualTo: listingID)
            .getDocuments()

        return snapshot.documents.compactMap { try? $0.data(as: Conversation.self) }.first
    }

    func createConversation(_ conversation: Conversation) async throws -> String {
        let docRef = conversationsRef.document(conversation.id)
        try docRef.setData(from: conversation)
        print("[Chat] Created conversation: \(conversation.id)")
        return conversation.id
    }

    func getOrCreateConversation(
        buyerID: String,
        sellerID: String,
        listing: Listing,
        buyerName: String,
        buyerImage: String?,
        sellerName: String,
        sellerImage: String?
    ) async throws -> Conversation {
        if let existing = try await findConversation(buyerID: buyerID, sellerID: sellerID, listingID: listing.id) {
            print("[Chat] Found existing conversation: \(existing.id)")
            return existing
        }

        let conversation = Conversation.new(
            buyerID: buyerID,
            sellerID: sellerID,
            listing: listing,
            buyerName: buyerName,
            buyerImage: buyerImage,
            sellerName: sellerName,
            sellerImage: sellerImage
        )

        _ = try await createConversation(conversation)
        return conversation
    }

    func fetchConversations(userID: String) async throws -> [Conversation] {
        let snapshot = try await conversationsRef
            .whereField("participantIDs", arrayContains: userID)
            .getDocuments()

        return snapshot.documents
            .compactMap { try? $0.data(as: Conversation.self) }
            .sorted { $0.lastMessageAt > $1.lastMessageAt }
    }

    func listenToConversations(userID: String, onChange: @escaping @Sendable ([Conversation]) -> Void) -> ListenerRegistration {
        return conversationsRef
            .whereField("participantIDs", arrayContains: userID)
            .addSnapshotListener { snapshot, error in
                if let error {
                    print("[Chat] Conversations listener error: \(error)")
                    return
                }
                guard let documents = snapshot?.documents else { return }
                let conversations = documents
                    .compactMap { try? $0.data(as: Conversation.self) }
                    .sorted { $0.lastMessageAt > $1.lastMessageAt }
                onChange(conversations)
            }
    }

    // MARK: - Messages

    func sendMessage(_ message: Message) async throws {
        // Write the message to the subcollection
        let msgRef = messagesRef(conversationID: message.conversationID).document(message.id)
        try msgRef.setData(from: message)
        print("[Chat] Sent message: \(message.id) in conversation: \(message.conversationID)")

        // Update conversation's last message
        do {
            try await conversationsRef.document(message.conversationID).updateData([
                "lastMessage": message.text,
                "lastMessageAt": Timestamp(date: message.createdAt),
                "lastSenderID": message.senderID
            ])
        } catch {
            print("[Chat] Failed to update conversation lastMessage: \(error)")
        }
    }

    func listenToMessages(conversationID: String, onChange: @escaping @Sendable ([Message]) -> Void) -> ListenerRegistration {
        return messagesRef(conversationID: conversationID)
            .order(by: "createdAt", descending: false)
            .addSnapshotListener { snapshot, error in
                if let error {
                    print("[Chat] Messages listener error: \(error)")
                    return
                }
                guard let documents = snapshot?.documents else { return }
                let messages = documents.compactMap { try? $0.data(as: Message.self) }
                print("[Chat] Received \(messages.count) messages")
                onChange(messages)
            }
    }
}
