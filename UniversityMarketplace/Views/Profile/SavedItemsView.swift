import SwiftUI

struct SavedItemsView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @State private var viewModel = SavedItemsViewModel()

    private var currentUserID: String? { authViewModel.currentUserProfile?.id }

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        ScrollView {
            if viewModel.isLoading {
                ProgressView()
                    .padding(.top, 60)
            } else if viewModel.savedListings.isEmpty {
                EmptyStateView(
                    icon: "heart",
                    title: "No Saved Items",
                    message: "Items you save will appear here"
                )
                .padding(.top, 40)
            } else {
                LazyVGrid(columns: columns, spacing: 12) {
                    ForEach(viewModel.savedListings) { listing in
                        NavigationLink(value: listing) {
                            ListingCardView(listing: listing)
                        }
                        .buttonStyle(.plain)
                        .contextMenu {
                            Button(role: .destructive) {
                                guard let uid = currentUserID else { return }
                                Task { await viewModel.unsave(userID: uid, listingID: listing.id) }
                            } label: {
                                Label("Remove", systemImage: "heart.slash")
                            }
                        }
                    }
                }
                .padding()
            }
        }
        .background(Color.backgroundPrimary)
        .navigationTitle("Saved Items")
        .navigationDestination(for: Listing.self) { listing in
            ListingDetailView(listing: listing)
        }
        .task {
            if let uid = currentUserID {
                await viewModel.loadSavedItems(userID: uid)
            }
        }
    }
}
