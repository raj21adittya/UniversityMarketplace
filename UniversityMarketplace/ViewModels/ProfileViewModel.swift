import Foundation

@Observable
final class ProfileViewModel {
    var user: UMUser?
    var myListings: [Listing] = []
    var isLoading = false
    var errorMessage: String?

    var activeListings: [Listing] { myListings.filter { !$0.isSold } }
    var soldListings: [Listing] { myListings.filter { $0.isSold } }

    private let userService = UserService()
    private let listingService = ListingService()

    func loadProfile(userID: String) async {
        isLoading = true
        do {
            user = try await userService.fetchUser(id: userID)
            myListings = try await listingService.fetchBySeller(userID)
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func refreshListings(userID: String) async {
        do {
            myListings = try await listingService.fetchBySeller(userID)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
