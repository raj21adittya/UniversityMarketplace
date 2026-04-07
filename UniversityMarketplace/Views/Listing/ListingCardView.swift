import SwiftUI

struct ListingCardView: View {
    let listing: Listing

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ZStack(alignment: .topLeading) {
                CachedImageView(url: listing.imageURLs.first)
                    .frame(maxWidth: .infinity)
                    .frame(height: 180)
                    .clipped()
                    .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                    .shadow(color: Color.carolinaNavy.opacity(0.05), radius: 10, y: 5)

                ConditionBadge(condition: listing.condition)
                    .padding(12)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack(alignment: .top) {
                    Text(listing.title)
                        .font(.system(size: 15, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.carolinaNavy)
                        .lineLimit(1)
                    
                    Spacer()
                    
                    Text("$\(Int(listing.price))")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.carolinaNavy)
                }
                
                Text(listing.createdAt.timeAgoDisplay)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(Color.carolinaMuted)
                    .tracking(0.5)
            }
            .padding(.horizontal, 4)
        }
        .padding(0)
        .contentShape(Rectangle())
    }
}
