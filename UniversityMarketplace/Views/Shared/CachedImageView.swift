import SwiftUI
import Kingfisher

struct CachedImageView: View {
    let url: String?
    var size: CGFloat? = nil

    var body: some View {
        if let urlString = url, let imageURL = URL(string: urlString) {
            if let size {
                // Fixed size (avatars, thumbnails)
                KFImage(imageURL)
                    .resizable()
                    .placeholder { placeholder(size: size) }
                    .scaledToFill()
                    .frame(width: size, height: size)
                    .clipped()
                    .contentShape(Rectangle())
            } else {
                // Flexible size — fills parent width, clips overflow
                GeometryReader { geo in
                    KFImage(imageURL)
                        .resizable()
                        .placeholder { placeholder(size: nil) }
                        .scaledToFill()
                        .frame(width: geo.size.width, height: geo.size.height)
                        .clipped()
                }
                .contentShape(Rectangle())
            }
        } else {
            placeholder(size: size)
        }
    }

    private func placeholder(size: CGFloat?) -> some View {
        Rectangle()
            .fill(Color(.systemGray5))
            .frame(width: size, height: size)
            .overlay {
                Image(systemName: "photo")
                    .foregroundStyle(.secondary)
            }
    }
}
