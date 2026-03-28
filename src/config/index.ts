import type { ClientConfig } from "./types";

// Import all client configs statically for tree-shaking
import burghardtStudio from "./clients/burghardt-studio.json";

const clients: Record<string, ClientConfig> = {
  "burghardt-studio": burghardtStudio as ClientConfig,
};

export const DEFAULT_CLIENT_SLUG = "burghardt-studio";

export function getClientConfig(slug?: string): ClientConfig | null {
  if (!slug) return clients[DEFAULT_CLIENT_SLUG] ?? null;
  return clients[slug] ?? null;
}

export function getAllClientSlugs(): string[] {
  return Object.keys(clients);
}
