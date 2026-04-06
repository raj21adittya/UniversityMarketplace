import SwiftUI

struct ConversationsListView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @State private var viewModel = ConversationsViewModel()

    private var currentUserID: String? { authViewModel.currentUserProfile?.id }

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView("Loading...")
            } else if viewModel.conversations.isEmpty {
                EmptyStateView(
                    icon: "bubble.left.and.bubble.right",
                    title: "No Messages",
                    message: "When you message a seller, your conversations will appear here"
                )
            } else {
                List(viewModel.conversations) { conversation in
                    NavigationLink(value: conversation) {
                        conversationRow(conversation)
                    }
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle("Messages")
        .navigationDestination(for: Conversation.self) { conversation in
            if let uid = currentUserID {
                ChatView(conversation: conversation, currentUserID: uid)
            }
        }
        .onAppear {
            if let uid = currentUserID {
                viewModel.startListening(userID: uid)
            }
        }
        .onDisappear {
            viewModel.stopListening()
        }
    }

    private func conversationRow(_ conversation: Conversation) -> some View {
        HStack(spacing: 12) {
            // Other user's avatar
            if let imageURL = conversation.otherUserImage(currentUserID: currentUserID ?? "") {
                CachedImageView(url: imageURL, size: 50)
                    .clipShape(Circle())
            } else {
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 50))
                    .foregroundStyle(.secondary)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(conversation.otherUserName(currentUserID: currentUserID ?? ""))
                        .font(.subheadline.bold())
                    Spacer()
                    Text(conversation.lastMessageAt.timeAgoDisplay)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }

                // Listing context
                Text(conversation.listingTitle)
                    .font(.caption)
                    .foregroundStyle(Color.carolinaBlue)
                    .lineLimit(1)

                // Last message
                Text(conversation.lastMessage.isEmpty ? "No messages yet" : conversation.lastMessage)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
        }
        .padding(.vertical, 4)
    }
}
