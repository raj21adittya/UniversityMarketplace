import SwiftUI

struct EmailEntryView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @FocusState private var emailFocused: Bool

    var body: some View {
        @Bindable var vm = authViewModel

        ZStack {
            VStack(spacing: 32) {
                Spacer()
                
                // Header Section
                VStack(spacing: 24) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 35, style: .continuous)
                            .fill(Color.white)
                            .frame(width: 120, height: 120)
                            .shadow(color: Color.carolinaNavy.opacity(0.12), radius: 25, y: 12)
                        
                        Image(systemName: "building.columns.fill")
                            .font(.system(size: 60))
                            .foregroundStyle(Color.carolinaBlue)
                    }
                    
                    VStack(spacing: 8) {
                        Text("UNC Marketplace")
                            .font(.system(size: 38, weight: .bold, design: .rounded))
                            .foregroundStyle(Color.carolinaNavy)
                        
                        Text("Buy & sell with fellow Tar Heels")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Color.carolinaMuted)
                    }
                }

                // Form Section
                VStack(spacing: 28) {
                    VStack(alignment: .leading, spacing: 10) {
                        Text(vm.isSignUp ? "Create Account" : "Sign In")
                            .font(.title3.bold())
                            .foregroundStyle(Color.carolinaNavy)
                        
                        VStack(spacing: 16) {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("UNIVERSITY EMAIL")
                                    .font(.caption2.bold())
                                    .foregroundStyle(Color.carolinaMuted.opacity(0.8))
                                    .padding(.leading, 4)
                                
                                TextField("youremail@unc.edu", text: $vm.email)
                                    .padding()
                                    .background(Color.carolinaMist.opacity(0.6))
                                    .cornerRadius(16)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 16)
                                            .stroke(Color.carolinaStroke, lineWidth: 1)
                                    )
                                    .textInputAutocapitalization(.never)
                                    .keyboardType(.emailAddress)
                                    .autocorrectionDisabled()
                                    .focused($emailFocused)
                            }

                            VStack(alignment: .leading, spacing: 6) {
                                Text("PASSWORD")
                                    .font(.caption2.bold())
                                    .foregroundStyle(Color.carolinaMuted.opacity(0.8))
                                    .padding(.leading, 4)
                                
                                SecureField("••••••••", text: $vm.password)
                                    .padding()
                                    .background(Color.carolinaMist.opacity(0.6))
                                    .cornerRadius(16)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 16)
                                            .stroke(Color.carolinaStroke, lineWidth: 1)
                                    )
                            }
                        }
                    }

                    if let error = vm.errorMessage {
                        Text(error)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.red)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                            .transition(.opacity.combined(with: .move(edge: .top)))
                    }

                    VStack(spacing: 20) {
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
                            .padding(.vertical, 18)
                            .background(
                                vm.email.isValidUNCEmail && vm.password.count >= 6
                                    ? Color.carolinaBlue
                                    : Color.carolinaBlue.opacity(0.4),
                                in: RoundedRectangle(cornerRadius: 18)
                            )
                            .shadow(color: Color.carolinaBlue.opacity(0.3), radius: 12, y: 6)
                        }
                        .disabled(!vm.email.isValidUNCEmail || vm.password.count < 6 || vm.isLoading)

                        Button {
                            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                                vm.isSignUp.toggle()
                                vm.errorMessage = nil
                            }
                        } label: {
                            Text(vm.isSignUp ? "Already a member? Sign In" : "New to campus? Sign Up")
                                .font(.subheadline.weight(.bold))
                                .foregroundStyle(Color.carolinaBlue)
                        }
                    }
                }
                .padding(32)
                .brandPanel()
                .padding(.horizontal, 24)
                
                Text("Authorized domains: @unc.edu, @kenan-flagler.unc.edu, @business.unc.edu")
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(Color.carolinaMuted.opacity(0.5))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 50)
                
                Spacer()
                Spacer()
            }
        }
        .brandScreenBackground()
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { emailFocused = true }
    }
}
