import SwiftUI
import MapKit

struct LocationSearchView: View {
    @Environment(\.dismiss) private var dismiss
    @Binding var selectedAddress: String
    @Binding var selectedLatitude: Double?
    @Binding var selectedLongitude: Double?

    @State private var searchText = ""
    @State private var searchResults: [MKLocalSearchCompletion] = []
    @State private var mapPosition: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 35.9049, longitude: -79.0469),
            span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
        )
    )
    @State private var pinLocation: CLLocationCoordinate2D?
    @State private var confirmedAddress = ""
    @State private var isResolving = false
    @State private var completerWrapper = CompleterWrapper()

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(.secondary)
                    TextField("Search apartment, building, address...", text: $searchText)
                        .textInputAutocapitalization(.words)
                        .autocorrectionDisabled()
                        .onChange(of: searchText) {
                            completerWrapper.search(query: searchText)
                        }
                    if !searchText.isEmpty {
                        Button {
                            searchText = ""
                            searchResults = []
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .padding(12)
                .background(Color(.systemGray6), in: RoundedRectangle(cornerRadius: 10))
                .padding(.horizontal)
                .padding(.top, 8)

                if !searchResults.isEmpty && confirmedAddress.isEmpty {
                    List(searchResults, id: \.self) { result in
                        Button {
                            selectResult(result)
                        } label: {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(result.title)
                                    .font(.subheadline.bold())
                                    .foregroundStyle(.primary)
                                if !result.subtitle.isEmpty {
                                    Text(result.subtitle)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                    .listStyle(.plain)
                } else {
                    Map(position: $mapPosition, interactionModes: [.pan, .zoom]) {
                        if let pin = pinLocation {
                            Marker(confirmedAddress.isEmpty ? "Location" : confirmedAddress,
                                   systemImage: "building.2.fill",
                                   coordinate: pin)
                                .tint(Color.carolinaBlue)
                        }
                    }
                    .overlay(alignment: .bottom) {
                        if !confirmedAddress.isEmpty {
                            VStack(spacing: 12) {
                                HStack(spacing: 12) {
                                    Image(systemName: "mappin.circle.fill")
                                        .font(.title2)
                                        .foregroundStyle(Color.carolinaBlue)

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(confirmedAddress)
                                            .font(.subheadline.bold())
                                            .lineLimit(2)
                                    }

                                    Spacer()

                                    Button {
                                        confirmedAddress = ""
                                        pinLocation = nil
                                        searchText = ""
                                    } label: {
                                        Image(systemName: "xmark.circle.fill")
                                            .foregroundStyle(.secondary)
                                    }
                                }
                                .padding()
                                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 14))

                                Button {
                                    selectedAddress = confirmedAddress
                                    selectedLatitude = pinLocation?.latitude
                                    selectedLongitude = pinLocation?.longitude
                                    dismiss()
                                } label: {
                                    Text("Confirm Location")
                                        .font(.headline)
                                        .foregroundStyle(.white)
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color.carolinaBlue, in: RoundedRectangle(cornerRadius: 14))
                                }
                            }
                            .padding()
                        }
                    }

                    if isResolving {
                        ProgressView("Finding location...")
                            .padding()
                    }
                }
            }
            .navigationTitle("Select Location")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .onAppear {
                completerWrapper.onResultsChanged = { results in
                    searchResults = results
                }
            }
        }
    }

    private func selectResult(_ result: MKLocalSearchCompletion) {
        searchText = result.title
        searchResults = []
        isResolving = true

        let request = MKLocalSearch.Request(completion: result)
        let search = MKLocalSearch(request: request)

        search.start { response, error in
            isResolving = false
            guard let mapItem = response?.mapItems.first else { return }
            let coordinate = mapItem.placemark.coordinate

            pinLocation = coordinate
            confirmedAddress = [result.title, result.subtitle]
                .filter { !$0.isEmpty }
                .joined(separator: ", ")

            mapPosition = .region(
                MKCoordinateRegion(
                    center: coordinate,
                    span: MKCoordinateSpan(latitudeDelta: 0.005, longitudeDelta: 0.005)
                )
            )
        }
    }
}

// MARK: - Completer Wrapper (nonisolated for MKLocalSearchCompleterDelegate)

@MainActor
@Observable
final class CompleterWrapper {
    var onResultsChanged: (([MKLocalSearchCompletion]) -> Void)?
    private let delegate = CompleterDelegate()
    private let completer = MKLocalSearchCompleter()

    init() {
        completer.delegate = delegate
        completer.resultTypes = [.address, .pointOfInterest]
        completer.region = MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 35.9049, longitude: -79.0469),
            span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
        )

        delegate.onResults = { [weak self] results in
            Task { @MainActor in
                self?.onResultsChanged?(results)
            }
        }
    }

    func search(query: String) {
        completer.queryFragment = query
    }
}

final class CompleterDelegate: NSObject, MKLocalSearchCompleterDelegate, @unchecked Sendable {
    var onResults: (([MKLocalSearchCompletion]) -> Void)?

    func completerDidUpdateResults(_ completer: MKLocalSearchCompleter) {
        let results = completer.results
        onResults?(results)
    }

    func completer(_ completer: MKLocalSearchCompleter, didFailWithError error: Error) {}
}
