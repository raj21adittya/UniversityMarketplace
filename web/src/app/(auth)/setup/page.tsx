"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { uploadImage } from "@/lib/cloudinary";
import { STORAGE_PATHS } from "@/lib/constants";
import Image from "next/image";

export default function SetupPage() {
  const { user, completeProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [graduationYear, setGraduationYear] = useState(new Date().getFullYear());
  const [housingArea, setHousingArea] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName || !housingArea) return;
    setLoading(true);
    setError(null);

    try {
      let profileImageURL: string | undefined;
      if (imageFile && user) {
        profileImageURL = await uploadImage(
          imageFile,
          `${STORAGE_PATHS.profileImages}/${user.uid}.jpg`
        );
      }

      await completeProfile({
        displayName,
        graduationYear,
        housingArea,
        profileImageURL,
      });
    } catch (e: unknown) {
      setError((e as Error).message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5 md:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-center mb-6">Complete Your Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo */}
          <div className="flex justify-center">
            <label className="cursor-pointer">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#4B9CD3]/10 flex items-center justify-center">
                  <span className="text-[#4B9CD3] text-sm font-medium">Add Photo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Priya Mehta"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Graduation Year</label>
            <select
              value={graduationYear}
              onChange={(e) => setGraduationYear(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Housing / Location</label>
            <input
              type="text"
              value={housingArea}
              onChange={(e) => setHousingArea(e.target.value)}
              placeholder="e.g. Granville Towers, Off Franklin St"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !displayName || !housingArea}
            className="w-full bg-[#4B9CD3] text-white font-semibold py-3 rounded-lg hover:bg-[#3a8bc2] transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
