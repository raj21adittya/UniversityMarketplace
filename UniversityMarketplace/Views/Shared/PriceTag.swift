import SwiftUI

struct PriceTag: View {
    let price: Double

    var body: some View {
        Text("$\(price, specifier: "%.0f")")
            .font(.system(.title3, design: .rounded).weight(.heavy))
            .foregroundStyle(Color.carolinaBlue)
    }
}
