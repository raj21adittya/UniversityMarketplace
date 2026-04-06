import Foundation

@Observable
final class HomeViewModel {
    var listings: [Listing] = []
    var selectedCategory: ListingCategory?
    var isLoading = false
    var errorMessage: String?

    private let listingService = ListingService()

    func loadListings() async {
        isLoading = true
        errorMessage = nil

        do {
            if let category = selectedCategory {
                listings = try await listingService.fetchByCategory(category)
            } else {
                listings = try await listingService.fetchRecentListings()
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func selectCategory(_ category: ListingCategory?) async {
        selectedCategory = category
        await loadListings()
    }

    func refresh() async {
        await loadListings()
    }
}
