import { getClientConfig, getAllClientSlugs } from "@/config";
import { notFound } from "next/navigation";
import ReviewFlow from "@/components/ReviewFlow";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllClientSlugs().map((slug) => ({ slug }));
}

export default async function ClientPage({ params }: Props) {
  const { slug } = await params;
  const config = getClientConfig(slug);
  if (!config) notFound();

  return (
    <main className="min-h-dvh bg-bg">
      <ReviewFlow config={config} />
    </main>
  );
}
