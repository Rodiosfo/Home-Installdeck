import { Overview, Shortcut } from "./model";

// These are Steam's private UI stores. Access is guarded: if Steam changes
// their shape, report that explicitly rather than inventing an installed flag.
export function catalog(extraIds: number[] = [], host: any = globalThis): Overview[] {
  const store = host.appStore;
  if (typeof store?.GetAppOverviewByAppID !== "function") {
    throw new Error("Steam todavía no ha cargado la biblioteca o cambió su API.");
  }
  const ids = new Set<number>();
  let available = false;
  const add = (entry: any) => {
    const id = Number(typeof entry === "number" || typeof entry === "string"
      ? entry : entry?.appid ?? entry?.nAppID);
    if (Number.isInteger(id) && id > 0 && id <= 0xffffffff) ids.add(id);
  };
  extraIds.forEach(add);
  const harvest = (collection: any) => {
    for (const field of ["allApps", "apps", "visibleApps"]) {
      try {
        const list = collection?.[field];
        if (!list) continue;
        const entries = Array.isArray(list) ? list
          : typeof list.values === "function" ? Array.from(list.values()) : null;
        if (entries) { available = true; entries.forEach(add); }
      } catch { /* A lazy collection must not block other collections. */ }
    }
  };
  const cs = host.collectionStore;
  for (const key of ["allAppsCollection", "allGamesCollection", "localGamesCollection",
    "allShortcutsCollection", "shortcutsCollection", "nonSteamCollection"]) {
    try { harvest(cs?.[key]); } catch { /* not hydrated */ }
  }
  for (const key of ["type-games", "gamesCollection", "type-shortcuts", "shortcutsCollection"]) {
    try { harvest(cs?.appTypeCollectionMap?.get?.(key)); } catch { /* not hydrated */ }
  }
  // Only shortcuts from the general cache: it can also contain unowned store games.
  for (const key of ["m_mapApps", "m_mapAppInfo"]) {
    try {
      const map = store[key];
      if (typeof map?.entries !== "function") continue;
      for (const [id, entry] of map.entries()) {
        if (entry?.app_type === 1073741824) { add(id); available = true; }
      }
    } catch { /* cache unavailable; collections remain usable */ }
  }
  if (!available && ids.size === 0) {
    throw new Error("Steam todavía no ha cargado la biblioteca o cambió su API.");
  }
  const result: Overview[] = [];
  for (const id of ids) {
    try {
      const overview = store.GetAppOverviewByAppID(id);
      if (overview && overview.appid === id) result.push(overview);
    } catch { /* An incomplete shortcut must not hide the rest. */ }
  }
  return result;
}

export class DetailReader {
  private pending = new Set<() => void>();
  private closed = false;
  async read(app: Overview): Promise<Shortcut> {
    const host = globalThis as any;
    const convert = (d: any): Shortcut => ({
      appid: app.appid, name: app.display_name ?? String(app.appid),
      exe: String(d?.strShortcutExe ?? ""),
      startDir: String(d?.strShortcutStartDir ?? ""),
      launchOptions: String(d?.strShortcutLaunchOptions ?? ""),
    });
    if (this.closed) return convert(null);
    // GetAppDetails can be lazy. Use Steam's subscription to obtain fresh data
    // (including shortcut edits not yet flushed to shortcuts.vdf).
    return new Promise(resolve => {
      let done = false;
      let handle: any;
      let timer: ReturnType<typeof setTimeout>;
      const finish = (details: any) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { handle?.unregister?.(); } catch { /* already closed */ }
        this.pending.delete(cancel);
        resolve(convert(details));
      };
      const cancel = () => finish(null);
      this.pending.add(cancel);
      timer = setTimeout(() => {
        let cached: any;
        try { cached = host.appDetailsStore?.GetAppDetails?.(app.appid); } catch { /* not ready */ }
        finish(cached);
      }, 1500);
      try {
        const register = host.SteamClient?.Apps?.RegisterForAppDetails;
        if (typeof register !== "function") { finish(null); return; }
        handle = register.call(host.SteamClient.Apps, app.appid, (d: any) => {
          if (typeof d?.strShortcutExe === "string" && d.strShortcutExe) finish(d);
        });
        // Some Steam builds invoke the callback synchronously.
        if (done) handle?.unregister?.();
      } catch { finish(null); }
    });
  }
  dispose() { this.closed = true; for (const cancel of [...this.pending]) cancel(); }
}
