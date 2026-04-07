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
        ZStack {
            BrandBackground()
            
            ScrollView {
                VStack(spacing: 24) {
                    if let user = authViewModel.currentUserProfile {
                        profileHeader(user: user)
                    }

                    VStack(spacing: 0) {
                        NavigationLink {
                            SavedItemsView()
                        } label: {
                            profileRow(icon: "heart.fill", title: "Saved Items", color: .red)
                        }

                        Divider().padding(.leading, 56)

                        NavigationLink {
                            EditProfileView()
                        } label: {
                            profileRow(icon: "pencil.circle.fill", title: "Edit Profile", color: Color.carolinaBlue)
                        }
                    }
                    .brandPanel(radius: 28)
                    .padding(.horizontal, 20)

                    VStack(alignment: .leading, spacing: 20) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Active Listings")
                                    .font(.system(size: 20, weight: .bold, design: .rounded))
                                    .foregroundStyle(Color.carolinaNavy)
                                Rectangle().fill(Color.carolinaBlue).frame(width: 20, height: 2).cornerRadius(1)
                            }
                            Spacer()
                            Text("\(viewModel.activeListings.count) items")
                                .font(.caption.bold())
                                .foregroundStyle(Color.carolinaMuted)
                        }
                        .padding(.horizontal, 20)

                        if viewModel.activeListings.isEmpty {
                            EmptyStateView(
                                icon: "tag",
                                title: "Discovery",
                                message: "Items you list for sale will appear here"
                            )
                            .padding(.top, 20)
                        } else {
                            LazyVGrid(columns: columns, spacing: 16) {
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
                    .padding(.top, 8)

                    if !viewModel.soldListings.isEmpty {
                        VStack(alignment: .leading, spacing: 20) {
                            HStack {
                                Text("Sales History")
                                    .font(.system(size: 20, weight: .bold, design: .rounded))
                                    .foregroundStyle(Color.carolinaNavy)
                                Spacer()
                            }
                            .padding(.horizontal, 20)

                            LazyVGrid(columns: columns, spacing: 16) {
                                ForEach(viewModel.soldListings) { listing in
                                    NavigationLink(value: listing) {
                                        ListingCardView(listing: listing)
                                            .opacity(0.5)
                                            .grayscale(0.5)
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
                            .font(.system(size: 15, weight: .bold))
                            .foregroundStyle(Color.carolinaMuted)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color.white.opacity(0.5), in: RoundedRectangle(cornerRadius: 20))
                            .overlay(RoundedRectangle(cornerRadius: 20).stroke(Color.carolinaStroke, lineWidth: 0.5))
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 40)
                }
                .padding(.top, 16)
            }
        }
        .brandScreenBackground()
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.inline)
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
            Text("COMMUNITY MEMBER")
                .font(.system(size: 8, weight: .bold))
                .tracking(2)
                .foregroundStyle(Color.carolinaMuted)

            if let imageURL = user.profileImageURL {
                CachedImageView(url: imageURL, size: 70)
                    .clipShape(Circle())
                    .overlay(Circle().stroke(Color.white, lineWidth: 2))
            } else {
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 70))
                    .foregroundStyle(Color.carolinaBlue)
            }

            VStack(spacing: 4) {
                HStack(spacing: 4) {
                    Text(user.displayName)
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.carolinaNavy)
                        .lineLimit(1)
                    VerifiedBadge(size: 14)
                }

                Text("\(user.housingArea) · Class of \(user.graduationYear)")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Color.carolinaMuted)
                    .lineLimit(1)
            }

            HStack(spacing: 0) {
                statItem(value: "\(user.listingCount)", label: "Items")
                statItem(value: String(format: "%.1f", user.averageRating), label: "Rating")
                statItem(value: "\(user.reviewCount)", label: "Reviews")
            }
            .padding(.top, 4)
        }
        .padding(20)
        .frame(maxWidth: .infinity)
        .brandPanel(radius: 30)
        .padding(.horizontal, 20)
    }

    private func statItem(value: String, label: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(size: 16, weight: .bold, design: .rounded))
                .foregroundStyle(Color.carolinaNavy)
            Text(label.uppercased())
                .font(.system(size: 8, weight: .bold))
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
