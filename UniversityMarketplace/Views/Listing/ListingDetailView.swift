import SwiftUI

struct ListingDetailView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @State private var viewModel: ListingDetailViewModel
    @State private var currentImageIndex = 0
    @State private var showMarkSoldConfirmation = false
    @State private var showChat = false
    @State private var activeConversation: Conversation?
    @State private var isStartingChat = false

    init(listing: Listing) {
        _viewModel = State(initialValue: ListingDetailViewModel(listing: listing))
    }

    private var listing: Listing { viewModel.listing }
    private var currentUserID: String? { authViewModel.currentUserProfile?.id }
    private var isOwnListing: Bool { currentUserID == listing.sellerID }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Image Carousel
                TabView(selection: $currentImageIndex) {
                    if listing.imageURLs.isEmpty {
                        Rectangle()
                            .fill(Color(.systemGray5))
                            .overlay {
                                Image(systemName: "photo")
                                    .font(.largeTitle)
                                    .foregroundStyle(.secondary)
                            }
                            .tag(0)
                    } else {
                        ForEach(Array(listing.imageURLs.enumerated()), id: \.offset) { index, url in
                            CachedImageView(url: url)
                                .tag(index)
                        }
                    }
                }
                .frame(height: 300)
                .tabViewStyle(.page(indexDisplayMode: .automatic))

                VStack(alignment: .leading, spacing: 12) {
                    // Title & Price
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(listing.title)
                                .font(.title2.bold())

                            HStack(spacing: 8) {
                                ConditionBadge(condition: listing.condition)
                                Text(listing.locationTag.displayName)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 4) {
                            Text("$\(listing.price, specifier: "%.0f")")
                                .font(.title.bold())
                                .foregroundStyle(Color.carolinaBlue)

                            if listing.isSold {
                                Text("SOLD")
                                    .font(.caption.bold())
                                    .foregroundStyle(.white)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 2)
                                    .background(.red, in: Capsule())
                            }
                        }
                    }

                    Divider()

                    // Description
                    Text(listing.description)
                        .font(.body)
                        .foregroundStyle(.secondary)

                    Divider()

                    // Seller Info
                    HStack(spacing: 12) {
                        if let imageURL = listing.sellerImageURL {
                            CachedImageView(url: imageURL, size: 44)
                                .clipShape(Circle())
                        } else {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 44))
                                .foregroundStyle(.secondary)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            HStack(spacing: 4) {
                                Text(listing.sellerName)
                                    .font(.subheadline.bold())
                                VerifiedBadge()
                            }

                            if let seller = viewModel.sellerProfile {
                                Text("\(seller.housingArea) · Class of \(seller.graduationYear)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }

                            if listing.sellerRating > 0 {
                                HStack(spacing: 2) {
                                    Image(systemName: "star.fill")
                                        .font(.caption2)
                                        .foregroundStyle(.orange)
                                    Text(String(format: "%.1f", listing.sellerRating))
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }

                        Spacer()
                    }
                    .padding()
                    .background(Color(.systemGray6), in: RoundedRectangle(cornerRadius: 12))

                    // Stats
                    HStack(spacing: 20) {
                        Label("\(listing.viewCount) views", systemImage: "eye")
                        Label("\(listing.savedCount) saved", systemImage: "heart")
                        Label(listing.createdAt.timeAgoDisplay, systemImage: "clock")
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                }
                .padding(.horizontal)
            }
        }
        .background(Color.backgroundPrimary)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    guard let uid = currentUserID else { return }
                    Task { await viewModel.toggleSaved(userID: uid) }
                } label: {
                    Image(systemName: viewModel.isSaved ? "heart.fill" : "heart")
                        .foregroundStyle(viewModel.isSaved ? .red : .secondary)
                }
            }
        }
        .safeAreaInset(edge: .bottom) {
            if !listing.isSold {
                bottomBar
            }
        }
        .confirmationDialog("Mark as Sold", isPresented: $showMarkSoldConfirmation) {
            Button("Mark as Sold", role: .destructive) {
                Task { await viewModel.markAsSold() }
            }
        }
        .navigationDestination(isPresented: $showChat) {
            if let conversation = activeConversation, let uid = currentUserID {
                ChatView(conversation: conversation, currentUserID: uid)
            }
        }
        .task {
            await viewModel.loadDetails(currentUserID: currentUserID)
        }
    }

    @ViewBuilder
    private var bottomBar: some View {
        VStack {
            Divider()
            HStack(spacing: 12) {
                if isOwnListing {
                    Button {
                        showMarkSoldConfirmation = true
                    } label: {
                        Text("Mark as Sold")
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.carolinaBlue, in: RoundedRectangle(cornerRadius: 14))
                    }
                } else {
                    Button {
                        Task { await startChat() }
                    } label: {
                        HStack {
                            if isStartingChat {
                                ProgressView()
                                    .tint(.white)
                            }
                            Text(isStartingChat ? "Opening Chat..." : "Message Seller")
                        }
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.carolinaBlue, in: RoundedRectangle(cornerRadius: 14))
                    }
                    .disabled(isStartingChat)
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 8)
        }
        .background(.ultraThinMaterial)
    }

    private func startChat() async {
        guard let uid = currentUserID,
              let currentUser = authViewModel.currentUserProfile else { return }

        isStartingChat = true

        do {
            let messageService = MessageService()
            let conversation = try await messageService.getOrCreateConversation(
                buyerID: uid,
                sellerID: listing.sellerID,
                listing: listing,
                buyerName: currentUser.displayName,
                buyerImage: currentUser.profileImageURL,
                sellerName: listing.sellerName,
                sellerImage: listing.sellerImageURL
            )
            activeConversation = conversation
            showChat = true
        } catch {
            print("[Chat] Failed to start conversation: \(error)")
        }

        isStartingChat = false
    }
}
