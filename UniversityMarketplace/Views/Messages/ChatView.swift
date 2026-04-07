import SwiftUI

struct ChatView: View {
    @State private var viewModel: ChatViewModel
    @FocusState private var isInputFocused: Bool

    init(conversation: Conversation, currentUserID: String) {
        _viewModel = State(initialValue: ChatViewModel(conversation: conversation, currentUserID: currentUserID))
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header Info
            listingBanner

            // Messages
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 20) {
                        Text("Secure marketplace connection")
                            .font(.system(size: 9, weight: .bold))
                            .textCase(.uppercase)
                            .tracking(1.5)
                            .foregroundStyle(Color.carolinaMuted.opacity(0.6))
                            .padding(.top, 16)

                        ForEach(viewModel.messages) { message in
                            MessageBubble(message: message)
                                .id(message.id)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 8)
                }
                .background(Color.white)
                .onChange(of: viewModel.messages.count) {
                    if let lastID = viewModel.messages.last?.id {
                        withAnimation(.easeOut(duration: 0.2)) {
                            proxy.scrollTo(lastID, anchor: .bottom)
                        }
                    }
                }
            }

            // Input
            inputBar
        }
        .navigationTitle(viewModel.conversation.otherUserName(currentUserID: viewModel.currentUserID))
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { viewModel.startListening() }
        .onDisappear { viewModel.stopListening() }
    }

    private var listingBanner: some View {
        HStack(spacing: 12) {
            if let imageURL = viewModel.conversation.listingImageURL {
                CachedImageView(url: imageURL, size: 44)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(viewModel.conversation.listingTitle)
                    .font(.system(size: 13, weight: .bold))
                    .lineLimit(1)
                Text("$\(viewModel.conversation.listingPrice, specifier: "%.0f")")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundStyle(Color.carolinaBlue)
            }

            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(Color.carolinaMuted)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(Color.carolinaMist.opacity(0.4))
        .border(Color.carolinaStroke.opacity(0.5), width: 0.5)
    }

    private var inputBar: some View {
        VStack(spacing: 8) {
            HStack(spacing: 12) {
                TextField("Type your message...", text: $viewModel.messageText, axis: .vertical)
                    .font(.system(size: 15, weight: .medium))
                    .textFieldStyle(.plain)
                    .lineLimit(1...5)
                    .focused($isInputFocused)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color.carolinaMist.opacity(0.6), in: RoundedRectangle(cornerRadius: 18))

                Button {
                    Task { await viewModel.sendMessage() }
                } label: {
                    ZStack {
                        Circle()
                            .fill(viewModel.messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? Color.carolinaMuted.opacity(0.2) : Color.carolinaNavy)
                            .frame(width: 44, height: 44)
                        
                        Image(systemName: "arrow.up")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundStyle(.white)
                    }
                }
                .disabled(viewModel.messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, 8)
            
            Text("Always meet in public campus areas for safety")
                .font(.system(size: 9, weight: .bold))
                .textCase(.uppercase)
                .tracking(1)
                .foregroundStyle(Color.carolinaMuted.opacity(0.5))
                .padding(.bottom, 12)
        }
        .background(.ultraThinMaterial)
        .overlay(Divider(), alignment: .top)
    }
}

// MARK: - Message Bubble

struct MessageBubble: View {
    let message: Message

    var body: some View {
        HStack {
            if message.isFromCurrentUser { Spacer(minLength: 60) }

            VStack(alignment: message.isFromCurrentUser ? .trailing : .leading, spacing: 4) {
                Text(message.text)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(message.isFromCurrentUser ? .white : Color.carolinaNavy)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(
                        message.isFromCurrentUser ? Color.carolinaNavy : Color.carolinaMist.opacity(0.6),
                        in: RoundedRectangle(cornerRadius: 20, style: .continuous)
                    )
                    .clipShape(
                        RoundedCorner(
                            radius: 20,
                            corners: message.isFromCurrentUser ? [.topLeft, .bottomLeft, .bottomRight] : [.topRight, .bottomLeft, .bottomRight]
                        )
                    )

                Text(message.createdAt.shortDisplay)
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(Color.carolinaMuted.opacity(0.6))
                    .padding(.horizontal, 4)
            }

            if !message.isFromCurrentUser { Spacer(minLength: 60) }
        }
    }
}

// Helper for specific corner rounding
struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}
