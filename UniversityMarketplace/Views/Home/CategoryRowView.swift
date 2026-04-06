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
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.caption.weight(.semibold))
                Text(title)
                    .font(.system(.caption, design: .rounded).weight(.bold))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(
                isSelected ? Color.carolinaBlue : Color.white.opacity(0.82),
                in: Capsule()
            )
            .overlay(
                Capsule()
                    .stroke(isSelected ? Color.clear : Color.carolinaStroke.opacity(0.95), lineWidth: 1)
            )
            .shadow(color: isSelected ? Color.carolinaBlue.opacity(0.18) : Color.clear, radius: 10, y: 6)
            .foregroundStyle(isSelected ? .white : Color.carolinaMuted)
        }
    }
}
