import SwiftUI

struct ConditionBadge: View {
    let condition: ListingCondition

    var body: some View {
        Text(condition.displayName)
            .font(.system(.caption2, design: .rounded).weight(.bold))
            .foregroundStyle(Color.carolinaNavy)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.white.opacity(0.92), in: Capsule())
            .overlay(
                Capsule()
                    .stroke(Color.carolinaStroke.opacity(0.9), lineWidth: 1)
            )
    }
}

extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex)
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        self.init(
            red: Double((rgb >> 16) & 0xFF) / 255,
            green: Double((rgb >> 8) & 0xFF) / 255,
            blue: Double(rgb & 0xFF) / 255
        )
    }
}
