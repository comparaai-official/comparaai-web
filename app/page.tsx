import Link from "next/link";
import { getPublishedArticles } from "@/lib/api";

export default async function HomePage() {
  const articles = await getPublishedArticles();

  const latestArticles = articles.slice(0, 3);

  return (
    <main>
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-20">
        <div className="max-w-3xl">
          <p
            className="mb-4 text-sm font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--primary)" }}
          >
            Teknoloji · Haber · Karşılaştırma
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Teknolojiyi daha
            <span style={{ color: "var(--primary)" }}>
              {" "}
              kolay anlayın.
            </span>
          </h1>

          <p
            className="mt-6 max-w-2xl text-lg leading-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Telefon ve laptop dünyasındaki gelişmeleri takip edin,
            ürün özelliklerini inceleyin ve teknoloji ürünleri
            arasındaki farkları keşfedin.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/kategori/telefon"
              className="rounded-lg px-5 py-3 text-sm font-medium transition-colors"
              style={{
                background: "var(--primary)",
                color: "#fff",
              }}
            >
              Telefonları İncele
            </Link>

            <Link
              href="/kategori/laptop"
              className="rounded-lg border px-5 py-3 text-sm font-medium transition-colors"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              Laptopları İncele
            </Link>
          </div>
        </div>
      </section>

      {/* HABERLER */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--primary)" }}
            >
              Teknoloji gündemi
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Son Haberler
            </h2>
          </div>

          <Link
            href="/haberler"
            className="text-sm font-medium"
            style={{ color: "var(--primary)" }}
          >
            Tüm haberler →
          </Link>
        </div>

        {latestArticles.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {latestArticles.map((article) => (
              <Link
                key={article.id}
                href={`/haberler/${article.slug}`}
                className="group overflow-hidden rounded-2xl border transition-transform hover:-translate-y-0.5"
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

                <div className="p-5">
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {article.author}
                  </p>

                  <h3 className="mt-2 line-clamp-2 text-lg font-semibold">
                    {article.title}
                  </h3>

                  <p
                    className="mt-3 line-clamp-3 text-sm leading-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {article.summary}
                  </p>

                  <span
                    className="mt-5 inline-block text-sm font-medium"
                    style={{ color: "var(--primary)" }}
                  >
                    Haberi oku →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl border p-8 text-center"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <p style={{ color: "var(--text-secondary)" }}>
              Henüz yayınlanmış haber bulunmuyor.
            </p>
          </div>
        )}
      </section>

      {/* TELEFON / LAPTOP */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/kategori/telefon"
            className="rounded-2xl border p-7 transition-transform hover:-translate-y-0.5"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <p
              className="text-sm font-medium"
              style={{ color: "var(--primary)" }}
            >
              Kategori
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Telefonlar
            </h2>

            <p
              className="mt-3 max-w-md leading-7"
              style={{ color: "var(--text-secondary)" }}
            >
              Telefon özelliklerini inceleyin ve modelleri
              karşılaştırın.
            </p>

            <span
              className="mt-6 inline-block text-sm font-medium"
              style={{ color: "var(--primary)" }}
            >
              Telefonları keşfet →
            </span>
          </Link>

          <Link
            href="/kategori/laptop"
            className="rounded-2xl border p-7 transition-transform hover:-translate-y-0.5"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <p
              className="text-sm font-medium"
              style={{ color: "var(--primary)" }}
            >
              Kategori
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Laptoplar
            </h2>

            <p
              className="mt-3 max-w-md leading-7"
              style={{ color: "var(--text-secondary)" }}
            >
              Laptop özelliklerini inceleyin ve modeller
              arasındaki farkları keşfedin.
            </p>

            <span
              className="mt-6 inline-block text-sm font-medium"
              style={{ color: "var(--primary)" }}
            >
              Laptopları keşfet →
            </span>
          </Link>
        </div>
      </section>

      {/* AI - Şimdilik sadece küçük CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-24">
        <div
          className="rounded-2xl border p-7 md:p-9"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: "var(--primary)" }}
          >
            Yakında
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            ComparaAI ile ürünleri daha kolay karşılaştırın.
          </h2>

          <p
            className="mt-3 max-w-2xl leading-7"
            style={{ color: "var(--text-secondary)" }}
          >
            Ürünleri inceleyin, teknik özellikleri anlayın ve
            aralarındaki temel farkları keşfedin.
          </p>
        </div>
      </section>
    </main>
  );
}