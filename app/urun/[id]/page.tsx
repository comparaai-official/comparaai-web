"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProduct } from "@/lib/api";

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProduct(id).then((data) => {
      setProduct(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050810] text-white p-8">
        Yukleniyor...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#050810] text-white p-8">
        Urun bulunamadi.
      </main>
    );
  }

  const specs = product.specs || {};

  return (
    <main className="min-h-screen bg-[#050810] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/kategori/${product.category?.slug}`}
          className="text-blue-400 text-sm"
        >
          &larr; {product.category?.name} kategorisine don
        </Link>

        <div className="bg-slate-900/60 border border-blue-500/20 rounded-xl p-6 mt-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-slate-400">{product.brand}</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(specs).map(([key, value]) => (
              <div
                key={key}
                className="bg-slate-800/60 rounded-lg px-3 py-2 text-sm"
              >
                <span className="text-slate-400">{key}: </span>
                <span className="text-white">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
