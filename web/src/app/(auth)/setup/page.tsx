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
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left: Setup Form */}
      <div className="w-full md:w-[45%] flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white z-10">
        <div className="max-w-sm w-full">
          <div className="mb-10">
            <h1 className="text-4xl font-display font-bold text-[#16324F] tracking-tight mb-3">
              Complete your profile
            </h1>
            <p className="text-[#58708A] font-medium">
              Just a few more details to get you started in the marketplace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-4 py-2">
              <label className="relative cursor-pointer group">
                <div className="w-24 h-24 rounded-full bg-[#F4F8FC] border-2 border-dashed border-[#D7E4F0] flex items-center justify-center overflow-hidden transition-all group-hover:border-[#4B9CD3] group-hover:bg-[#4B9CD3]/5">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-[#4B9CD3]">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-[9px] font-bold uppercase tracking-widest">Add Photo</span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-[#16324F] text-white p-1.5 rounded-full shadow-lg border-2 border-white scale-90 group-hover:scale-100 transition-transform">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#16324F]/60 ml-0.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Priya Mehta"
                  className="w-full border-b-2 border-[#D7E4F0] focus:border-[#4B9CD3] outline-none py-2 text-base transition-all bg-transparent placeholder:text-[#D7E4F0]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#16324F]/60 ml-0.5">
                  Graduation Year
                </label>
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  className="w-full border-b-2 border-[#D7E4F0] focus:border-[#4B9CD3] outline-none py-2 text-base transition-all bg-transparent cursor-pointer appearance-none"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>Class of {y}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#16324F]/60 ml-0.5">
                  Housing / Location
                </label>
                <input
                  type="text"
                  value={housingArea}
                  onChange={(e) => setHousingArea(e.target.value)}
                  placeholder="e.g. Granville Towers"
                  className="w-full border-b-2 border-[#D7E4F0] focus:border-[#4B9CD3] outline-none py-2 text-base transition-all bg-transparent placeholder:text-[#D7E4F0]"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !displayName || !housingArea}
              className="w-full bg-[#16324F] hover:bg-[#1F4F7A] text-white font-bold py-4 rounded-full transition-all duration-300 active:scale-[0.98] disabled:opacity-50 mt-4 text-sm tracking-wide"
            >
              {loading ? "Saving Profile..." : "Complete Setup"}
            </button>
          </form>
        </div>
      </div>

      {/* Right: Lifestyle Imagery */}
      <div className="hidden md:block w-[55%] relative bg-[#F4F8FC]">
        <img 
          src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200" 
          alt="Minimalist Workspace" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#16324F]/40 via-transparent to-transparent"></div>
        <div className="absolute bottom-16 left-16 right-16 text-white">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] max-w-lg">
            <h2 className="text-3xl font-display font-bold mb-4 leading-tight">
              Ready to find your next favorite item?
            </h2>
            <p className="text-white/80 font-medium leading-relaxed">
              Complete your profile to start messaging sellers and posting your own listings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
