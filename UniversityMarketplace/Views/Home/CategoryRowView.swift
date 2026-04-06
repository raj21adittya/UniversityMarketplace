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
            .padding(.horizontal)
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
                    .font(.caption)
                Text(title)
                    .font(.caption.bold())
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(
                isSelected ? Color.carolinaBlue : Color(.systemGray6),
                in: Capsule()
            )
            .foregroundStyle(isSelected ? .white : .primary)
        }
    }
}
