import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/api";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function HaberDetayPage({
  params,
}: Props) {
  const { slug } = await params;

  const article = await getArticleBySlug(slug);

  if (!article || !article.isPublished) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <article>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--primary)" }}
        >
          {article.author}
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          {article.title}
        </h1>

        <p
          className="mt-5 text-lg leading-8"
          style={{ color: "var(--text-secondary)" }}
        >
          {article.summary}
        </p>

        <div
          className="mt-8 overflow-hidden rounded-2xl"
          style={{ background: "var(--surface-soft)" }}
        >
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="max-h-[560px] w-full object-cover"
            />
          ) : (
            <div className="flex min-h-[280px] items-center justify-center">
              <span style={{ color: "var(--text-secondary)" }}>
                ComparaAI
              </span>
            </div>
          )}
        </div>

        <div
          className="mt-10 whitespace-pre-wrap text-base leading-8"
          style={{ color: "var(--text)" }}
        >
          {article.content}
        </div>
      </article>
    </main>
  );
}