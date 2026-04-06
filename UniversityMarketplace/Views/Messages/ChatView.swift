import SwiftUI

struct ChatView: View {
    @State private var viewModel: ChatViewModel
    @FocusState private var isInputFocused: Bool

    init(conversation: Conversation, currentUserID: String) {
        _viewModel = State(initialValue: ChatViewModel(conversation: conversation, currentUserID: currentUserID))
    }

    var body: some View {
        VStack(spacing: 0) {
            // Listing banner
            listingBanner

            Divider()

            // Messages
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 8) {
                        ForEach(viewModel.messages) { message in
                            MessageBubble(message: message)
                                .id(message.id)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                }
                .onChange(of: viewModel.messages.count) {
                    if let lastID = viewModel.messages.last?.id {
                        withAnimation(.easeOut(duration: 0.2)) {
                            proxy.scrollTo(lastID, anchor: .bottom)
                        }
                    }
                }
            }

            Divider()

            // Input bar
            inputBar
        }
        .navigationTitle(viewModel.conversation.otherUserName(currentUserID: viewModel.currentUserID))
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { viewModel.startListening() }
        .onDisappear { viewModel.stopListening() }
    }

    private var listingBanner: some View {
        HStack(spacing: 10) {
            if let imageURL = viewModel.conversation.listingImageURL {
                CachedImageView(url: imageURL, size: 40)
                    .clipShape(RoundedRectangle(cornerRadius: 6))
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(viewModel.conversation.listingTitle)
                    .font(.caption.bold())
                    .lineLimit(1)
                Text("$\(viewModel.conversation.listingPrice, specifier: "%.0f")")
                    .font(.caption)
                    .foregroundStyle(Color.carolinaBlue)
            }

            Spacer()
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .background(Color(.systemGray6))
    }

    private var inputBar: some View {
        HStack(spacing: 10) {
            TextField("Type a message...", text: $viewModel.messageText, axis: .vertical)
                .textFieldStyle(.plain)
                .lineLimit(1...4)
                .focused($isInputFocused)
                .padding(10)
                .background(Color(.systemGray6), in: RoundedRectangle(cornerRadius: 20))

            Button {
                Task { await viewModel.sendMessage() }
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.title2)
                    .foregroundStyle(
                        viewModel.messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                        ? Color(.systemGray4)
                        : Color.carolinaBlue
                    )
            }
            .disabled(viewModel.messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .background(.ultraThinMaterial)
    }
}

// MARK: - Message Bubble

struct MessageBubble: View {
    let message: Message

    var body: some View {
        HStack {
            if message.isFromCurrentUser { Spacer(minLength: 60) }

            VStack(alignment: message.isFromCurrentUser ? .trailing : .leading, spacing: 2) {
                Text(message.text)
                    .font(.subheadline)
                    .foregroundStyle(message.isFromCurrentUser ? .white : .primary)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(
                        message.isFromCurrentUser ? Color.carolinaBlue : Color(.systemGray5),
                        in: RoundedRectangle(cornerRadius: 18)
                    )

                Text(message.createdAt.shortDisplay)
                    .font(.system(size: 10))
                    .foregroundStyle(.tertiary)
            }

            if !message.isFromCurrentUser { Spacer(minLength: 60) }
        }
    }
}
