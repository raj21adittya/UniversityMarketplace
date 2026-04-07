import SwiftUI

struct CreateListingView: View {
    @Environment(AuthViewModel.self) private var authViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel = CreateListingViewModel()
    @State private var showImagePicker = false

    var body: some View {
        @Bindable var vm = viewModel

        ZStack {
            BrandBackground()
            
            ScrollView {
                VStack(spacing: 24) {
                    // Header Section
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Seller Studio")
                            .font(.system(size: 9, weight: .bold))
                            .textCase(.uppercase)
                            .tracking(1.2)
                            .foregroundStyle(Color.carolinaMuted)
                        
                        Text("Create a listing")
                            .font(.system(size: 28, weight: .bold, design: .rounded))
                            .foregroundStyle(Color.carolinaNavy)
                        
                        Text("High-quality photos help your items sell faster.")
                            .font(.caption.weight(.medium))
                            .foregroundStyle(Color.carolinaMuted)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 24)
                    .padding(.top, 12)

                    // Photo Section
                    VStack(alignment: .leading, spacing: 12) {
                        Text("VISUALS (UP TO 5)")
                            .font(.system(size: 8, weight: .bold))
                            .tracking(1)
                            .foregroundStyle(Color.carolinaMuted)
                        
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 10) {
                                if viewModel.selectedImages.count < AppConstants.maxListingImages {
                                    Button { showImagePicker = true } label: {
                                        RoundedRectangle(cornerRadius: 16)
                                            .fill(Color.white)
                                            .frame(width: 90, height: 90)
                                            .overlay(
                                                RoundedRectangle(cornerRadius: 16)
                                                    .stroke(Color.carolinaStroke, style: StrokeStyle(lineWidth: 1.2, dash: [5]))
                                            )
                                            .overlay {
                                                VStack(spacing: 4) {
                                                    Image(systemName: "camera.fill")
                                                        .font(.subheadline)
                                                    Text("Upload")
                                                        .font(.system(size: 8, weight: .bold))
                                                        .textCase(.uppercase)
                                                }
                                                .foregroundStyle(Color.carolinaBlue)
                                            }
                                    }
                                }

                                ForEach(Array(viewModel.selectedImages.enumerated()), id: \.offset) { index, image in
                                    Image(uiImage: image)
                                        .resizable()
                                        .scaledToFill()
                                        .frame(width: 90, height: 90)
                                        .clipShape(RoundedRectangle(cornerRadius: 16))
                                        .overlay(alignment: .topTrailing) {
                                            Button {
                                                viewModel.removeImage(at: index)
                                            } label: {
                                                Image(systemName: "xmark.circle.fill")
                                                    .foregroundStyle(.white, Color.red)
                                            }
                                            .padding(4)
                                        }
                                }
                            }
                        }
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .brandPanel(radius: 28)
                    .padding(.horizontal, 20)

                    // Info Section
                    VStack(spacing: 20) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("ITEM TITLE")
                                .font(.system(size: 8, weight: .bold))
                                .tracking(1)
                                .foregroundStyle(Color.carolinaMuted)
                            
                            TextField("e.g. Minimalist Wooden Desk", text: $vm.title)
                                .font(.system(size: 15, weight: .semibold))
                                .padding(.vertical, 8)
                                .overlay(Rectangle().fill(Color.carolinaStroke).frame(height: 1), alignment: .bottom)
                        }

                        VStack(alignment: .leading, spacing: 6) {
                            Text("PRICE ($)")
                                .font(.system(size: 8, weight: .bold))
                                .tracking(1)
                                .foregroundStyle(Color.carolinaMuted)
                            
                            TextField("0.00", text: $vm.priceText)
                                .font(.system(size: 15, weight: .semibold))
                                .keyboardType(.decimalPad)
                                .padding(.vertical, 8)
                                .overlay(Rectangle().fill(Color.carolinaStroke).frame(height: 1), alignment: .bottom)
                        }

                        VStack(alignment: .leading, spacing: 6) {
                            Text("DESCRIPTION")
                                .font(.system(size: 8, weight: .bold))
                                .tracking(1)
                                .foregroundStyle(Color.carolinaMuted)
                            
                            TextField("Tell buyers about details...", text: $vm.description, axis: .vertical)
                                .font(.system(size: 14, weight: .medium))
                                .lineLimit(3...5)
                                .padding(12)
                                .background(Color.carolinaMist.opacity(0.5), in: RoundedRectangle(cornerRadius: 12))
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.carolinaStroke, lineWidth: 0.5))
                        }
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .brandPanel(radius: 28)
                    .padding(.horizontal, 20)

                    // Settings Section
                    VStack(spacing: 16) {
                        HStack(spacing: 12) {
                            Text("CATEGORY")
                                .font(.system(size: 8, weight: .bold))
                                .tracking(1)
                                .foregroundStyle(Color.carolinaMuted)
                            Spacer()
                            Picker("Category", selection: $vm.category) {
                                ForEach(ListingCategory.allCases) { cat in
                                    Text(cat.displayName).tag(cat).font(.caption)
                                }
                            }
                            .pickerStyle(.menu)
                            .labelsHidden()
                        }
                        
                        Divider().opacity(0.3)

                        HStack(spacing: 12) {
                            Text("CONDITION")
                                .font(.system(size: 8, weight: .bold))
                                .tracking(1)
                                .foregroundStyle(Color.carolinaMuted)
                            Spacer()
                            Picker("Condition", selection: $vm.condition) {
                                ForEach(ListingCondition.allCases) { cond in
                                    Text(cond.displayName).tag(cond).font(.caption)
                                }
                            }
                            .pickerStyle(.menu)
                            .labelsHidden()
                        }
                        
                        Divider().opacity(0.3)

                        HStack(spacing: 12) {
                            Text("LOCATION")
                                .font(.system(size: 8, weight: .bold))
                                .tracking(1)
                                .foregroundStyle(Color.carolinaMuted)
                            Spacer()
                            Picker("Location", selection: $vm.locationTag) {
                                ForEach(LocationTag.allCases) { loc in
                                    Text(loc.displayName).tag(loc).font(.caption)
                                }
                            }
                            .pickerStyle(.menu)
                            .labelsHidden()
                        }
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .brandPanel(radius: 28)
                    .padding(.horizontal, 20)

                    if let error = viewModel.errorMessage {
                        Text(error)
                            .font(.caption.bold())
                            .foregroundStyle(.red)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
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
                                Text("Publish Listing")
                            }
                        }
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(
                            viewModel.isFormValid ? Color.carolinaNavy : Color.carolinaNavy.opacity(0.4),
                            in: RoundedRectangle(cornerRadius: 20)
                        )
                        .shadow(color: Color.carolinaNavy.opacity(viewModel.isFormValid ? 0.15 : 0), radius: 10, y: 5)
                    }
                    .disabled(!viewModel.isFormValid || viewModel.isUploading)
                    .padding(.horizontal, 24)
                    .padding(.bottom, 40)
                }
            }
        }
        .navigationTitle("Create Listing")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }
                    .foregroundStyle(Color.carolinaNavy)
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
