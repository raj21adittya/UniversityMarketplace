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
                VStack(alignment: .leading, spacing: 10) {
                    Text("SELL ON CAMPUS")
                        .font(.system(.caption, design: .rounded).weight(.bold))
                        .tracking(2.2)
                        .foregroundStyle(Color.carolinaMuted)

                    Text("Create a polished listing")
                        .font(.system(.largeTitle, design: .serif).weight(.semibold))
                        .foregroundStyle(Color.carolinaInk)

                    Text("Bring over the same clean, trustworthy marketplace feel with strong photos and clear details.")
                        .font(.subheadline)
                        .foregroundStyle(Color.carolinaMuted)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(20)
                .brandPanel(radius: 28)

                VStack(alignment: .leading, spacing: 8) {
                    Text("Photos")
                        .font(.headline)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            if viewModel.selectedImages.count < AppConstants.maxListingImages {
                                Button { showImagePicker = true } label: {
                                    RoundedRectangle(cornerRadius: 10)
                                        .fill(Color.white)
                                        .frame(width: 100, height: 100)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 10)
                                                .stroke(Color.carolinaStroke, style: StrokeStyle(lineWidth: 1.2, dash: [5]))
                                        )
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
                .padding(18)
                .brandPanel(radius: 24)

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
                .padding(18)
                .brandPanel(radius: 24)

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
                .padding(18)
                .brandPanel(radius: 24)

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
                .padding(18)
                .brandPanel(radius: 24)

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
                        in: RoundedRectangle(cornerRadius: 18, style: .continuous)
                    )
                }
                .disabled(!viewModel.isFormValid || viewModel.isUploading)
            }
            .padding(20)
            .padding(.bottom, 28)
        }
        .brandScreenBackground()
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
