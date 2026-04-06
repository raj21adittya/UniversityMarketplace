import SwiftUI

struct EmailEntryView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @FocusState private var emailFocused: Bool

    var body: some View {
        @Bindable var vm = authViewModel

        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 8) {
                    Image(systemName: "envelope.badge.fill")
                        .font(.system(size: 50))
                        .foregroundStyle(Color.carolinaBlue)
                        .padding(.top, 40)

                    Text(vm.isSignUp ? "Create Account" : "Sign In")
                        .font(.title2.bold())

                    Text("Use your UNC email")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                VStack(spacing: 16) {
                    TextField("youremail@unc.edu", text: $vm.email)
                        .textFieldStyle(.roundedBorder)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        .autocorrectionDisabled()
                        .focused($emailFocused)

                    SecureField("Password", text: $vm.password)
                        .textFieldStyle(.roundedBorder)

                    if let error = vm.errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(.red)
                            .multilineTextAlignment(.center)
                    }

                    Button {
                        Task {
                            await vm.signInOrCreateAccount()
                        }
                    } label: {
                        Group {
                            if vm.isLoading {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text(vm.isSignUp ? "Create Account" : "Sign In")
                            }
                        }
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            vm.email.isValidUNCEmail && vm.password.count >= 6
                                ? Color.carolinaBlue
                                : Color.gray.opacity(0.4),
                            in: RoundedRectangle(cornerRadius: 14)
                        )
                    }
                    .disabled(!vm.email.isValidUNCEmail || vm.password.count < 6 || vm.isLoading)

                    Button {
                        vm.isSignUp.toggle()
                        vm.errorMessage = nil
                    } label: {
                        Text(vm.isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up")
                            .font(.subheadline)
                            .foregroundStyle(Color.carolinaBlue)
                    }
                }
                .padding(.horizontal, 24)
            }
        }
        .background(Color.backgroundPrimary)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { emailFocused = true }
    }
}
