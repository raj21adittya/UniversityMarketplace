import SwiftUI

struct ListingCardView: View {
    let listing: Listing

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .topLeading) {
                CachedImageView(url: listing.imageURLs.first)
                    .frame(maxWidth: .infinity)
                    .frame(height: 160)
                    .clipped()
                    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                    .overlay {
                        LinearGradient(
                            colors: [Color.carolinaNavy.opacity(0.22), .clear],
                            startPoint: .top,
                            endPoint: .center
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                    }

                HStack {
                    ConditionBadge(condition: listing.condition)
                    Spacer()
                    Text(listing.createdAt.timeAgoDisplay)
                        .font(.system(.caption2, design: .rounded).weight(.bold))
                        .foregroundStyle(.white.opacity(0.92))
                }
                .padding(10)
            }

            VStack(alignment: .leading, spacing: 8) {
                HStack(alignment: .top, spacing: 8) {
                    Text(listing.title)
                        .font(.system(.subheadline, design: .rounded).weight(.semibold))
                        .lineLimit(2)
                        .truncationMode(.tail)
                        .foregroundStyle(Color.carolinaInk)

                    Spacer(minLength: 0)

                    PriceTag(price: listing.price)
                }

                HStack(spacing: 8) {
                    if let imageURL = listing.sellerImageURL {
                        CachedImageView(url: imageURL, size: 24)
                            .clipShape(Circle())
                            .overlay(Circle().stroke(Color.white, lineWidth: 1.5))
                    } else {
                        Circle()
                            .fill(Color.carolinaStroke)
                            .frame(width: 24, height: 24)
                            .overlay(
                                Image(systemName: "person.fill")
                                    .font(.caption2)
                                    .foregroundStyle(Color.carolinaMuted)
                            )
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text(listing.sellerName)
                            .font(.caption.bold())
                            .foregroundStyle(Color.carolinaInk)
                            .lineLimit(1)

                        Text("Campus seller")
                            .font(.caption2)
                            .foregroundStyle(Color.carolinaMuted)
                    }

                    Spacer()

                    VerifiedBadge(size: 12)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
                .background(Color.carolinaFog, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            }
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .brandPanel(radius: 26)
        .contentShape(Rectangle())
    }
}
