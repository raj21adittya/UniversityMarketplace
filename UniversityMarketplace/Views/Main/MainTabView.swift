import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0
    @State private var showCreateListing = false

    var body: some View {
        TabView(selection: $selectedTab) {
            Tab("Home", systemImage: "house.fill", value: 0) {
                NavigationStack {
                    HomeView()
                }
            }

            Tab("Search", systemImage: "magnifyingglass", value: 1) {
                NavigationStack {
                    SearchView()
                }
            }

            Tab("Sell", systemImage: "plus.circle.fill", value: 2) {
                Text("")
                    .onAppear { showCreateListing = true }
            }

            Tab("Messages", systemImage: "bubble.left.and.bubble.right.fill", value: 3) {
                NavigationStack {
                    ConversationsListView()
                }
            }

            Tab("Profile", systemImage: "person.fill", value: 4) {
                NavigationStack {
                    ProfileView()
                }
            }
        }
        .tint(Color.carolinaBlue)
        .fullScreenCover(isPresented: $showCreateListing) {
            selectedTab = 0
        } content: {
            NavigationStack {
                CreateListingView()
            }
        }
    }
}
