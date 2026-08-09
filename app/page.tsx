"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api";

type Message = {
  from: "bot" | "user";
};

type Msg = { from: "bot" | "user"; text: string };

const SUPPORTED_TYPES: Record<string, string> = {
  telefon: "telefon",
  laptop: "laptop",
};

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryRanges, setCategoryRanges] = useState<Record<string, { min: number; max: number }>>({});
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "bot",
      text: "Merhaba! Size nasıl yardımcı olabilirim? Aradığınız kategoriyi, tercih ettiğiniz segmenti (ekonomik/orta/üst) ve önceliklerinizi kendi cümlelerinizle yazabilirsiniz. Örn: \"kamerası iyi, ekonomik bir telefon istiyorum\" ya da \"oyun için güçlü bir laptop arıyorum, üst segment olabilir\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [lastProducts, setLastProducts] = useState<any[]>([]);
  const [hasRecommendation, setHasRecommendation] = useState(false);

  useEffect(() => {
    getCategories().then(async (cats) => {
      setCategories(cats);
      const ranges: Record<string, { min: number; max: number }> = {};
      for (const c of cats) {
        const products = await getProducts({ categoryId: c.id });
        if (products && products.length > 0) {
          const prices = products.map((p: any) => p.price);
          ranges[c.slug] = { min: Math.min(...prices), max: Math.max(...prices) };
        }
      }
      setCategoryRanges(ranges);
    });
  }, []);

  function addMessage(msg: Msg) {
    setMessages((prev) => [...prev, msg]);
  }

  // Kategorideki mevcut urunlerin fiyatlarini uc dilime bolup segmentin gercek araligini bulur
  function getSegmentPriceRange(allPrices: number[], segment: string | null) {
    if (!segment || allPrices.length === 0) return {};
    const sorted = [...allPrices].sort((a, b) => a - b);
    const third = Math.ceil(sorted.length / 3);
    if (segment === "ekonomik") {
      return { maxPrice: String(sorted[Math.min(third - 1, sorted.length - 1)]) };
    }
    if (segment === "orta") {
      return {
        minPrice: String(sorted[Math.max(third - 1, 0)]),
        maxPrice: String(sorted[Math.min(third * 2 - 1, sorted.length - 1)]),
      };
    }
    if (segment === "ust") {
      return { minPrice: String(sorted[Math.max(third * 2 - 1, 0)]) };
    }
    return {};
  }

  async function handleSend() {
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    addMessage({ from: "user", text: userMessage });
    setLoading(true);

    // Zaten bir oneri verildiyse, bu bir takip sorusu demektir
    if (hasRecommendation && lastProducts.length > 0) {
      const res = await fetch("http://localhost:8000/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: lastProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            price: p.price,
            specs: p.specs,
          })),
          question: userMessage,
        }),
      });
      const data = await res.json();
      addMessage({ from: "bot", text: data.answer });
      setLoading(false);
      return;
    }

    // Once kategoriyi tespit edelim (eger daha once secilmemisse)
    let category = selectedCategory;
    if (!category) {
      const categoryNames = categories.map((c) => `${c.slug}:${c.name}`).join(", ");
      const catRes = await fetch("http://localhost:8000/detect-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, categories: categoryNames }),
      });
      const catData = await catRes.json();
      category = categories.find((c) => c.slug === catData.category_slug) || null;
      setSelectedCategory(category);
    }

    if (!category || !SUPPORTED_TYPES[category.slug]) {
      const generalRes = await fetch("http://localhost:8000/general-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const generalData = await generalRes.json();
      addMessage({ from: "bot", text: generalData.answer });
      setSelectedCategory(null);
      setLoading(false);
      return;
    }

    const categoryType = SUPPORTED_TYPES[category.slug];
    const allProducts = await getProducts({ categoryId: category.id });
    const knownBrands: string[] = Array.from(
      new Set(allProducts.map((p: any) => p.brand))
    ) as string[];

    const parseRes = await fetch("http://localhost:8000/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category_type: categoryType,
        message: userMessage,
        known_brands: knownBrands,
      }),
    });
    const parsed = await parseRes.json();

    if (parsed.price_insistence) {
      addMessage({
        from: "bot",
        text: "Biz teknoloji karşılaştıran bir yapay zekayız, fiyat konusunda bilgi sahibi değiliz ve bu konuda yükümlülük almıyoruz.",
      });
      setLoading(false);
      return;
    }

    if (parsed.needs_clarification) {
      addMessage({ from: "bot", text: parsed.clarification_question });
      setLoading(false);
      return;
    }

    const allPrices = allProducts.map((p: any) => p.price);
    const priceRange = getSegmentPriceRange(allPrices, parsed.segment);

    const products = await getProducts({
      categoryId: category.id,
      brand: parsed.brand || undefined,
      ...priceRange,
    });

    if (!products || products.length === 0) {
      addMessage({
        from: "bot",
        text: "Bu kriterlere uygun ürün bulamadım, farklı bir segment veya marka deneyebilirsiniz.",
      });
      setLoading(false);
      return;
    }

    const res = await fetch("http://localhost:8000/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products: products.map((p: any) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: p.price,
          specs: p.specs,
        })),
        priority: parsed.priority,
      }),
    });

    const data = await res.json();
    addMessage({ from: "bot", text: data.recommendation });
    setLastProducts(products);
    setHasRecommendation(true);
    setLoading(false);
  }

  function handleRestart() {
    setMessages([
      {
        from: "bot",
        text: "Merhaba! Size nasıl yardımcı olabilirim? Aradığınız kategoriyi, tercih ettiğiniz segmenti (ekonomik/orta/üst) ve önceliklerinizi kendi cümlelerinizle yazabilirsiniz.",
      },
    ]);
    setInput("");
    setSelectedCategory(null);
    setLastProducts([]);
    setHasRecommendation(false);
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 bg-[#050810]">
      <div className="w-full max-w-lg flex flex-col gap-2 mt-8">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-16 h-16 mb-3">
            <Image
              src="/logo.png"
              alt="ComparaAI"
              fill
              sizes="64px"
              className="object-contain rounded-full ring-2 ring-blue-500/50"
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Compara<span className="text-blue-400">.AI</span>
          </h1>
          <p className="text-xs text-slate-400 tracking-widest uppercase mt-1">
            Karşılaştır. Analiz Et. Doğru Karar Ver.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-2xl px-4 py-3 max-w-[80%] shadow-lg ${
                  m.from === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800/80 text-slate-100 border border-blue-500/20"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && <p className="text-blue-400 animate-pulse text-sm">Düşünüyorum...</p>}
        </div>

        <div className="flex gap-2 mt-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
            placeholder="Ne aradığınızı, bütçenizi yazın..."
            className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-full border border-blue-500/40 focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full transition disabled:opacity-50"
          >
            Gönder
          </button>
        </div>

        <button
          onClick={handleRestart}
          className="text-slate-500 text-xs underline hover:text-slate-300 mt-1 self-center"
        >
          Sohbeti sıfırla
        </button>

        <div className="flex flex-col gap-2 mt-8 pt-6 border-t border-slate-800">
          <p className="w-full text-center text-slate-500 text-xs mb-2">
            Ya da tüm ürünlere göz atın
          </p>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/kategori/${c.slug}`}
              className="flex justify-between items-center bg-slate-900/60 border border-blue-500/20 rounded-lg px-4 py-3 hover:border-blue-400 transition"
            >
              <span className="text-white font-medium">{c.name}</span>
            </Link>
          ))}
          <Link
            href="/karsilastir"
            className="w-full text-center text-blue-300 text-sm mt-3 underline hover:text-blue-200"
          >
            İki ürünü karşılaştır
          </Link>
        </div>
      </div>
    </main>
  );
}
