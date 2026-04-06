import SwiftUI

struct BrandBackground: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.carolinaMist, Color(red: 237/255, green: 243/255, blue: 248/255)],
                startPoint: .top,
                endPoint: .bottom
            )

            Circle()
                .fill(Color.carolinaBlue.opacity(0.14))
                .frame(width: 340, height: 340)
                .blur(radius: 10)
                .offset(x: 140, y: -240)

            Circle()
                .fill(Color.white.opacity(0.72))
                .frame(width: 260, height: 260)
                .blur(radius: 14)
                .offset(x: -150, y: -280)
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
                    .fill(Color.panelBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .stroke(Color.carolinaStroke.opacity(0.9), lineWidth: 1)
            )
            .shadow(color: Color.carolinaNavy.opacity(0.08), radius: 18, y: 8)
            .shadow(color: Color.carolinaNavy.opacity(0.04), radius: 4, y: 2)
    }
}

extension View {
    func brandScreenBackground() -> some View {
        background(BrandBackground())
    }

    func brandPanel(radius: CGFloat = 26) -> some View {
        modifier(BrandPanelModifier(radius: radius))
    }
}
