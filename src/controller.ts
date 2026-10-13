import { callable } from "@decky/api";
import { catalog, DetailReader } from "./steam";
import { Check, Settings, Shortcut, Snapshot, SHORTCUT } from "./model";

const getSettings = callable<[], Settings>("get_settings");
const saveSettings = callable<[Settings], Settings>("save_settings");
const checkShortcuts = callable<[Shortcut[]], Record<string, Check>>("check_shortcuts");

export class Controller {
  private state: Snapshot = {
    settings: { enabled: true, paths: {} }, games: [], shortcuts: [], checks: {},
    loading: true, error: null, scannedAt: null,
    integration: "Abre Inicio para conectar el carrusel.",
  };
  private listeners = new Set<() => void>();
  private reader = new DetailReader();
  private stopped = false;
  private active = false;
  private rerun = false;
  private ready = false;
  private timer?: ReturnType<typeof setInterval>;
  private debounce?: ReturnType<typeof setTimeout>;
  private handles: any[] = [];
  get = () => this.state;
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  private update(change: Partial<Snapshot>) {
    if (this.stopped) return;
    this.state = { ...this.state, ...change };
    this.listeners.forEach(fn => fn());
  }
  integration(message: string) {
    // Called from a render patch. Never cause a React state update during render.
    if (this.state.integration !== message) queueMicrotask(() => this.update({ integration: message }));
  }
  async start() {
    try { this.update({ settings: await getSettings() }); }
    catch { this.update({ error: "No se pudieron leer los ajustes. Revisa el backend de Decky.", loading: false }); }
    if (this.stopped) return;
    this.ready = true;
    this.timer = setInterval(() => { void this.refresh(); }, 30000);
    const client = (globalThis as any).SteamClient;
    const schedule = () => {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => { void this.refresh(); }, 1500);
    };
    try { this.handles.push(client?.Apps?.RegisterForAppOverviewChanges?.(schedule)); } catch { /* poll fallback */ }
    try { this.handles.push(client?.System?.RegisterForOnResumeFromSuspend?.(schedule)); } catch { /* poll fallback */ }
    await this.refresh();
  }
  async refresh() {
    if (this.stopped || !this.ready) return;
    if (this.active) { this.rerun = true; return; }
    this.active = true;
    this.update({ loading: true });
    try {
      const games = catalog();
      const external = games.filter(g => g.app_type === SHORTCUT && g.visible_in_game_list !== false);
      // Publish names immediately; selection does not depend on path validation.
      this.update({ games, shortcuts: external.map(g => ({
        appid: g.appid, name: g.display_name ?? String(g.appid),
        exe: "", startDir: "", launchOptions: "",
      })), error: null });
      const shortcuts: Shortcut[] = [];
      // Limit outstanding Steam subscriptions even with a large ROM library.
      for (let i = 0; i < external.length && !this.stopped; i += 12) {
        shortcuts.push(...await Promise.all(external.slice(i, i + 12).map(g => this.reader.read(g))));
      }
      if (this.stopped) return;
      const checks = shortcuts.length ? await checkShortcuts(shortcuts) : {};
      this.update({ games, shortcuts, checks, error: null, scannedAt: Date.now(), loading: false });
    } catch (e) {
      // Clear old proof on failure: don't keep displaying a removed external game.
      this.update({ checks: {}, error: e instanceof Error ? e.message : String(e), loading: false });
    } finally {
      this.active = false;
      if (this.rerun && !this.stopped) { this.rerun = false; void this.refresh(); }
    }
  }
  async setEnabled(enabled: boolean) {
    const settings = await saveSettings({ ...this.state.settings, enabled });
    this.update({ settings });
    if (enabled) void this.refresh();
  }
  async setVisibility(appid: number, visible: boolean) {
    const visibility = { ...this.state.settings.visibility, [String(appid)]: visible };
    const settings = await saveSettings({ ...this.state.settings, visibility });
    this.update({ settings });
  }
  dispose() {
    // Rendered adapters return their original Steam element immediately.
    this.update({ settings: { ...this.state.settings, enabled: false } });
    this.stopped = true;
    clearInterval(this.timer); clearTimeout(this.debounce);
    this.reader.dispose();
    for (const h of this.handles) { try { h?.unregister?.(); } catch { /* best effort */ } }
    this.listeners.clear();
  }
}
