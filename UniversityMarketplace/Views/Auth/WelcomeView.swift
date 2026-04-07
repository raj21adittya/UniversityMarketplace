import SwiftUI

struct WelcomeView: View {
    @Environment(AuthViewModel.self) private var authViewModel

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                BrandBackground()
                
                VStack(spacing: 0) {
                    // Hero Image Section
                    ZStack(alignment: .bottomLeading) {
                        AsyncImage(url: URL(string: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=1000")) { image in
                            image
                                .resizable()
                                .scaledToFill()
                                .frame(width: geometry.size.width, height: geometry.size.height * 0.4)
                                .clipped()
                        } placeholder: {
                            Color.carolinaMist
                                .frame(width: geometry.size.width, height: geometry.size.height * 0.4)
                        }
                        
                        LinearGradient(
                            colors: [.clear, Color.backgroundPrimary.opacity(0.8), Color.backgroundPrimary],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                        .frame(height: 100)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Marketplace.")
                                .font(.system(size: 20, weight: .bold, design: .rounded))
                                .foregroundStyle(Color.carolinaNavy)
                            
                            Text("Better living, \nshared on campus.")
                                .font(.system(size: 30, weight: .bold, design: .rounded))
                                .foregroundStyle(Color.carolinaNavy)
                                .lineSpacing(-2)
                        }
                        .padding(.horizontal, 24)
                        .padding(.bottom, 10)
                    }
                    .ignoresSafeArea(edges: .top)

                    VStack(spacing: 24) {
                        Text("A refined marketplace for Tar Heels to exchange furniture, essentials, and student finds.")
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(Color.carolinaMuted)
                            .padding(.horizontal, 24)
                            .multilineTextAlignment(.leading)
                            .fixedSize(horizontal: false, vertical: true)

                        // Features
                        VStack(spacing: 16) {
                            featureRow(icon: "checkmark.seal.fill", title: "Verified Community", subtitle: "UNC students & faculty only")
                            featureRow(icon: "mappin.and.ellipse", title: "Hyper-local", subtitle: "Direct pickup on & off campus")
                        }
                        .padding(.horizontal, 24)

                        Spacer()

                        VStack(spacing: 12) {
                            NavigationLink {
                                EmailEntryView()
                            } label: {
                                Text("Get Started")
                                    .font(.headline)
                                    .foregroundStyle(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 16)
                                    .background(Color.carolinaNavy, in: RoundedRectangle(cornerRadius: 20))
                                    .shadow(color: Color.carolinaNavy.opacity(0.15), radius: 10, y: 5)
                            }
                            
                            Text("Exclusive to @unc.edu domains")
                                .font(.system(size: 9, weight: .bold))
                                .textCase(.uppercase)
                                .tracking(1.2)
                                .foregroundStyle(Color.carolinaMuted.opacity(0.6))
                        }
                        .padding(.horizontal, 24)
                        .padding(.bottom, geometry.safeAreaInsets.bottom > 0 ? 10 : 30)
                    }
                }
            }
        }
    }

    private func featureRow(icon: String, title: String, subtitle: String) -> some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.carolinaBlue.opacity(0.1))
                    .frame(width: 44, height: 44)
                
                Image(systemName: icon)
                    .font(.title3.bold())
                    .foregroundStyle(Color.carolinaBlue)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline.bold())
                    .foregroundStyle(Color.carolinaNavy)
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(Color.carolinaMuted)
            }
            Spacer()
        }
    }
}
