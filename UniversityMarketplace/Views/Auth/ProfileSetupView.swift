import SwiftUI

struct ProfileSetupView: View {
    @Environment(AuthViewModel.self) private var authViewModel

    @State private var displayName = ""
    @State private var graduationYear = Calendar.current.component(.year, from: Date())
    @State private var housingArea = ""
    @State private var latitude: Double?
    @State private var longitude: Double?
    @State private var profileImage: UIImage?
    @State private var showImagePicker = false
    @State private var showLocationSearch = false

    private let yearRange: [Int] = {
        let current = Calendar.current.component(.year, from: Date())
        return Array((current)...(current + 5))
    }()

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Text("Complete Your Profile")
                    .font(.title2.bold())
                    .padding(.top, 20)

                // Profile Photo
                Button { showImagePicker = true } label: {
                    if let image = profileImage {
                        Image(uiImage: image)
                            .resizable()
                            .scaledToFill()
                            .frame(width: 100, height: 100)
                            .clipShape(Circle())
                    } else {
                        Circle()
                            .fill(Color.carolinaBlue.opacity(0.15))
                            .frame(width: 100, height: 100)
                            .overlay {
                                VStack(spacing: 4) {
                                    Image(systemName: "camera.fill")
                                        .font(.title2)
                                    Text("Photo")
                                        .font(.caption2)
                                }
                                .foregroundStyle(Color.carolinaBlue)
                            }
                    }
                }

                VStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Full Name")
                            .font(.subheadline.bold())
                        TextField("e.g. Priya Mehta", text: $displayName)
                            .textFieldStyle(.roundedBorder)
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Graduation Year")
                            .font(.subheadline.bold())
                        Picker("Year", selection: $graduationYear) {
                            ForEach(yearRange, id: \.self) { year in
                                Text(String(year)).tag(year)
                            }
                        }
                        .pickerStyle(.segmented)
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Location")
                            .font(.subheadline.bold())

                        Button { showLocationSearch = true } label: {
                            HStack {
                                Image(systemName: housingArea.isEmpty ? "mappin.circle" : "mappin.circle.fill")
                                    .foregroundStyle(housingArea.isEmpty ? .secondary : Color.carolinaBlue)
                                Text(housingArea.isEmpty ? "Search your apartment or building..." : housingArea)
                                    .foregroundStyle(housingArea.isEmpty ? .secondary : .primary)
                                    .lineLimit(1)
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.caption)
                                    .foregroundStyle(.tertiary)
                            }
                            .padding(12)
                            .background(Color(.systemBackground))
                            .cornerRadius(8)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color(.separator), lineWidth: 0.5)
                            )
                        }
                    }
                }
                .padding(.horizontal, 24)

                if let error = authViewModel.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                }

                Button {
                    Task {
                        let imageData = profileImage.flatMap { ImageCompressor.compress($0) }
                        await authViewModel.completeProfile(
                            displayName: displayName,
                            graduationYear: graduationYear,
                            housingArea: housingArea,
                            latitude: latitude,
                            longitude: longitude,
                            profileImage: imageData
                        )
                    }
                } label: {
                    Group {
                        if authViewModel.isLoading {
                            ProgressView().tint(.white)
                        } else {
                            Text("Complete Setup")
                        }
                    }
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(
                        isFormValid ? Color.carolinaBlue : Color.gray.opacity(0.4),
                        in: RoundedRectangle(cornerRadius: 14)
                    )
                }
                .disabled(!isFormValid || authViewModel.isLoading)
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
        .background(Color.backgroundPrimary)
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
    }

    private var isFormValid: Bool {
        displayName.isNotEmpty && housingArea.isNotEmpty
    }
}
