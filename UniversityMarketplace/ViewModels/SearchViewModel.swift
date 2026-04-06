import Foundation

@Observable
final class SearchViewModel {
    var query = ""
    var results: [Listing] = []
    var filters = SearchFilters()
    var isSearching = false
    var hasSearched = false

    private let listingService = ListingService()

    func search() async {
        guard query.isNotEmpty || filters.isActive else {
            results = []
            hasSearched = false
            return
        }

        isSearching = true
        hasSearched = true

        do {
            results = try await listingService.searchListings(query: query, filters: filters)
        } catch {
            results = []
        }

        isSearching = false
    }

    func clearFilters() {
        filters.clear()
    }

    func clearAll() {
        query = ""
        filters.clear()
        results = []
        hasSearched = false
    }
}
