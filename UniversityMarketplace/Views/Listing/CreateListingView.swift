import SwiftUI

struct CreateListingView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel = CreateListingViewModel()
    @State private var showImagePicker = false

    var body: some View {
        @Bindable var vm = viewModel

        ScrollView {
            VStack(spacing: 20) {
                // Photo Section
                VStack(alignment: .leading, spacing: 8) {
                    Text("Photos")
                        .font(.headline)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            if viewModel.selectedImages.count < AppConstants.maxListingImages {
                                Button { showImagePicker = true } label: {
                                    RoundedRectangle(cornerRadius: 10)
                                        .fill(Color(.systemGray6))
                                        .frame(width: 100, height: 100)
                                        .overlay {
                                            VStack(spacing: 4) {
                                                Image(systemName: "plus.circle.fill")
                                                    .font(.title2)
                                                Text("Add")
                                                    .font(.caption)
                                            }
                                            .foregroundStyle(Color.carolinaBlue)
                                        }
                                }
                            }

                            ForEach(Array(viewModel.selectedImages.enumerated()), id: \.offset) { index, image in
                                Image(uiImage: image)
                                    .resizable()
                                    .scaledToFill()
                                    .frame(width: 100, height: 100)
                                    .clipShape(RoundedRectangle(cornerRadius: 10))
                                    .overlay(alignment: .topTrailing) {
                                        Button {
                                            viewModel.removeImage(at: index)
                                        } label: {
                                            Image(systemName: "xmark.circle.fill")
                                                .foregroundStyle(.white, .red)
                                        }
                                        .padding(4)
                                    }
                            }
                        }
                    }
                }

                // Details Section
                VStack(alignment: .leading, spacing: 12) {
                    Text("Details")
                        .font(.headline)

                    TextField("Title", text: $vm.title)
                        .textFieldStyle(.roundedBorder)

                    TextField("Description", text: $vm.description, axis: .vertical)
                        .textFieldStyle(.roundedBorder)
                        .lineLimit(3...6)

                    TextField("Price ($)", text: $vm.priceText)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.decimalPad)
                }

                // Category & Condition
                VStack(alignment: .leading, spacing: 12) {
                    Text("Category & Condition")
                        .font(.headline)

                    Picker("Category", selection: $vm.category) {
                        ForEach(ListingCategory.allCases) { cat in
                            Text(cat.displayName).tag(cat)
                        }
                    }
                    .pickerStyle(.menu)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(10)
                    .background(Color(.systemBackground))
                    .cornerRadius(8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color(.separator), lineWidth: 0.5)
                    )

                    Picker("Condition", selection: $vm.condition) {
                        ForEach(ListingCondition.allCases) { cond in
                            Text(cond.displayName).tag(cond)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                // Location
                VStack(alignment: .leading, spacing: 12) {
                    Text("Location")
                        .font(.headline)

                    Picker("Location", selection: $vm.locationTag) {
                        ForEach(LocationTag.allCases) { loc in
                            Text(loc.displayName).tag(loc)
                        }
                    }
                    .pickerStyle(.menu)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(10)
                    .background(Color(.systemBackground))
                    .cornerRadius(8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color(.separator), lineWidth: 0.5)
                    )
                }

                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                }

                // Submit
                Button {
                    guard let uid = authViewModel.currentUserProfile?.id else { return }
                    Task { await viewModel.createListing(sellerID: uid) }
                } label: {
                    Group {
                        if viewModel.isUploading {
                            ProgressView().tint(.white)
                        } else {
                            Text("Post Listing")
                        }
                    }
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(
                        viewModel.isFormValid ? Color.carolinaBlue : Color.gray.opacity(0.4),
                        in: RoundedRectangle(cornerRadius: 14)
                    )
                }
                .disabled(!viewModel.isFormValid || viewModel.isUploading)
            }
            .padding()
        }
        .background(Color.backgroundPrimary)
        .navigationTitle("Create Listing")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }
            }
        }
        .sheet(isPresented: $showImagePicker) {
            ImagePicker(
                selectedImages: $vm.selectedImages,
                maxSelection: AppConstants.maxListingImages - viewModel.selectedImages.count
            )
        }
        .onChange(of: viewModel.didCreateSuccessfully) {
            if viewModel.didCreateSuccessfully { dismiss() }
        }
    }
}
