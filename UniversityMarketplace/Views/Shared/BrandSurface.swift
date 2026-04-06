import SwiftUI

struct BrandBackground: View {
    var body: some View {
        ZStack {
            Color.backgroundPrimary
            
            // Soft Gradient Orbs
            Circle()
                .fill(Color.carolinaBlue.opacity(0.18))
                .frame(width: 450, height: 450)
                .blur(radius: 80)
                .offset(x: 180, y: -300)

            Circle()
                .fill(Color.white.opacity(0.6))
                .frame(width: 350, height: 350)
                .blur(radius: 60)
                .offset(x: -160, y: -350)
                
            Circle()
                .fill(Color.carolinaBlue.opacity(0.08))
                .frame(width: 300, height: 300)
                .blur(radius: 70)
                .offset(x: -150, y: 350)
        }
        .ignoresSafeArea()
    }
}

private struct BrandPanelModifier: ViewModifier {
    let radius: CGFloat

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .fill(Color.white.opacity(0.85))
                    .shadow(color: Color.carolinaNavy.opacity(0.06), radius: 30, x: 0, y: 15)
            )
            .background(VisualEffectBlur(blurStyle: .systemUltraThinMaterialLight).cornerRadius(radius))
            .overlay(
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .stroke(Color.white.opacity(0.5), lineWidth: 1.5)
            )
            .overlay(
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .stroke(Color.carolinaStroke.opacity(0.3), lineWidth: 1)
            )
    }
}

// Helper for Blur Effect (Common in modern iOS apps)
struct VisualEffectBlur: UIViewRepresentable {
    var blurStyle: UIBlurEffect.Style
    func makeUIView(context: Context) -> UIVisualEffectView {
        UIVisualEffectView(effect: UIBlurEffect(style: blurStyle))
    }
    func updateUIView(_ uiView: UIVisualEffectView, context: Context) {}
}

extension View {
    func brandScreenBackground() -> some View {
        background(BrandBackground())
    }

    func brandPanel(radius: CGFloat = 26) -> some View {
        modifier(BrandPanelModifier(radius: radius))
    }
}
