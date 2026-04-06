import Foundation
import UIKit
import Observation
import FirebaseAuth

enum AuthState: Equatable {
    case loading
    case signedOut
    case signedInNoProfile
    case signedInComplete
}

@Observable
final class AuthViewModel {
    var authState: AuthState = .loading
    var email: String = ""
    var password: String = ""
    var isSignUp: Bool = false
    var isLoading: Bool = false
    var errorMessage: String?
    var currentUserProfile: UMUser?

    private let authService = AuthService()
    private let userService = UserService()

    init() {
        checkAuthState()
    }

    func checkAuthState() {
        guard let firebaseUser = authService.currentUser else {
            authState = .signedOut
            return
        }

        Task {
            await loadUserProfile(userID: firebaseUser.uid)
        }
    }

    func loadUserProfile(userID: String) async {
        do {
            if let profile = try await userService.fetchUser(id: userID) {
                currentUserProfile = profile
                if profile.displayName.isNotEmpty {
                    authState = .signedInComplete
                } else {
                    authState = .signedInNoProfile
                }
            } else {
                authState = .signedInNoProfile
            }
        } catch {
            authState = .signedInNoProfile
        }
    }

    func signInOrCreateAccount() async {
        guard email.isValidUNCEmail else {
            errorMessage = "Please enter a valid UNC email (@unc.edu, @kenan-flagler.unc.edu, or @business.unc.edu)"
            return
        }

        guard password.count >= 6 else {
            errorMessage = "Password must be at least 6 characters"
            return
        }

        isLoading = true
        errorMessage = nil

        do {
            if isSignUp {
                try await authService.createAccount(email: email, password: password)
            } else {
                try await authService.signIn(email: email, password: password)
            }

            if let uid = authService.currentUserID {
                await loadUserProfile(userID: uid)
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func completeProfile(displayName: String, graduationYear: Int, housingArea: String, latitude: Double? = nil, longitude: Double? = nil, profileImage: Data?) async {
        guard let uid = authService.currentUserID,
              let userEmail = authService.currentUserEmail else { return }

        isLoading = true
        errorMessage = nil

        do {
            var user = UMUser.new(id: uid, email: userEmail)
            user.displayName = displayName
            user.graduationYear = graduationYear
            user.housingArea = housingArea
            user.latitude = latitude
            user.longitude = longitude

            if let imageData = profileImage,
               let uiImage = UIKit.UIImage(data: imageData) {
                let storageService = StorageService()
                let path = "\(AppConstants.StoragePath.profileImages)/\(uid).jpg"
                let url = try await storageService.uploadImage(uiImage, path: path)
                user.profileImageURL = url
            }

            let exists = try await userService.userExists(id: uid)
            if exists {
                try await userService.updateUser(user)
            } else {
                try await userService.createUser(user)
            }

            currentUserProfile = user
            authState = .signedInComplete
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func signOut() {
        do {
            try authService.signOut()
            currentUserProfile = nil
            authState = .signedOut
            email = ""
            password = ""
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
