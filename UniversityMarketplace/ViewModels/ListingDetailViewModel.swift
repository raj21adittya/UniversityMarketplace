import Foundation

@Observable
final class ListingDetailViewModel {
    var listing: Listing
    var sellerProfile: UMUser?
    var isSaved = false
    var isLoading = false
    var errorMessage: String?

    private let listingService = ListingService()
    private let userService = UserService()
    private let savedItemService = SavedItemService()

    init(listing: Listing) {
        self.listing = listing
    }

    func loadDetails(currentUserID: String?) async {
        isLoading = true

        do {
            sellerProfile = try await userService.fetchUser(id: listing.sellerID)

            if let uid = currentUserID {
                isSaved = try await savedItemService.isSaved(userID: uid, listingID: listing.id)
            }

            try await listingService.incrementViewCount(listing.id)
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func toggleSaved(userID: String) async {
        do {
            if isSaved {
                try await savedItemService.unsaveItem(userID: userID, listingID: listing.id)
                try await listingService.toggleSaved(listingID: listing.id, increment: false)
            } else {
                try await savedItemService.saveItem(userID: userID, listingID: listing.id)
                try await listingService.toggleSaved(listingID: listing.id, increment: true)
            }
            isSaved.toggle()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func markAsSold() async {
        do {
            try await listingService.markAsSold(listing.id)
            listing.isSold = true
            listing.isActive = false
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    var isOwnListing: Bool {
        guard let profile = sellerProfile else { return false }
        return profile.id == listing.sellerID
    }
}
