import SwiftUI

struct SearchView: View {
    @State private var viewModel = SearchViewModel()
    @State private var showFilters = false

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        VStack(spacing: 0) {
            // Search Bar
            HStack(spacing: 10) {
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(.secondary)
                    TextField("Search listings...", text: Bindable(viewModel).query)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .onSubmit { Task { await viewModel.search() } }

                    if viewModel.query.isNotEmpty {
                        Button {
                            viewModel.clearAll()
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .padding(10)
                .background(Color(.systemGray6), in: RoundedRectangle(cornerRadius: 10))

                Button {
                    showFilters = true
                } label: {
                    Image(systemName: viewModel.filters.isActive ? "line.3.horizontal.decrease.circle.fill" : "line.3.horizontal.decrease.circle")
                        .font(.title3)
                        .foregroundStyle(viewModel.filters.isActive ? Color.carolinaBlue : .secondary)
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 8)

            // Active Filters
            if viewModel.filters.isActive {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        if let cat = viewModel.filters.category {
                            filterChip(cat.displayName) { viewModel.filters.category = nil }
                        }
                        if let cond = viewModel.filters.condition {
                            filterChip(cond.displayName) { viewModel.filters.condition = nil }
                        }
                        if let loc = viewModel.filters.locationTag {
                            filterChip(loc.displayName) { viewModel.filters.locationTag = nil }
                        }
                        if let min = viewModel.filters.minPrice {
                            filterChip("Min $\(Int(min))") { viewModel.filters.minPrice = nil }
                        }
                        if let max = viewModel.filters.maxPrice {
                            filterChip("Max $\(Int(max))") { viewModel.filters.maxPrice = nil }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.bottom, 8)
            }

            Divider()

            // Results
            ScrollView {
                if viewModel.isSearching {
                    ProgressView()
                        .padding(.top, 60)
                } else if viewModel.hasSearched && viewModel.results.isEmpty {
                    EmptyStateView(
                        icon: "magnifyingglass",
                        title: "No Results",
                        message: "Try adjusting your search or filters"
                    )
                    .padding(.top, 40)
                } else if !viewModel.hasSearched {
                    VStack(spacing: 16) {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 40))
                            .foregroundStyle(.secondary)
                            .padding(.top, 60)
                        Text("Search for items")
                            .font(.headline)
                            .foregroundStyle(.secondary)
                    }
                } else {
                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(viewModel.results) { listing in
                            NavigationLink(value: listing) {
                                ListingCardView(listing: listing)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding()
                }
            }
        }
        .background(Color.backgroundPrimary)
        .navigationTitle("Search")
        .navigationDestination(for: Listing.self) { listing in
            ListingDetailView(listing: listing)
        }
        .sheet(isPresented: $showFilters) {
            FilterSheet(filters: Bindable(viewModel).filters) {
                Task { await viewModel.search() }
            }
        }
    }

    private func filterChip(_ text: String, onRemove: @escaping () -> Void) -> some View {
        HStack(spacing: 4) {
            Text(text)
                .font(.caption.bold())
            Button(action: {
                onRemove()
                Task { await viewModel.search() }
            }) {
                Image(systemName: "xmark")
                    .font(.caption2)
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(Color.carolinaBlue.opacity(0.15), in: Capsule())
        .foregroundStyle(Color.carolinaBlue)
    }
}
