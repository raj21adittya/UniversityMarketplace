import SwiftUI

struct RootRouterView: View {
    @State private var authViewModel = AuthViewModel()

    var body: some View {
        Group {
            switch authViewModel.authState {
            case .loading:
                ProgressView("Loading...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.backgroundPrimary)

            case .signedOut:
                NavigationStack {
                    WelcomeView()
                }
                .environment(authViewModel)

            case .signedInNoProfile:
                NavigationStack {
                    ProfileSetupView()
                }
                .environment(authViewModel)

            case .signedInComplete:
                MainTabView()
                    .environment(authViewModel)
            }
        }
        .animation(.easeInOut(duration: 0.3), value: authViewModel.authState)
    }
}
