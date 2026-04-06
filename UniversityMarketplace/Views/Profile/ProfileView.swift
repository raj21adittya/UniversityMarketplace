import SwiftUI

struct ProfileView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @State private var viewModel = ProfileViewModel()
    @State private var showSignOutConfirmation = false

    private var currentUserID: String? { authViewModel.currentUserProfile?.id }

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                if let user = authViewModel.currentUserProfile {
                    profileHeader(user: user)
                }

                VStack(spacing: 0) {
                    NavigationLink {
                        SavedItemsView()
                    } label: {
                        profileRow(icon: "heart.fill", title: "Saved Items", color: .red)
                    }

                    Divider().padding(.leading, 48)

                    NavigationLink {
                        EditProfileView()
                    } label: {
                        profileRow(icon: "pencil.circle.fill", title: "Edit Profile", color: Color.carolinaBlue)
                    }
                }
                .padding(4)
                .brandPanel(radius: 24)
                .padding(.horizontal, 20)

                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Active Listings")
                            .font(.system(.title3, design: .serif).weight(.semibold))
                        Spacer()
                        Text("\(viewModel.activeListings.count) items")
                            .font(.caption)
                            .foregroundStyle(Color.carolinaMuted)
                    }
                    .padding(.horizontal, 20)

                    if viewModel.activeListings.isEmpty {
                        EmptyStateView(
                            icon: "tag",
                            title: "No Active Listings",
                            message: "Items you list for sale will appear here"
                        )
                    } else {
                        LazyVGrid(columns: columns, spacing: 12) {
                            ForEach(viewModel.activeListings) { listing in
                                NavigationLink(value: listing) {
                                    ListingCardView(listing: listing)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                }

                if !viewModel.soldListings.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Sold")
                                .font(.system(.title3, design: .serif).weight(.semibold))
                            Spacer()
                            Text("\(viewModel.soldListings.count) items")
                                .font(.caption)
                                .foregroundStyle(Color.carolinaMuted)
                        }
                        .padding(.horizontal, 20)

                        LazyVGrid(columns: columns, spacing: 12) {
                            ForEach(viewModel.soldListings) { listing in
                                NavigationLink(value: listing) {
                                    ListingCardView(listing: listing)
                                        .opacity(0.6)
                                        .overlay(alignment: .topLeading) {
                                            Text("SOLD")
                                                .font(.caption2.bold())
                                                .foregroundStyle(.white)
                                                .padding(.horizontal, 8)
                                                .padding(.vertical, 3)
                                                .background(.red, in: Capsule())
                                                .padding(8)
                                        }
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                }

                Button(role: .destructive) {
                    showSignOutConfirmation = true
                } label: {
                    Text("Sign Out")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 32)
            }
            .padding(.top, 16)
        }
        .brandScreenBackground()
        .navigationTitle("Profile")
        .navigationDestination(for: Listing.self) { listing in
            ListingDetailView(listing: listing)
        }
        .confirmationDialog("Sign Out", isPresented: $showSignOutConfirmation) {
            Button("Sign Out", role: .destructive) {
                authViewModel.signOut()
            }
        }
        .refreshable {
            if let uid = currentUserID {
                await viewModel.refreshListings(userID: uid)
            }
        }
        .task(id: currentUserID) {
            if let uid = currentUserID {
                await viewModel.loadProfile(userID: uid)
            }
        }
        .onAppear {
            if let uid = currentUserID, !viewModel.myListings.isEmpty {
                Task { await viewModel.refreshListings(userID: uid) }
            }
        }
    }

    private func profileHeader(user: UMUser) -> some View {
        VStack(spacing: 12) {
            Text("PROFILE")
                .font(.system(.caption, design: .rounded).weight(.bold))
                .tracking(2.2)
                .foregroundStyle(Color.carolinaMuted)

            if let imageURL = user.profileImageURL {
                CachedImageView(url: imageURL, size: 80)
                    .clipShape(Circle())
                    .overlay(Circle().stroke(Color.white, lineWidth: 3))
            } else {
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 80))
                    .foregroundStyle(Color.carolinaBlue)
            }

            VStack(spacing: 4) {
                HStack(spacing: 4) {
                    Text(user.displayName)
                        .font(.system(.title2, design: .serif).weight(.semibold))
                    VerifiedBadge(size: 16)
                }

                Text("\(user.housingArea) · Class of \(user.graduationYear)")
                    .font(.subheadline)
                    .foregroundStyle(Color.carolinaMuted)

                if user.averageRating > 0 {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .foregroundStyle(.orange)
                        Text(String(format: "%.1f", user.averageRating))
                        Text("(\(user.reviewCount) reviews)")
                            .foregroundStyle(Color.carolinaMuted)
                    }
                    .font(.caption)
                }
            }

            HStack(spacing: 32) {
                statItem(value: "\(user.listingCount)", label: "Listed")
                statItem(value: String(format: "%.1f", user.averageRating), label: "Rating")
                statItem(value: "\(user.reviewCount)", label: "Reviews")
            }
            .padding(.top, 4)
        }
        .padding(20)
        .brandPanel(radius: 30)
        .padding(.horizontal, 20)
    }

    private func statItem(value: String, label: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(.title3, design: .rounded).weight(.heavy))
            Text(label)
                .font(.caption)
                .foregroundStyle(Color.carolinaMuted)
        }
        .frame(maxWidth: .infinity)
    }

    private func profileRow(icon: String, title: String, color: Color) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(color)
                .frame(width: 28)
            Text(title)
                .foregroundStyle(.primary)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding()
    }
}
