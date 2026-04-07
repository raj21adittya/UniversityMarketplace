"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, CATEGORIES, CONDITIONS, LOCATIONS, STORAGE_PATHS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { uploadImage } from "@/lib/cloudinary";
import Image from "next/image";

export default function SellPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceText, setPriceText] = useState("");
  const [category, setCategory] = useState("other");
  const [condition, setCondition] = useState("good");
  const [locationTag, setLocationTag] = useState("southCampus");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - images.length;
    const newFiles = files.slice(0, remaining);
    setImages([...images, ...newFiles]);
    setPreviews([...previews, ...newFiles.map((f) => URL.createObjectURL(f))]);
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || images.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const imageURLs: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const url = await uploadImage(
          images[i],
          `${STORAGE_PATHS.listingImages}/${profile.id}/${crypto.randomUUID()}_${i}.jpg`
        );
        imageURLs.push(url);
      }

      const id = crypto.randomUUID();
      await setDoc(doc(db, COLLECTIONS.listings, id), {
        id,
        sellerID: profile.id,
        title,
        description,
        price: parseFloat(priceText),
        category,
        condition,
        imageURLs,
        locationTag,
        isSold: false,
        isActive: true,
        bundleID: null,
        viewCount: 0,
        savedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        sellerName: profile.displayName,
        sellerImageURL: profile.profileImageURL ?? null,
        sellerRating: profile.averageRating,
      });

      await updateDoc(doc(db, COLLECTIONS.users, profile.id), {
        listingCount: increment(1),
      });

      router.push("/");
    } catch (e: unknown) {
      setError((e as Error).message);
    }
    setLoading(false);
  }

  const price = parseFloat(priceText) || 0;
  const isValid = title && description && price > 0 && images.length > 0;

  return (
    <div className="bg-white min-h-screen pt-12 md:pt-24 pb-28">
      <div className="shell">
        <div className="max-w-3xl mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6C849A] mb-3">Seller Studio</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#16324F] tracking-tight mb-4">
            Create a listing
          </h1>
          <p className="text-[#58708A] font-medium text-lg">
            High-quality photos and clear descriptions help your items sell faster.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-12 lg:grid-cols-[1fr_400px]">
          <div className="space-y-10">
            {/* Photo Section */}
            <div className="bg-[#F4F8FC] rounded-[2.5rem] p-8 border border-[#D7E4F0]/50">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#16324F] mb-6 block">
                Visuals (up to 5)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {previews.map((url, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm group">
                    <Image src={url} alt="" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-2 top-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#BFD4E4] bg-white text-[#4B9CD3] hover:border-[#4B9CD3] hover:bg-[#4B9CD3]/5 transition-all">
                    <span className="text-2xl font-light">+</span>
                    <span className="text-[9px] font-bold uppercase tracking-tighter">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#16324F]/60 ml-0.5">Item Title</label>
                <input
                  type="text"
                  placeholder="e.g. Minimalist Wooden Desk"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-b-2 border-[#D7E4F0] focus:border-[#4B9CD3] outline-none py-3 text-xl font-medium transition-all bg-transparent placeholder:text-[#D7E4F0]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#16324F]/60 ml-0.5">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={priceText}
                  onChange={(e) => setPriceText(e.target.value)}
                  className="w-full border-b-2 border-[#D7E4F0] focus:border-[#4B9CD3] outline-none py-3 text-xl font-medium transition-all bg-transparent placeholder:text-[#D7E4F0]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#16324F]/60 ml-0.5">Detailed Description</label>
                <textarea
                  placeholder="Tell buyers about the condition, dimensions, and details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full border-2 border-[#D7E4F0] focus:border-[#4B9CD3] rounded-2xl p-4 text-base transition-all bg-transparent placeholder:text-[#D7E4F0] outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sidebar Config */}
          <div className="space-y-6">
            <div className="bg-[#F4F8FC] rounded-[2rem] p-8 border border-[#D7E4F0]/50 sticky top-24">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#16324F] mb-6">Listing Settings</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#16324F]/50">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border-2 border-[#D7E4F0] rounded-xl px-4 py-3 text-sm text-[#16324F] outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#16324F]/50">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-white border-2 border-[#D7E4F0] rounded-xl px-4 py-3 text-sm text-[#16324F] outline-none"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#16324F]/50">Meeting Location</label>
                  <select
                    value={locationTag}
                    onChange={(e) => setLocationTag(e.target.value)}
                    className="w-full bg-white border-2 border-[#D7E4F0] rounded-xl px-4 py-3 text-sm text-[#16324F] outline-none"
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-bold mt-4">{error}</p>}

              <button
                type="submit"
                disabled={!isValid || loading}
                className="w-full mt-8 bg-[#16324F] hover:bg-[#1F4F7A] text-white font-bold py-4 rounded-full transition-all duration-300 disabled:opacity-50 text-sm tracking-wide shadow-lg shadow-[#16324F]/20"
              >
                {loading ? "Publishing..." : "Post Listing"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
