import Link from "next/link";
import { getPublishedArticles } from "@/lib/api";

export default async function HaberlerPage() {
  const articles = await getPublishedArticles();

  return (
    <main className="mx-auto max-w-7xl px-5 py-14">
      <div className="mb-10">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--primary)" }}
        >
          ComparaAI
        </p>

        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Haberler
        </h1>

        <p
          className="mt-4 max-w-2xl"
          style={{ color: "var(--text-secondary)" }}
        >
          Teknoloji dünyasından gelişmeleri takip edin.
        </p>
      </div>

      {articles.length === 0 ? (
        <div
          className="rounded-2xl border p-10 text-center"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <p style={{ color: "var(--text-secondary)" }}>
            Henüz yayınlanmış haber bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/haberler/${article.slug}`}
              className="overflow-hidden rounded-2xl border transition-transform hover:-translate-y-0.5"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="aspect-[16/9]"
                style={{ background: "var(--surface-soft)" }}
              >
                {article.imageUrl ? (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>
                      ComparaAI
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {article.author}
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {article.title}
                </h2>

                <p
                  className="mt-3 line-clamp-3 text-sm leading-6"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {article.summary}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}