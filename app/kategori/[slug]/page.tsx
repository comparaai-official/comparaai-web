"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [brand, setBrand] = useState("");
  const [segment, setSegment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const categories = await getCategories();
      const found = categories.find((c: any) => c.slug === slug);
      setCategory(found);

      if (found) {
        const data = await getProducts({ categoryId: found.id });
        setAllProducts(data);
        setProducts(data);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  function getSegmentPriceRange(segmentValue: string) {
    const prices = allProducts.map((p: any) => p.price);
    if (prices.length === 0) return {};
    const sorted = [...prices].sort((a, b) => a - b);
    const third = Math.ceil(sorted.length / 3);
    if (segmentValue === "ekonomik") {
      return { maxPrice: String(sorted[Math.min(third - 1, sorted.length - 1)]) };
    }
    if (segmentValue === "orta") {
      return {
        minPrice: String(sorted[Math.max(third - 1, 0)]),
        maxPrice: String(sorted[Math.min(third * 2 - 1, sorted.length - 1)]),
      };
    }
    if (segmentValue === "ust") {
      return { minPrice: String(sorted[Math.max(third * 2 - 1, 0)]) };
    }
    return {};
  }

  async function applyFilters() {
    if (!category) return;
    const data = await getProducts({
      categoryId: category.id,
      brand: brand || undefined,
      ...getSegmentPriceRange(segment),
    });
    setProducts(data);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050810] text-white p-8">
        Yukleniyor...
      </main>
    );
  }

  if (!category) {
    return (
      <main className="min-h-screen bg-[#050810] text-white p-8">
        Kategori bulunamadi.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050810] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-400 text-sm">
          &larr; Ana sayfaya don
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-6">{category.name}</h1>

        <div className="flex flex-wrap gap-3 mb-8 bg-slate-900/60 p-4 rounded-xl border border-blue-500/20">
          <input
            placeholder="Marka"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="bg-slate-800 text-white px-3 py-2 rounded border border-blue-500/20 text-sm"
          />
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className="bg-slate-800 text-white px-3 py-2 rounded border border-blue-500/20 text-sm"
          >
            <option value="">Tüm segmentler</option>
            <option value="ekonomik">Ekonomik</option>
            <option value="orta">Orta segment</option>
            <option value="ust">Üst segment</option>
          </select>
          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm"
          >
            Filtrele
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p: any) => (
            <Link
              key={p.id}
              href={`/urun/${p.id}`}
              className="bg-slate-900/60 border border-blue-500/20 rounded-xl p-4 hover:border-blue-400 transition"
            >
              <h2 className="font-semibold text-lg">{p.name}</h2>
              <p className="text-slate-400 text-sm">{p.brand}</p>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-slate-500 mt-8">Bu kriterlere uygun urun bulunamadi.</p>
        )}
      </div>
    </main>
  );
}
