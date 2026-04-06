import SwiftUI

struct VerifiedBadge: View {
    var size: CGFloat = 14

    var body: some View {
        Image(systemName: "checkmark.seal.fill")
            .font(.system(size: size))
            .foregroundStyle(Color.carolinaBlue)
    }
}
