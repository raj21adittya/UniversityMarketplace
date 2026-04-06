import SwiftUI

struct ListingCardView: View {
    let listing: Listing

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            CachedImageView(url: listing.imageURLs.first)
                .frame(maxWidth: .infinity)
                .frame(height: 150)
                .clipped()
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .overlay(alignment: .topTrailing) {
                    ConditionBadge(condition: listing.condition)
                        .padding(6)
                }

            VStack(alignment: .leading, spacing: 4) {
                Text(listing.title)
                    .font(.subheadline.bold())
                    .lineLimit(1)
                    .truncationMode(.tail)
                    .foregroundStyle(.primary)

                PriceTag(price: listing.price)

                HStack(spacing: 4) {
                    if let imageURL = listing.sellerImageURL {
                        CachedImageView(url: imageURL, size: 16)
                            .clipShape(Circle())
                    } else {
                        Image(systemName: "person.circle.fill")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Text(listing.sellerName)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)

                    VerifiedBadge(size: 10)
                }

                Text(listing.createdAt.timeAgoDisplay)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground), in: RoundedRectangle(cornerRadius: 12))
        .shadow(color: .black.opacity(0.06), radius: 4, y: 2)
        .contentShape(Rectangle())
    }
}
