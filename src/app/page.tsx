import { getClientConfig, DEFAULT_CLIENT_SLUG } from "@/config";
import { notFound } from "next/navigation";
import ReviewFlow from "@/components/ReviewFlow";

export default function Home() {
  const config = getClientConfig(DEFAULT_CLIENT_SLUG);
  if (!config) notFound();

  return (
    <main className="min-h-dvh bg-bg">
      <ReviewFlow config={config} />
    </main>
  );
}
