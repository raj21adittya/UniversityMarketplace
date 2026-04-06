import Foundation
import FirebaseFirestore

@Observable
final class ConversationsViewModel {
    var conversations: [Conversation] = []
    var isLoading = false
    var errorMessage: String?

    private let messageService = MessageService()
    private var listener: ListenerRegistration?

    func startListening(userID: String) {
        isLoading = conversations.isEmpty
        listener = messageService.listenToConversations(userID: userID) { [weak self] convos in
            Task { @MainActor in
                self?.conversations = convos
                self?.isLoading = false
            }
        }
    }

    func stopListening() {
        listener?.remove()
        listener = nil
    }
}
