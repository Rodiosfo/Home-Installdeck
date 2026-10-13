export const SHORTCUT = 1073741824;
export interface Overview {
  appid: number;
  display_name?: string;
  app_type: number;
  visible_in_game_list?: boolean;
  rt_last_time_played_or_installed?: number;
  rt_last_time_played?: number;
  local_per_client_data?: { installed?: boolean; clientid?: string };
  per_client_data?: { installed?: boolean; clientid?: string }[];
}
export interface Shortcut {
  appid: number;
  name: string;
  exe: string;
  startDir: string;
  launchOptions: string;
}
export interface Check { installed: boolean; reason: string; proof?: string }
export interface Settings { enabled: boolean; paths: Record<string, string>; visibility?: Record<string, boolean> }
export interface Snapshot {
  settings: Settings;
  games: Overview[];
  shortcuts: Shortcut[];
  checks: Record<string, Check>;
  loading: boolean;
  error: string | null;
  scannedAt: number | null;
  integration: string;
}

// Never use a top-level installed flag, disk-size, play history or the
// selected remote client as evidence that a Steam game is installed locally.
export function locallyInstalled(app: Overview): boolean {
  const local = app.local_per_client_data;
  if (typeof local?.installed === "boolean") return local.installed;
  return app.per_client_data?.find(c => String(c.clientid) === "0")?.installed === true;
}

export function chooseGames(apps: Overview[], checks: Record<string, Check>, visibility: Record<string, boolean> = {}): number[] {
  const unique = new Map<number, Overview>();
  for (const app of apps) {
    if (!Number.isInteger(app.appid) || app.appid <= 0 || app.visible_in_game_list === false) continue;
    if (app.app_type === SHORTCUT ? (visibility[app.appid] ?? checks[app.appid]?.installed) === true
      : [1, 8].includes(app.app_type) && locallyInstalled(app)) unique.set(app.appid, app);
  }
  return [...unique.values()].sort((a, b) => {
    const date = (v: Overview) => v.rt_last_time_played_or_installed ?? v.rt_last_time_played ?? 0;
    return date(b) - date(a) || (a.display_name ?? "").localeCompare(b.display_name ?? "") || a.appid - b.appid;
  }).map(a => a.appid);
}
