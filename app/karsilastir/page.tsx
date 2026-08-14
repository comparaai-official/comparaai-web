"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  brand: string;
  specs?: Record<string, unknown>;
};

export default function ComparePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => {
        console.error("Kategoriler alınamadı:", error);
      });
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setProducts([]);
      setSelectedIds([]);
      setSearch("");
      setResult("");
      return;
    }

    getProducts()
      .then((allProducts: any[]) => {
        const filtered = allProducts.filter(
          (product) => product.category?.id === categoryId,
        );

        setProducts(filtered);
        setSelectedIds([]);
        setSearch("");
        setResult("");
      })
      .catch((error) => {
        console.error("Ürünler alınamadı:", error);
        setProducts([]);
      });
  }, [categoryId]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }

      if (prev.length >= 3) {
        return prev;
      }

      return [...prev, id];
    });
  }

  async function handleCompare() {
    if (selectedIds.length < 2) {
      return;
    }

    const selectedProducts = products.filter((product) =>
      selectedIds.includes(product.id),
    );

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("http://localhost:8000/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: selectedProducts.map((product) => ({
            id: product.id,
            name: product.name,
            brand: product.brand,
            specs: product.specs,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Karşılaştırma hatası: ${res.status}`);
      }

      const data = await res.json();

      setResult(
        data.comparison ||
          data.error ||
          "Karşılaştırma sonucu alınamadı.",
      );
    } catch (error) {
      console.error(error);

      setResult(
        "Karşılaştırma sırasında bir sorun oluştu. AI servisinin çalıştığından emin olun.",
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter((product) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query)
    );
  });

  return (
    <main
      className="min-h-screen px-5 py-12"
      style={{
        background: "var(--background)",
        color: "var(--text)",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--primary)" }}
        >
          ← Ana sayfaya dön
        </Link>

        <div className="mt-6 max-w-3xl">
          <p
            className="text-sm font-medium uppercase tracking-[0.15em]"
            style={{ color: "var(--primary)" }}
          >
            ComparaAI
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Ürün Karşılaştır
          </h1>

          <p
            className="mt-4 text-base leading-7"
            style={{ color: "var(--text-secondary)" }}
          >
            Bir kategori seçin, ardından karşılaştırmak
            istediğiniz 2-3 ürünü işaretleyin.
          </p>
        </div>

        {/* Kategori + Arama */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium"
            >
              Kategori
            </label>

            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 outline-none"
              style={{
                background: "var(--surface)",
                color: "var(--text)",
                borderColor: "var(--border)",
              }}
            >
              <option value="">Kategori seçin</option>

              {categories
                .filter(
                  (category) =>
                    category.slug === "telefon" ||
                    category.slug === "laptop",
                )
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="product-search"
              className="mb-2 block text-sm font-medium"
            >
              Ürün ara
            </label>

            <input
              id="product-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün veya marka ara..."
              disabled={!categoryId}
              className="w-full rounded-lg border px-4 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "var(--surface)",
                color: "var(--text)",
                borderColor: "var(--border)",
              }}
            />
          </div>
        </div>

        {categoryId && (
          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Ürünler
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  En fazla 3 ürün seçebilirsiniz.
                </p>
              </div>

              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {selectedIds.length}/3 seçildi
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div
                className="rounded-2xl border p-8 text-center"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <p
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  Aramanıza uygun ürün bulunamadı.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => {
                  const selected = selectedIds.includes(
                    product.id,
                  );

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleSelect(product.id)}
                      className="rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5"
                      style={{
                        background: selected
                          ? "var(--surface-soft)"
                          : "var(--surface)",
                        borderColor: selected
                          ? "var(--primary)"
                          : "var(--border)",
                        boxShadow: selected
                          ? "0 0 0 1px var(--primary)"
                          : "none",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">
                            {product.name}
                          </h3>

                          <p
                            className="mt-1 text-sm"
                            style={{
                              color: "var(--text-secondary)",
                            }}
                          >
                            {product.brand}
                          </p>
                        </div>

                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full border text-xs"
                          style={{
                            borderColor: selected
                              ? "var(--primary)"
                              : "var(--border)",
                            background: selected
                              ? "var(--primary)"
                              : "transparent",
                            color: "#fff",
                          }}
                        >
                          {selected ? "✓" : ""}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {selectedIds.length >= 2 && (
          <div className="mt-8">
            <button
              type="button"
              onClick={handleCompare}
              disabled={loading}
              className="rounded-lg px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "var(--primary)",
                color: "#fff",
              }}
            >
              {loading
                ? "Karşılaştırılıyor..."
                : `${selectedIds.length} ürünü karşılaştır`}
            </button>
          </div>
        )}

        {result && (
          <section className="mt-8">
            <div
              className="rounded-2xl border p-6"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: "var(--primary)" }}
              >
                ComparaAI Analizi
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Karşılaştırma sonucu
              </h2>

              <div
                className="mt-4 whitespace-pre-wrap text-sm leading-7"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                {result}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}