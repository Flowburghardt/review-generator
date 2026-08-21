const rateLimit = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

/**
 * Deckel über alle IPs zusammen. Das Per-IP-Limit allein schützt nicht gegen
 * viele Anfragen aus vielen Quellen — und jeder Call kostet echtes Geld.
 */
const GLOBAL_MAX_PER_DAY = 300;
const GLOBAL_WINDOW = 24 * 60 * 60 * 1000;

let globalCount = 0;
let globalResetAt = 0;

/**
 * Abgelaufene Einträge entfernen. Ohne das wächst die Map mit jeder je
 * gesehenen IP weiter, solange der Prozess läuft.
 */
function evictExpired(now: number): void {
  for (const [key, entry] of rateLimit) {
    if (now > entry.resetAt) {
      rateLimit.delete(key);
    }
  }
}

export function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Günstig genug, um bei jedem Aufruf zu laufen: Die Map bleibt klein,
  // weil sie hier überhaupt erst klein gehalten wird.
  evictExpired(now);

  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

export function isGloballyRateLimited(): boolean {
  const now = Date.now();

  if (now > globalResetAt) {
    globalCount = 1;
    globalResetAt = now + GLOBAL_WINDOW;
    return false;
  }

  if (globalCount >= GLOBAL_MAX_PER_DAY) {
    return true;
  }

  globalCount++;
  return false;
}
