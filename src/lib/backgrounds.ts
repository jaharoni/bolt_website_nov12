import { supabase } from "./supabase";

export type PageBGRule = {
  mode: "specific" | "random";
  images: string[];
  folders: string[];
  slideshow?: boolean;
  intervalMs?: number;
};

export type BGConfig = {
  pages: Record<string, PageBGRule>;
  fallback: PageBGRule;
};

const CACHE = "bg-config-v1";
let mem: BGConfig | null = null;

export async function getBGConfig(): Promise<BGConfig> {
  if (mem) return mem;
  try {
    const raw = localStorage.getItem(CACHE);
    if (raw) {
      mem = JSON.parse(raw);
      return mem;
    }
  } catch (error) {
    console.warn("[backgrounds] Failed to read config cache", error);
  }
  return await refresh();
}

export async function refresh(): Promise<BGConfig> {
  try {
    const { data: zones, error } = await supabase
      .from("site_zones")
      .select("*")
      .order("key");

    if (error) throw error;

    const cfg: BGConfig = {
      pages: {},
      fallback: { mode: "random", images: [], folders: ["media"] },
    };

    if (zones) {
      for (const zone of zones) {
        const config = zone.config_json as any;
        // Remove .background suffix if present
        const pageKey = zone.key
          .replace(/\.background$/, "")
          .replace("zone_", "");

        if (pageKey === "global" || pageKey === "fallback") {
          cfg.fallback = {
            mode: config.mode || "random",
            images: config.images || [],
            folders: config.folders || ["media"],
            slideshow: config.slideshow,
            intervalMs: config.intervalMs || 6000,
          };
        } else {
          cfg.pages[pageKey] = {
            mode: config.mode || "random",
            images: config.images || [],
            folders: config.folders || [],
            slideshow: config.slideshow,
            intervalMs: config.intervalMs || 6000,
          };
        }
      }
    }

    mem = normalizeCfg(cfg);
    localStorage.setItem(CACHE, JSON.stringify(mem));
    return mem;
  } catch (error) {
    console.error("[backgrounds] Error loading config:", error);
    mem = {
      pages: {},
      fallback: { mode: "random", images: [], folders: ["media"] },
    };
    return mem;
  }
}

export function matchRule(cfg: BGConfig, key: string): PageBGRule {
  if (cfg.pages[key]) return cfg.pages[key];
  for (const k of Object.keys(cfg.pages)) {
    if (k.endsWith("/*")) {
      const base = k.slice(0, -2);
      if (key === base || key.startsWith(base + "/")) return cfg.pages[k];
    }
  }
  return key === "" && cfg.pages["home"] ? cfg.pages["home"] : cfg.fallback;
}

function normalizeCfg(cfg: BGConfig): BGConfig {
  const out: BGConfig = {
    pages: {},
    fallback: cfg.fallback || {
      mode: "random",
      images: [],
      folders: ["media"],
    },
  };
  const fixUrl = (u: string) =>
    u.startsWith("/") ? u : "/" + u.replace(/^\/+/, "");
  const fixFolder = (f: string) => f.replace(/^\/+/, "");
  for (const k of Object.keys(cfg.pages || {})) {
    const r = cfg.pages[k];
    out.pages[k] = {
      mode: r.mode || "random",
      images: (r.images || []).map(fixUrl),
      folders: (r.folders || []).map(fixFolder),
      slideshow: !!r.slideshow,
      intervalMs: typeof r.intervalMs === "number" ? r.intervalMs : 6000,
    };
  }
  out.fallback = {
    mode: out.fallback.mode || "random",
    images: (out.fallback.images || []).map(fixUrl),
    folders: (out.fallback.folders || []).map(fixFolder),
  };
  return out;
}
