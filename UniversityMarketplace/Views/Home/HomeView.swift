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
            VStack(spacing: 0) {
                // Hero Section
                ZStack(alignment: .bottomLeading) {
                    AsyncImage(url: URL(string: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=1000")) { image in
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(height: 280)
                            .clipped()
                    } placeholder: {
                        Color.carolinaMist.frame(height: 280)
                    }
                    
                    LinearGradient(
                        colors: [Color.backgroundPrimary.opacity(0.95), Color.backgroundPrimary.opacity(0.4), .clear],
                        startPoint: .bottom,
                        endPoint: .top
                    )
                    .frame(height: 120)
                    
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 6) {
                            Circle().fill(Color.carolinaBlue).frame(width: 5, height: 5)
                            Text("UNC CAMPUS EXCLUSIVE")
                                .font(.system(size: 8, weight: .bold))
                                .tracking(1.2)
                                .foregroundStyle(Color.carolinaNavy)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.white.opacity(0.85))
                        .clipShape(Capsule())

                        Text("Better living, \nshared on campus.")
                            .font(.system(size: 26, weight: .bold, design: .rounded))
                            .foregroundStyle(Color.carolinaNavy)
                            .lineSpacing(-1)
                    }
                    .padding(20)
                }

                VStack(spacing: 24) {
                    CategoryRowView(selectedCategory: viewModel.selectedCategory) { category in
                        Task { await viewModel.selectCategory(category) }
                    }
                    .padding(.top, 8)

                    if viewModel.isLoading && filteredListings.isEmpty {
                        ProgressView()
                            .padding(.top, 40)
                    } else if filteredListings.isEmpty {
                        EmptyStateView(
                            icon: "cart",
                            title: "Recent Discoveries",
                            message: "No items found in this category yet."
                        )
                        .padding(.top, 20)
                    } else {
                        VStack(alignment: .leading, spacing: 16) {
                            HStack {
                                Text(viewModel.selectedCategory == nil ? "Recent Discoveries" : "Results")
                                    .font(.system(size: 20, weight: .bold, design: .rounded))
                                    .foregroundStyle(Color.carolinaNavy)
                                
                                Spacer()
                                
                                Text("\(filteredListings.count) items")
                                    .font(.caption.bold())
                                    .foregroundStyle(Color.carolinaMuted)
                            }
                            .padding(.horizontal, 24)

                            LazyVGrid(columns: columns, spacing: 16) {
                                ForEach(filteredListings) { listing in
                                    NavigationLink(value: listing) {
                                        ListingCardView(listing: listing)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                            .padding(.horizontal, 20)
                        }
                    }
                }
                .padding(.bottom, 40)
            }
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
