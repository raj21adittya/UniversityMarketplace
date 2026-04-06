import SwiftUI

struct WelcomeView: View {
    @Environment(AuthViewModel.self) private var authViewModel

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            VStack(spacing: 16) {
                Image(systemName: "building.columns.fill")
                    .font(.system(size: 80))
                    .foregroundStyle(Color.carolinaBlue)

                Text("UNC Marketplace")
                    .font(.largeTitle.bold())
                    .foregroundStyle(Color.carolinaDark)

                Text("Buy & sell with fellow Tar Heels")
                    .font(.title3)
                    .foregroundStyle(.secondary)
            }

            VStack(spacing: 12) {
                featureRow(icon: "checkmark.shield.fill", text: "Verified UNC students only")
                featureRow(icon: "mappin.circle.fill", text: "Hyper-local campus listings")
                featureRow(icon: "bubble.left.and.bubble.right.fill", text: "Direct messaging with sellers")
                featureRow(icon: "star.fill", text: "Ratings & reviews for trust")
            }
            .padding(.horizontal)

            Spacer()

            NavigationLink {
                EmailEntryView()
            } label: {
                Text("Get Started")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.carolinaBlue, in: RoundedRectangle(cornerRadius: 14))
            }
            .padding(.horizontal, 24)

            Text("Accepts @unc.edu, @kenan-flagler.unc.edu, @business.unc.edu")
                .font(.caption)
                .foregroundStyle(.secondary)
                .padding(.bottom, 32)
        }
        .background(Color.backgroundPrimary)
    }

    private func featureRow(icon: String, text: String) -> some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(Color.carolinaBlue)
                .frame(width: 32)
            Text(text)
                .font(.body)
                .foregroundStyle(.primary)
            Spacer()
        }
        .padding(.vertical, 4)
    }
}
