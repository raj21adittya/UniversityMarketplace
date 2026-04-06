import Foundation

@Observable
final class SavedItemsViewModel {
    var savedListings: [Listing] = []
    var isLoading = false
    var errorMessage: String?

    private let savedItemService = SavedItemService()
    private let listingService = ListingService()

    func loadSavedItems(userID: String) async {
        isLoading = true
        do {
            let items = try await savedItemService.fetchSavedItems(userID: userID)
            let ids = items.map(\.listingID)
            savedListings = try await listingService.fetchListings(ids: ids)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func unsave(userID: String, listingID: String) async {
        do {
            try await savedItemService.unsaveItem(userID: userID, listingID: listingID)
            savedListings.removeAll { $0.id == listingID }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
