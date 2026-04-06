import Foundation
import FirebaseFirestore

@Observable
final class ChatViewModel {
    var messages: [Message] = []
    var messageText = ""
    var isLoading = false
    var errorMessage: String?

    let conversation: Conversation
    let currentUserID: String

    private let messageService = MessageService()
    private var listener: ListenerRegistration?

    init(conversation: Conversation, currentUserID: String) {
        self.conversation = conversation
        self.currentUserID = currentUserID
    }

    func startListening() {
        print("[Chat] Starting listener for conversation: \(conversation.id)")
        listener = messageService.listenToMessages(conversationID: conversation.id) { [weak self] msgs in
            guard let self else { return }
            Task { @MainActor in
                self.messages = msgs.map { msg in
                    var m = msg
                    m.isFromCurrentUser = (msg.senderID == self.currentUserID)
                    return m
                }
            }
        }
    }

    func stopListening() {
        listener?.remove()
        listener = nil
    }

    func sendMessage() async {
        let text = messageText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        messageText = ""

        let message = Message.new(
            conversationID: conversation.id,
            senderID: currentUserID,
            text: text
        )

        do {
            try await messageService.sendMessage(message)
        } catch {
            errorMessage = error.localizedDescription
            print("[Chat] Send failed: \(error)")
        }
    }
}
