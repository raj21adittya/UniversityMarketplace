import SwiftUI

struct CategoryRowView: View {
    var selectedCategory: ListingCategory?
    var onSelect: (ListingCategory?) -> Void

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                CategoryChip(
                    title: "All",
                    icon: "square.grid.2x2.fill",
                    isSelected: selectedCategory == nil
                ) {
                    onSelect(nil)
                }

                ForEach(ListingCategory.allCases) { category in
                    CategoryChip(
                        title: category.displayName,
                        icon: category.iconName,
                        isSelected: selectedCategory == category
                    ) {
                        onSelect(category)
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 8)
        }
    }
}

struct CategoryChip: View {
    let title: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title.uppercased())
                .font(.system(size: 10, weight: .bold))
                .tracking(1.2)
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(
                    isSelected ? Color.carolinaNavy : Color.clear,
                    in: Capsule()
                )
                .overlay(
                    Capsule()
                        .stroke(isSelected ? Color.clear : Color.carolinaStroke, lineWidth: 1)
                )
                .foregroundStyle(isSelected ? .white : Color.carolinaMuted)
                .shadow(color: isSelected ? Color.carolinaNavy.opacity(0.1) : Color.clear, radius: 8, y: 4)
        }
    }
}
