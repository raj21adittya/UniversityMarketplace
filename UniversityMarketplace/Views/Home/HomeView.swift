import SwiftUI

struct HomeView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @State private var viewModel = HomeViewModel()

    private var currentUserID: String? { authViewModel.currentUserProfile?.id }

    private var filteredListings: [Listing] {
        viewModel.listings.filter { $0.sellerID != currentUserID }
    }

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                CategoryRowView(selectedCategory: viewModel.selectedCategory) { category in
                    Task { await viewModel.selectCategory(category) }
                }

                if viewModel.isLoading && filteredListings.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                        .padding(.top, 60)
                } else if filteredListings.isEmpty {
                    EmptyStateView(
                        icon: "cart",
                        title: "No Listings Yet",
                        message: "Be the first to post something for sale!"
                    )
                    .padding(.top, 40)
                } else {
                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(filteredListings) { listing in
                            NavigationLink(value: listing) {
                                ListingCardView(listing: listing)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal)
                }
            }
        }
        .background(Color.backgroundPrimary)
        .navigationTitle("UNC Marketplace")
        .navigationDestination(for: Listing.self) { listing in
            ListingDetailView(listing: listing)
        }
        .refreshable {
            await viewModel.refresh()
        }
        .task {
            if viewModel.listings.isEmpty {
                await viewModel.loadListings()
            }
        }
    }
}
