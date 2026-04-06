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
    <div className="shell pb-28 pt-4 md:pt-24">
      <div className="panel rounded-[34px] p-5 md:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6C849A]">Sell on campus</p>
        <h1 className="font-display text-4xl text-[#16324F]">Create a polished listing</h1>
        <p className="mt-2 text-sm text-[#58708A]">
          Strong photos, a clean title, and a confident price help your listing feel trustworthy.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#16324F]">Photos (up to 5)</label>
          <div className="flex gap-2 flex-wrap">
            {previews.map((url, i) => (
              <div key={i} className="relative h-24 w-24 overflow-hidden rounded-[20px]">
                <Image src={url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-[20px] border-2 border-dashed border-[#BFD4E4] bg-white text-[#7A92A8] hover:border-[#4B9CD3] hover:text-[#4B9CD3]">
                <span className="text-2xl">+</span>
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
          <label className="mb-1 block text-sm font-semibold text-[#16324F]">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-2xl border border-[#D7E4F0] bg-white px-4 py-3 text-sm outline-none focus:border-[#4B9CD3] focus:ring-4 focus:ring-[#DCEBFA]"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-[#16324F]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-[#D7E4F0] bg-white px-4 py-3 text-sm outline-none focus:border-[#4B9CD3] focus:ring-4 focus:ring-[#DCEBFA]"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-[#16324F]">Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
            className="w-full rounded-2xl border border-[#D7E4F0] bg-white px-4 py-3 text-sm outline-none focus:border-[#4B9CD3] focus:ring-4 focus:ring-[#DCEBFA]"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#16324F]">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-[#D7E4F0] bg-white px-3 py-3 text-sm outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#16324F]">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full rounded-2xl border border-[#D7E4F0] bg-white px-3 py-3 text-sm outline-none"
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#16324F]">Location</label>
            <select
              value={locationTag}
              onChange={(e) => setLocationTag(e.target.value)}
              className="w-full rounded-2xl border border-[#D7E4F0] bg-white px-3 py-3 text-sm outline-none"
            >
              {LOCATIONS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full rounded-2xl bg-[#4B9CD3] py-3.5 text-white font-semibold shadow-[0_14px_28px_rgba(75,156,211,0.22)] hover:bg-[#3a8bc2] disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Post Listing"}
        </button>
      </form>
      </div>
    </div>
  );
}
