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
        ZStack {
            BrandBackground()
            
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Image Gallery
                    ZStack(alignment: .bottomTrailing) {
                        TabView(selection: $currentImageIndex) {
                            if listing.imageURLs.isEmpty {
                                Rectangle()
                                    .fill(Color.carolinaMist)
                                    .overlay {
                                        Image(systemName: "photo")
                                            .font(.largeTitle)
                                            .foregroundStyle(Color.carolinaMuted)
                                    }
                                    .tag(0)
                            } else {
                                ForEach(Array(listing.imageURLs.enumerated()), id: \.offset) { index, url in
                                    CachedImageView(url: url)
                                        .tag(index)
                                }
                            }
                        }
                        .frame(height: UIScreen.main.bounds.height * 0.4)
                        .tabViewStyle(.page(indexDisplayMode: .always))
                        
                        if listing.isSold {
                            Text("CLOSED / SOLD")
                                .font(.system(size: 9, weight: .bold))
                                .tracking(1)
                                .foregroundStyle(.white)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(Color.carolinaNavy, in: RoundedRectangle(cornerRadius: 6))
                                .padding(16)
                        }
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
                    .padding(.horizontal, 10)
                    .padding(.top, 6)

                    // Details Section
                    VStack(alignment: .leading, spacing: 16) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 6) {
                                HStack(spacing: 6) {
                                    Text(listing.condition.displayName.uppercased())
                                        .font(.system(size: 8, weight: .bold))
                                        .tracking(0.8)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 3)
                                        .background(Color.white, in: RoundedRectangle(cornerRadius: 4))
                                        .overlay(RoundedRectangle(cornerRadius: 4).stroke(Color.carolinaStroke, lineWidth: 0.5))
                                    
                                    Text(listing.locationTag.displayName.uppercased())
                                        .font(.system(size: 8, weight: .bold))
                                        .tracking(0.8)
                                        .foregroundStyle(Color.carolinaMuted)
                                }

                                Text(listing.title)
                                    .font(.system(size: 24, weight: .bold, design: .rounded))
                                    .foregroundStyle(Color.carolinaNavy)
                                    .fixedSize(horizontal: false, vertical: true)
                            }

                            Spacer()

                            Text("$\(Int(listing.price))")
                                .font(.system(size: 24, weight: .bold, design: .rounded))
                                .foregroundStyle(Color.carolinaNavy)
                        }

                        Text(listing.description)
                            .font(.subheadline)
                            .foregroundStyle(Color.carolinaMuted)
                            .lineSpacing(4)
                            .fixedSize(horizontal: false, vertical: true)

                        // Seller Card
                        HStack(spacing: 12) {
                            if let imageURL = listing.sellerImageURL {
                                CachedImageView(url: imageURL, size: 48)
                                    .clipShape(Circle())
                                    .overlay(Circle().stroke(Color.white, lineWidth: 2))
                            } else {
                                Circle()
                                    .fill(Color.carolinaMist)
                                    .frame(width: 48, height: 48)
                                    .overlay(Image(systemName: "person.fill").foregroundStyle(Color.carolinaBlue))
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                HStack(spacing: 4) {
                                    Text(listing.sellerName)
                                        .font(.system(size: 14, weight: .bold))
                                    VerifiedBadge(size: 12)
                                }

                                if let seller = viewModel.sellerProfile {
                                    Text("Class of \(String(seller.graduationYear))")
                                        .font(.system(size: 11, weight: .bold))
                                        .foregroundStyle(Color.carolinaMuted)
                                        .textCase(.uppercase)
                                        .tracking(0.5)
                                }
                            }
                            Spacer()
                        }
                        .padding(16)
                        .background(Color.white, in: RoundedRectangle(cornerRadius: 20))
                        .shadow(color: Color.black.opacity(0.03), radius: 10, y: 5)

                        HStack(spacing: 24) {
                            statLabel(listing.viewCount, label: "Interactions")
                            statLabel(listing.savedCount, label: "Interested")
                            statLabel(listing.createdAt.timeAgoDisplay, label: "Listed")
                        }
                        .padding(.top, 10)
                    }
                    .padding(28)
                    .brandPanel(radius: 32)
                    .padding(.horizontal, 16)
                }
                .padding(.bottom, 100)
            }
        }
        .brandScreenBackground()
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    guard let uid = currentUserID else { return }
                    Task { await viewModel.toggleSaved(userID: uid) }
                } label: {
                    Image(systemName: viewModel.isSaved ? "heart.fill" : "heart")
                        .foregroundStyle(viewModel.isSaved ? .red : Color.carolinaNavy)
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

    private func statLabel(_ value: Any, label: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("\(value)")
                .font(.system(size: 16, weight: .bold, design: .rounded))
                .foregroundStyle(Color.carolinaNavy)
            Text(label.uppercased())
                .font(.system(size: 8, weight: .bold))
                .tracking(1)
                .foregroundStyle(Color.carolinaMuted)
        }
    }

    @ViewBuilder
    private var bottomBar: some View {
        VStack(spacing: 0) {
            Divider().opacity(0.5)
            HStack(spacing: 16) {
                if isOwnListing {
                    Button {
                        showMarkSoldConfirmation = true
                    } label: {
                        Text("Mark as Sold")
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 18)
                            .background(Color.carolinaNavy, in: RoundedRectangle(cornerRadius: 20))
                            .shadow(color: Color.carolinaNavy.opacity(0.15), radius: 10, y: 5)
                    }
                } else {
                    Button {
                        Task { await startChat() }
                    } label: {
                        HStack(spacing: 12) {
                            if isStartingChat {
                                ProgressView().tint(.white)
                            }
                            Text("Inquire with Seller")
                                .font(.system(size: 16, weight: .bold))
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(Color.carolinaNavy, in: RoundedRectangle(cornerRadius: 20))
                        .shadow(color: Color.carolinaNavy.opacity(0.15), radius: 10, y: 5)
                    }
                    .disabled(isStartingChat)
                }
            }
            .padding(.horizontal, 24)
            .padding(.top, 16)
            .padding(.bottom, 34)
            .background(.ultraThinMaterial)
        }
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
