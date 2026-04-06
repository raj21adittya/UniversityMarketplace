import SwiftUI

@main
struct UniversityMarketplaceApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate

    var body: some Scene {
        WindowGroup {
            RootRouterView()
        }
    }
}
