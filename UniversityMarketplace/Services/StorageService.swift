import Foundation
import UIKit

// MARK: - Cloudinary-backed Storage Service (free, no Blaze plan needed)

final class StorageService {
    // TODO: Replace with your Cloudinary credentials
    private let cloudName = "dpgu3fuyh"
    private let uploadPreset = "university_marketplace"

    private var uploadURL: URL {
        URL(string: "https://api.cloudinary.com/v1_1/\(cloudName)/image/upload")!
    }

    func uploadImage(_ image: UIImage, path: String) async throws -> String {
        guard let data = ImageCompressor.compress(image) else {
            throw StorageError.compressionFailed
        }

        print("[Storage] Uploading \(data.count) bytes via Cloudinary (path: \(path))")

        // Build multipart form data
        let boundary = UUID().uuidString
        var request = URLRequest(url: uploadURL)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()

        // Upload preset (required for unsigned uploads)
        body.appendMultipart(name: "upload_preset", value: uploadPreset, boundary: boundary)

        // Use path as the public_id so files are organized like before
        let publicID = path
            .replacingOccurrences(of: ".jpg", with: "")
            .replacingOccurrences(of: ".jpeg", with: "")
        body.appendMultipart(name: "public_id", value: publicID, boundary: boundary)

        // The image file
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"image.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(data)
        body.append("\r\n".data(using: .utf8)!)

        // Close boundary
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        let (responseData, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw StorageError.uploadFailed
        }

        guard httpResponse.statusCode == 200 else {
            let errorBody = String(data: responseData, encoding: .utf8) ?? "Unknown error"
            print("[Storage] Upload FAILED (\(httpResponse.statusCode)): \(errorBody)")
            throw StorageError.uploadFailed
        }

        // Parse the JSON response to get secure_url
        let json = try JSONSerialization.jsonObject(with: responseData) as? [String: Any]
        guard let secureURL = json?["secure_url"] as? String else {
            print("[Storage] No secure_url in response")
            throw StorageError.downloadURLFailed
        }

        print("[Storage] Upload OK: \(secureURL)")
        return secureURL
    }

    func uploadImages(_ images: [UIImage], basePath: String) async throws -> [String] {
        var urls: [String] = []
        for (index, image) in images.enumerated() {
            let path = "\(basePath)/\(UUID().uuidString)_\(index).jpg"
            let url = try await uploadImage(image, path: path)
            urls.append(url)
        }
        return urls
    }

    func deleteImage(at url: String) async throws {
        // Cloudinary deletion requires signed API calls or admin API
        // For now, skip deletion — images will be managed via Cloudinary dashboard
        print("[Storage] Delete skipped (manage via Cloudinary dashboard): \(url)")
    }
}

// MARK: - Multipart Helper

private extension Data {
    mutating func appendMultipart(name: String, value: String, boundary: String) {
        append("--\(boundary)\r\n".data(using: .utf8)!)
        append("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n".data(using: .utf8)!)
        append("\(value)\r\n".data(using: .utf8)!)
    }
}

// MARK: - Errors

enum StorageError: LocalizedError {
    case compressionFailed
    case uploadFailed
    case downloadURLFailed

    var errorDescription: String? {
        switch self {
        case .compressionFailed: "Failed to compress image"
        case .uploadFailed: "Failed to upload image"
        case .downloadURLFailed: "Failed to get download URL"
        }
    }
}
