"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:3001";

type Article = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: string;
  isPublished: boolean;
  publishedAt?: string | null;
};

export default function AdminArticlesPage() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("ComparaAI");
  const [isPublished, setIsPublished] = useState(false);

  function getToken() {
    return localStorage.getItem("token");
  }

  async function loadArticles() {
    try {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_URL}/articles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Haberler alınamadı");
      }

      const data = await res.json();
      setArticles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  async function createArticle(e: React.FormEvent) {
    e.preventDefault();

    if (!title || !slug || !summary || !content) {
      alert("Lütfen zorunlu alanları doldurun.");
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      const res = await fetch(`${API_URL}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          slug,
          summary,
          content,
          author,
          isPublished,
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      alert("Haber başarıyla oluşturuldu.");

      setTitle("");
      setSlug("");
      setSummary("");
      setContent("");
      setAuthor("ComparaAI");
      setIsPublished(false);

      await loadArticles();
    } catch (error) {
      console.error(error);
      alert("Haber oluşturulurken hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteArticle(id: string) {
    if (!confirm("Bu haberi silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/articles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Haber silinemedi");
      }

      await loadArticles();
    } catch (error) {
      console.error(error);
      alert("Haber silinirken hata oluştu.");
    }
  }

  return (
    <main className="min-h-screen bg-[#050810] text-white p-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Compara<span className="text-blue-400">AI</span> Haber Yönetimi
            </h1>

            <p className="text-slate-400 mt-2">
              Haber oluştur, yayınla ve mevcut haberleri yönet.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="border border-slate-600 px-4 py-2 rounded-lg hover:bg-slate-800"
          >
            ← Admin Paneli
          </button>
        </div>

        <section className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">
            Yeni Haber Oluştur
          </h2>

          <form onSubmit={createArticle} className="space-y-4">

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Başlık
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-400"
                placeholder="Haber başlığı"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Slug
              </label>

              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-400"
                placeholder="ornek-haber-basligi"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Özet
              </label>

              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-400"
                placeholder="Haberin kısa özeti"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Haber İçeriği
              </label>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-400"
                placeholder="Haber içeriğini buraya yaz..."
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Yazar
              </label>

              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-400"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4"
              />

              <span className="text-sm">
                Haberi hemen yayınla
              </span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold"
            >
              {saving ? "Kaydediliyor..." : "Haberi Oluştur"}
            </button>

          </form>
        </section>

        <section className="bg-slate-900 border border-slate-700 rounded-xl p-6">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Haberler
            </h2>

            <button
              onClick={loadArticles}
              className="border border-slate-600 px-4 py-2 rounded-lg hover:bg-slate-800"
            >
              Yenile
            </button>
          </div>

          {loading ? (
            <p className="text-slate-400">
              Haberler yükleniyor...
            </p>
          ) : articles.length === 0 ? (
            <p className="text-slate-400">
              Henüz haber bulunmuyor.
            </p>
          ) : (
            <div className="space-y-4">

              {articles.map((article) => (
                <div
                  key={article.id}
                  className="border border-slate-700 rounded-lg p-5"
                >
                  <div className="flex justify-between gap-4">

                    <div>
                      <h3 className="text-lg font-semibold">
                        {article.title}
                      </h3>

                      <p className="text-slate-400 text-sm mt-1">
                        /{article.slug}
                      </p>

                      <p className="text-slate-400 mt-3">
                        {article.summary}
                      </p>
                    </div>

                    <div className="text-right shrink-0">

                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs ${
                          article.isPublished
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {article.isPublished
                          ? "Yayında"
                          : "Taslak"}
                      </span>

                      <button
                        onClick={() => deleteArticle(article.id)}
                        className="block mt-4 text-red-400 hover:text-red-300 text-sm"
                      >
                        Sil
                      </button>

                    </div>

                  </div>
                </div>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}