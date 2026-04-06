import Foundation
import UIKit

@Observable
final class CreateListingViewModel {
    var title = ""
    var description = ""
    var priceText = ""
    var category: ListingCategory = .other
    var condition: ListingCondition = .good
    var locationTag: LocationTag = .southCampus
    var selectedImages: [UIImage] = []
    var isUploading = false
    var errorMessage: String?
    var didCreateSuccessfully = false

    private let listingService = ListingService()
    private let storageService = StorageService()
    private let userService = UserService()

    var price: Double { Double(priceText) ?? 0 }

    var isFormValid: Bool {
        title.isNotEmpty &&
        description.isNotEmpty &&
        price > 0 &&
        !selectedImages.isEmpty
    }

    func createListing(sellerID: String) async {
        guard isFormValid else {
            errorMessage = "Please fill in all fields and add at least one photo"
            return
        }

        isUploading = true
        errorMessage = nil

        do {
            let seller = try await userService.fetchUser(id: sellerID)

            let imageURLs = try await storageService.uploadImages(
                selectedImages,
                basePath: "\(AppConstants.StoragePath.listingImages)/\(sellerID)"
            )

            let listing = Listing.new(
                sellerID: sellerID,
                title: title,
                description: description,
                price: price,
                category: category,
                condition: condition,
                imageURLs: imageURLs,
                locationTag: locationTag,
                sellerName: seller?.displayName ?? "UNC Student",
                sellerImageURL: seller?.profileImageURL,
                sellerRating: seller?.averageRating ?? 0
            )

            _ = try await listingService.createListing(listing)
            try await userService.incrementListingCount(for: sellerID, by: 1)

            didCreateSuccessfully = true
        } catch {
            errorMessage = error.localizedDescription
        }

        isUploading = false
    }

    func removeImage(at index: Int) {
        guard selectedImages.indices.contains(index) else { return }
        selectedImages.remove(at: index)
    }
}
