"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api";

export default function ComparePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (categoryId) {
      getProducts({ categoryId }).then(setProducts);
      setSelectedIds([]);
      setResult("");
    }
  }, [categoryId]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  async function handleCompare() {
    const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
    setLoading(true);
    setResult("");

    const res = await fetch("http://localhost:8000/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products: selectedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          specs: p.specs,
        })),
      }),
    });

    const data = await res.json();
    setResult(data.comparison || data.error);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#050810] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-400 text-sm">
          &larr; Ana sayfaya don
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Urun Karsilastir</h1>
        <p className="text-slate-400 text-sm mb-6">
          Bir kategori secin, ardindan karsilastirmak istediginiz 2-3 urunu isaretleyin.
        </p>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="bg-slate-800 text-white px-3 py-2 rounded border border-blue-500/20 mb-6"
        >
          <option value="">Kategori secin</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {categoryId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {products.map((p: any) => (
              <button
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                className={`text-left rounded-xl p-4 border transition ${
                  selectedIds.includes(p.id)
                    ? "border-blue-400 bg-blue-950/60"
                    : "border-blue-500/20 bg-slate-900/60 hover:border-blue-500/50"
                }`}
              >
                <h2 className="font-semibold">{p.name}</h2>
                <p className="text-slate-400 text-sm">{p.brand}</p>
              </button>
            ))}
          </div>
        )}

        {selectedIds.length >= 2 && (
          <button
            onClick={handleCompare}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-full font-medium disabled:opacity-50"
          >
            {loading ? "Karsilastiriliyor..." : `${selectedIds.length} urunu karsilastir`}
          </button>
        )}

        {result && (
          <div className="mt-6 bg-slate-900/60 border border-blue-500/20 rounded-xl p-5 leading-relaxed">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}
