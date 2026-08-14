"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getCategories,
  getProducts,
  getImageUrl,
} from "@/lib/api";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  brand: string;
  imageUrl?: string | null;
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [brand, setBrand] = useState("");
  const [segment, setSegment] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);

  // Kategori ve ürünleri getir
  useEffect(() => {
    async function load() {
      try {
        const categories = await getCategories();

        const found = categories.find(
          (item) =>
            item.slug === slug &&
            (item.slug === "telefon" || item.slug === "laptop")
        );

        setCategory(found ?? null);

        if (found) {
          const data = await getProducts({
            categoryId: found.id,
          });

          setAllProducts(data);
          setProducts(data);
        }
      } catch (error) {
        console.error("Kategori yüklenemedi:", error);
        setCategory(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  // Marka + segment filtresini backend'e gönder
  async function applyFilters() {
    if (!category) {
      return;
    }

    try {
      setFilterLoading(true);

      const data = await getProducts({
        categoryId: category.id,
        brand: brand || undefined,
        segment: segment || undefined,
      });

      setProducts(data);
    } catch (error) {
      console.error("Filtreleme başarısız:", error);
      setProducts([]);
    } finally {
      setFilterLoading(false);
    }
  }

  // Filtreleri temizle
  function clearFilters() {
    setBrand("");
    setSegment("");
    setSearch("");
    setProducts(allProducts);
  }

  // Arama kutusuna göre ürünleri frontend'de filtrele
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

  // Yükleniyor
  if (loading) {
    return (
      <main
        className="min-h-screen px-5 py-16"
        style={{
          background: "var(--background)",
          color: "var(--text)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <p style={{ color: "var(--text-secondary)" }}>
            Yükleniyor...
          </p>
        </div>
      </main>
    );
  }

  // Kategori bulunamadı
  if (!category) {
    return (
      <main
        className="min-h-screen px-5 py-16"
        style={{
          background: "var(--background)",
          color: "var(--text)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="text-sm font-medium"
            style={{ color: "var(--primary)" }}
          >
            ← Ana sayfaya dön
          </Link>

          <div
            className="mt-8 rounded-2xl border p-8"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <h1 className="text-2xl font-semibold">
              Kategori bulunamadı
            </h1>

            <p
              className="mt-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Bu kategori şu anda desteklenmiyor.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-5 py-12"
      style={{
        background: "var(--background)",
        color: "var(--text)",
      }}
    >
      <div className="mx-auto max-w-7xl">

        {/* Sayfa başlığı */}
        <div className="max-w-3xl">
          <Link
            href="/"
            className="text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            ← Ana sayfaya dön
          </Link>

          <p
            className="mt-7 text-sm font-medium uppercase tracking-[0.15em]"
            style={{ color: "var(--primary)" }}
          >
            Kategori
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {category.name}
          </h1>

          <p
            className="mt-4 leading-7"
            style={{ color: "var(--text-secondary)" }}
          >
            {category.slug === "telefon"
              ? "Telefon modellerini inceleyin, temel özelliklerini keşfedin ve ürünleri karşılaştırın."
              : "Laptop modellerini inceleyin, teknik özelliklerini keşfedin ve ürünleri karşılaştırın."}
          </p>
        </div>

        {/* Filtre ve arama alanı */}
        <section
          className="mt-10 rounded-2xl border p-5"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <div className="grid gap-4 lg:grid-cols-4">

            {/* Ürün ara */}
            <div>
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-medium"
              >
                Ürün ara
              </label>

              <input
                id="search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ürün veya marka ara..."
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              />
            </div>

            {/* Marka */}
            <div>
              <label
                htmlFor="brand"
                className="mb-2 block text-sm font-medium"
              >
                Marka
              </label>

              <input
                id="brand"
                type="text"
                placeholder="Örn. Samsung"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              />
            </div>

            {/* Segment */}
            <div>
              <label
                htmlFor="segment"
                className="mb-2 block text-sm font-medium"
              >
                Segment
              </label>

              <select
                id="segment"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none"
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              >
                <option value="">Tüm segmentler</option>
                <option value="ekonomik">Ekonomik</option>
                <option value="orta">Orta segment</option>
                <option value="ust">Üst segment</option>
              </select>
            </div>

            {/* Butonlar */}
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={applyFilters}
                disabled={filterLoading}
                className="flex-1 rounded-lg px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  background: "var(--primary)",
                  color: "#fff",
                }}
              >
                {filterLoading
                  ? "Filtreleniyor..."
                  : "Filtrele"}
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border px-5 py-3 text-sm font-medium transition-colors"
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              >
                Temizle
              </button>
            </div>
          </div>
        </section>

        {/* Ürün listesi */}
        <section className="mt-10">

          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                {category.name} ürünleri
              </h2>

              <p
                className="mt-1 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {filteredProducts.length} ürün gösteriliyor
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div
              className="rounded-2xl border p-10 text-center"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <h3 className="font-semibold">
                Ürün bulunamadı
              </h3>

              <p
                className="mt-2 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Arama veya filtre kriterlerinizi değiştirerek
                tekrar deneyin.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/urun/${product.id}`}
                  className="group overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  {/* Görsel */}
                  <div
                    className="aspect-[4/3] overflow-hidden"
                    style={{
                      background: "var(--surface-soft)",
                    }}
                  >
                    {product.imageUrl ? (
                      <img
                        src={getImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span
                          className="text-sm"
                          style={{
                            color: "var(--text-secondary)",
                          }}
                        >
                          ComparaAI
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ürün bilgileri */}
                  <div className="p-5">

                    <p
                      className="text-xs font-medium"
                      style={{
                        color: "var(--primary)",
                      }}
                    >
                      {product.brand}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-lg font-semibold">
                      {product.name}
                    </h3>

                    <span
                      className="mt-5 inline-block text-sm font-medium"
                      style={{
                        color: "var(--primary)",
                      }}
                    >
                      Ürünü incele →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}