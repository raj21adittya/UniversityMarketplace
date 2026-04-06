import SwiftUI

struct FilterSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Binding var filters: SearchFilters
    var onApply: () -> Void

    @State private var minPriceText = ""
    @State private var maxPriceText = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Category") {
                    Picker("Category", selection: $filters.category) {
                        Text("All Categories").tag(nil as ListingCategory?)
                        ForEach(ListingCategory.allCases) { cat in
                            Text(cat.displayName).tag(cat as ListingCategory?)
                        }
                    }
                    .pickerStyle(.menu)
                }

                Section("Condition") {
                    Picker("Condition", selection: $filters.condition) {
                        Text("Any Condition").tag(nil as ListingCondition?)
                        ForEach(ListingCondition.allCases) { cond in
                            Text(cond.displayName).tag(cond as ListingCondition?)
                        }
                    }
                    .pickerStyle(.menu)
                }

                Section("Price Range") {
                    HStack {
                        TextField("Min $", text: $minPriceText)
                            .keyboardType(.numberPad)
                            .textFieldStyle(.roundedBorder)
                        Text("to")
                            .foregroundStyle(.secondary)
                        TextField("Max $", text: $maxPriceText)
                            .keyboardType(.numberPad)
                            .textFieldStyle(.roundedBorder)
                    }
                }

                Section("Location") {
                    Picker("Location", selection: $filters.locationTag) {
                        Text("All Locations").tag(nil as LocationTag?)
                        ForEach(LocationTag.allCases) { loc in
                            Text(loc.displayName).tag(loc as LocationTag?)
                        }
                    }
                    .pickerStyle(.menu)
                }

                Section {
                    Button("Clear All Filters", role: .destructive) {
                        filters.clear()
                        minPriceText = ""
                        maxPriceText = ""
                    }
                }
            }
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Apply") {
                        filters.minPrice = Double(minPriceText)
                        filters.maxPrice = Double(maxPriceText)
                        onApply()
                        dismiss()
                    }
                    .bold()
                }
            }
            .onAppear {
                if let min = filters.minPrice { minPriceText = String(Int(min)) }
                if let max = filters.maxPrice { maxPriceText = String(Int(max)) }
            }
        }
    }
}
