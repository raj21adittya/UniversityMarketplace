import SwiftUI

struct ConversationsListView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @State private var viewModel = ConversationsViewModel()

    private var currentUserID: String? { authViewModel.currentUserProfile?.id }

    var body: some View {
        ZStack {
            BrandBackground()
            
            VStack(spacing: 0) {
                if viewModel.isLoading {
                    ProgressView()
                        .padding(.top, 40)
                } else if viewModel.conversations.isEmpty {
                    EmptyStateView(
                        icon: "bubble.left.and.bubble.right",
                        title: "Messages",
                        message: "When you inquire about an item, your chats will appear here."
                    )
                    .padding(.top, 40)
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(viewModel.conversations) { conversation in
                                NavigationLink(value: conversation) {
                                    conversationRow(conversation)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.top, 16)
                    }
                }
            }
        }
        .navigationTitle("Messages")
        .navigationBarTitleDisplayMode(.inline)
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
        HStack(spacing: 16) {
            // Other user's avatar
            ZStack(alignment: .bottomTrailing) {
                if let imageURL = conversation.otherUserImage(currentUserID: currentUserID ?? "") {
                    CachedImageView(url: imageURL, size: 60)
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                        .shadow(color: Color.black.opacity(0.05), radius: 5, y: 2)
                } else {
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color.carolinaMist)
                        .frame(width: 60, height: 60)
                        .overlay(Text(conversation.otherUserName(currentUserID: currentUserID ?? "").prefix(1)).font(.title3.bold()).foregroundStyle(Color.carolinaNavy))
                }
                
                Circle()
                    .fill(.green)
                    .frame(width: 12, height: 12)
                    .overlay(Circle().stroke(Color.white, lineWidth: 2))
                    .offset(x: 4, y: 4)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(conversation.otherUserName(currentUserID: currentUserID ?? ""))
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.carolinaNavy)
                    Spacer()
                    Text(conversation.lastMessageAt.timeAgoDisplay)
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(Color.carolinaMuted)
                }

                Text(conversation.listingTitle.uppercased())
                    .font(.system(size: 9, weight: .bold))
                    .tracking(1)
                    .foregroundStyle(Color.carolinaBlue)
                    .lineLimit(1)

                Text(conversation.lastMessage.isEmpty ? "Start the conversation..." : conversation.lastMessage)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(Color.carolinaMuted)
                    .lineLimit(1)
            }
        }
        .padding(16)
        .brandPanel(radius: 24)
    }
}
