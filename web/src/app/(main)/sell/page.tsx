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
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 md:pt-18">
      <h1 className="text-2xl font-bold text-[#13294B] mb-4">Create Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photos */}
        <div>
          <label className="block text-sm font-medium mb-2">Photos (up to 5)</label>
          <div className="flex gap-2 flex-wrap">
            {previews.map((url, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden">
                <Image src={url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#4B9CD3] transition-colors">
                <span className="text-2xl text-gray-400">+</span>
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

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9CD3]"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <select
              value={locationTag}
              onChange={(e) => setLocationTag(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
            >
              {LOCATIONS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full bg-[#4B9CD3] text-white font-semibold py-3 rounded-xl hover:bg-[#3a8bc2] transition-colors disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Post Listing"}
        </button>
      </form>
    </div>
  );
}
