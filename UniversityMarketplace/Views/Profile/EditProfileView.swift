import SwiftUI

struct EditProfileView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var displayName = ""
    @State private var graduationYear = Calendar.current.component(.year, from: Date())
    @State private var housingArea = ""
    @State private var latitude: Double?
    @State private var longitude: Double?
    @State private var profileImage: UIImage?
    @State private var showImagePicker = false
    @State private var showLocationSearch = false
    @State private var isLoading = false
    @State private var errorMessage: String?

    private let yearRange: [Int] = {
        let current = Calendar.current.component(.year, from: Date())
        return Array((current)...(current + 5))
    }()

    var body: some View {
        Form {
            Section {
                HStack {
                    Spacer()
                    Button { showImagePicker = true } label: {
                        if let image = profileImage {
                            Image(uiImage: image)
                                .resizable()
                                .scaledToFill()
                                .frame(width: 80, height: 80)
                                .clipShape(Circle())
                        } else if let url = authViewModel.currentUserProfile?.profileImageURL {
                            CachedImageView(url: url, size: 80)
                                .clipShape(Circle())
                        } else {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 80))
                                .foregroundStyle(Color.carolinaBlue)
                        }
                    }
                    Spacer()
                }
            }
            .listRowBackground(Color.clear)

            Section("Personal Info") {
                TextField("Full Name", text: $displayName)

                Picker("Graduation Year", selection: $graduationYear) {
                    ForEach(yearRange, id: \.self) { year in
                        Text(String(year)).tag(year)
                    }
                }
            }

            Section("Location") {
                Button { showLocationSearch = true } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Housing / Apartment")
                                .font(.subheadline)
                                .foregroundStyle(.primary)
                            Text(housingArea.isEmpty ? "Tap to search..." : housingArea)
                                .font(.caption)
                                .foregroundStyle(housingArea.isEmpty ? .secondary : Color.carolinaBlue)
                                .lineLimit(2)
                        }
                        Spacer()
                        Image(systemName: "mappin.circle.fill")
                            .foregroundStyle(housingArea.isEmpty ? .secondary : Color.carolinaBlue)
                    }
                }
            }

            if let error = errorMessage {
                Section {
                    Text(error).foregroundStyle(.red).font(.caption)
                }
            }

            Section {
                Button("Save Changes") {
                    Task { await saveProfile() }
                }
                .disabled(displayName.isEmpty || housingArea.isEmpty || isLoading)
                .frame(maxWidth: .infinity)
            }
        }
        .navigationTitle("Edit Profile")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showImagePicker) {
            SingleImagePicker(selectedImage: $profileImage)
        }
        .sheet(isPresented: $showLocationSearch) {
            LocationSearchView(
                selectedAddress: $housingArea,
                selectedLatitude: $latitude,
                selectedLongitude: $longitude
            )
        }
        .overlay {
            if isLoading {
                LoadingOverlay(message: "Saving...")
            }
        }
        .onAppear {
            if let user = authViewModel.currentUserProfile {
                displayName = user.displayName
                graduationYear = user.graduationYear
                housingArea = user.housingArea
                latitude = user.latitude
                longitude = user.longitude
            }
        }
    }

    private func saveProfile() async {
        isLoading = true
        let imageData = profileImage.flatMap { ImageCompressor.compress($0) }
        await authViewModel.completeProfile(
            displayName: displayName,
            graduationYear: graduationYear,
            housingArea: housingArea,
            latitude: latitude,
            longitude: longitude,
            profileImage: imageData
        )
        isLoading = false
        if authViewModel.errorMessage == nil {
            dismiss()
        } else {
            errorMessage = authViewModel.errorMessage
        }
    }
}
