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
            VStack(spacing: 20) {
                VStack(alignment: .leading, spacing: 18) {
                    Text("CAROLINA MARKETPLACE")
                        .font(.system(.caption, design: .rounded).weight(.bold))
                        .tracking(2.2)
                        .foregroundStyle(Color.carolinaMuted)

                    Text("Buy, sell, and discover campus finds in UNC blue style.")
                        .font(.system(.largeTitle, design: .serif).weight(.semibold))
                        .foregroundStyle(Color.carolinaInk)
                        .lineSpacing(2)

                    Text("Browse recent student listings with a cleaner, more polished marketplace feel.")
                        .font(.subheadline)
                        .foregroundStyle(Color.carolinaMuted)

                    HStack(spacing: 12) {
                        statPill(value: "\(filteredListings.count)", label: "live")
                        statPill(value: viewModel.selectedCategory == nil ? "All" : "1", label: "focus", filled: true)
                        statPill(value: "UNC", label: "campus", navy: true)
                    }
                }
                .padding(20)
                .brandPanel(radius: 30)
                .padding(.horizontal, 20)

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
            .padding(.top, 16)
            .padding(.bottom, 28)
        }
        .brandScreenBackground()
        .navigationTitle("Marketplace")
        .navigationBarTitleDisplayMode(.inline)
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

    private func statPill(value: String, label: String, filled: Bool = false, navy: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(value)
                .font(.system(.title3, design: .rounded).weight(.heavy))
            Text(label.uppercased())
                .font(.system(.caption2, design: .rounded).weight(.bold))
                .tracking(1.4)
                .opacity(0.82)
        }
        .foregroundStyle(filled || navy ? .white : Color.carolinaInk)
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 14)
        .padding(.vertical, 14)
        .background(
            Group {
                if filled {
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .fill(Color.carolinaBlue)
                } else if navy {
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .fill(Color.carolinaNavy)
                } else {
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .fill(Color.white)
                }
            }
        )
    }
}
