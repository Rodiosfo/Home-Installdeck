const manifest = {"name":"Installed Home"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const callable = api.callable;
const routerHook = api.routerHook;
const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var {
        attr,
        size,
        title
      } = props,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaHdd (props) {
  return GenIcon({"attr":{"viewBox":"0 0 576 512"},"child":[{"tag":"path","attr":{"d":"M576 304v96c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48v-96c0-26.51 21.49-48 48-48h480c26.51 0 48 21.49 48 48zm-48-80a79.557 79.557 0 0 1 30.777 6.165L462.25 85.374A48.003 48.003 0 0 0 422.311 64H153.689a48 48 0 0 0-39.938 21.374L17.223 230.165A79.557 79.557 0 0 1 48 224h480zm-48 96c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32zm-96 0c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32z"},"child":[]}]})(props);
}

// These are Steam's private UI stores. Access is guarded: if Steam changes
// their shape, report that explicitly rather than inventing an installed flag.
function catalog(extraIds = [], host = globalThis) {
    const store = host.appStore;
    if (typeof store?.GetAppOverviewByAppID !== "function") {
        throw new Error("Steam todavía no ha cargado la biblioteca o cambió su API.");
    }
    const ids = new Set();
    let available = false;
    const add = (entry) => {
        const id = Number(typeof entry === "number" || typeof entry === "string"
            ? entry : entry?.appid ?? entry?.nAppID);
        if (Number.isInteger(id) && id > 0 && id <= 0xffffffff)
            ids.add(id);
    };
    extraIds.forEach(add);
    const harvest = (collection) => {
        for (const field of ["allApps", "apps", "visibleApps"]) {
            try {
                const list = collection?.[field];
                if (!list)
                    continue;
                const entries = Array.isArray(list) ? list
                    : typeof list.values === "function" ? Array.from(list.values()) : null;
                if (entries) {
                    available = true;
                    entries.forEach(add);
                }
            }
            catch { /* A lazy collection must not block other collections. */ }
        }
    };
    const cs = host.collectionStore;
    for (const key of ["allAppsCollection", "allGamesCollection", "localGamesCollection",
        "allShortcutsCollection", "shortcutsCollection", "nonSteamCollection"]) {
        try {
            harvest(cs?.[key]);
        }
        catch { /* not hydrated */ }
    }
    for (const key of ["type-games", "gamesCollection", "type-shortcuts", "shortcutsCollection"]) {
        try {
            harvest(cs?.appTypeCollectionMap?.get?.(key));
        }
        catch { /* not hydrated */ }
    }
    // Only shortcuts from the general cache: it can also contain unowned store games.
    for (const key of ["m_mapApps", "m_mapAppInfo"]) {
        try {
            const map = store[key];
            if (typeof map?.entries !== "function")
                continue;
            for (const [id, entry] of map.entries()) {
                if (entry?.app_type === 1073741824) {
                    add(id);
                    available = true;
                }
            }
        }
        catch { /* cache unavailable; collections remain usable */ }
    }
    if (!available && ids.size === 0) {
        throw new Error("Steam todavía no ha cargado la biblioteca o cambió su API.");
    }
    const result = [];
    for (const id of ids) {
        try {
            const overview = store.GetAppOverviewByAppID(id);
            if (overview && overview.appid === id)
                result.push(overview);
        }
        catch { /* An incomplete shortcut must not hide the rest. */ }
    }
    return result;
}
class DetailReader {
    constructor() {
        this.pending = new Set();
        this.closed = false;
    }
    async read(app) {
        const host = globalThis;
        const convert = (d) => ({
            appid: app.appid, name: app.display_name ?? String(app.appid),
            exe: String(d?.strShortcutExe ?? ""),
            startDir: String(d?.strShortcutStartDir ?? ""),
            launchOptions: String(d?.strShortcutLaunchOptions ?? ""),
        });
        if (this.closed)
            return convert(null);
        // GetAppDetails can be lazy. Use Steam's subscription to obtain fresh data
        // (including shortcut edits not yet flushed to shortcuts.vdf).
        return new Promise(resolve => {
            let done = false;
            let handle;
            let timer;
            const finish = (details) => {
                if (done)
                    return;
                done = true;
                clearTimeout(timer);
                try {
                    handle?.unregister?.();
                }
                catch { /* already closed */ }
                this.pending.delete(cancel);
                resolve(convert(details));
            };
            const cancel = () => finish(null);
            this.pending.add(cancel);
            timer = setTimeout(() => {
                let cached;
                try {
                    cached = host.appDetailsStore?.GetAppDetails?.(app.appid);
                }
                catch { /* not ready */ }
                finish(cached);
            }, 1500);
            try {
                const register = host.SteamClient?.Apps?.RegisterForAppDetails;
                if (typeof register !== "function") {
                    finish(null);
                    return;
                }
                handle = register.call(host.SteamClient.Apps, app.appid, (d) => {
                    if (typeof d?.strShortcutExe === "string" && d.strShortcutExe)
                        finish(d);
                });
                // Some Steam builds invoke the callback synchronously.
                if (done)
                    handle?.unregister?.();
            }
            catch {
                finish(null);
            }
        });
    }
    dispose() { this.closed = true; for (const cancel of [...this.pending])
        cancel(); }
}

const SHORTCUT = 1073741824;
// Never use a top-level installed flag, disk-size, play history or the
// selected remote client as evidence that a Steam game is installed locally.
function locallyInstalled(app) {
    const local = app.local_per_client_data;
    if (typeof local?.installed === "boolean")
        return local.installed;
    return app.per_client_data?.find(c => String(c.clientid) === "0")?.installed === true;
}
function chooseGames(apps, checks, visibility = {}) {
    const unique = new Map();
    for (const app of apps) {
        if (!Number.isInteger(app.appid) || app.appid <= 0 || app.visible_in_game_list === false)
            continue;
        if (app.app_type === SHORTCUT ? (visibility[app.appid] ?? checks[app.appid]?.installed) === true
            : [1, 8].includes(app.app_type) && locallyInstalled(app))
            unique.set(app.appid, app);
    }
    return [...unique.values()].sort((a, b) => {
        const date = (v) => v.rt_last_time_played_or_installed ?? v.rt_last_time_played ?? 0;
        return date(b) - date(a) || (a.display_name ?? "").localeCompare(b.display_name ?? "") || a.appid - b.appid;
    }).map(a => a.appid);
}

const getSettings = callable("get_settings");
const saveSettings = callable("save_settings");
const checkShortcuts = callable("check_shortcuts");
class Controller {
    constructor() {
        this.state = {
            settings: { enabled: true, paths: {} }, games: [], shortcuts: [], checks: {},
            loading: true, error: null, scannedAt: null,
            integration: "Abre Inicio para conectar el carrusel.",
        };
        this.listeners = new Set();
        this.reader = new DetailReader();
        this.stopped = false;
        this.active = false;
        this.rerun = false;
        this.ready = false;
        this.handles = [];
        this.get = () => this.state;
        this.subscribe = (fn) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
    }
    update(change) {
        if (this.stopped)
            return;
        this.state = { ...this.state, ...change };
        this.listeners.forEach(fn => fn());
    }
    integration(message) {
        // Called from a render patch. Never cause a React state update during render.
        if (this.state.integration !== message)
            queueMicrotask(() => this.update({ integration: message }));
    }
    async start() {
        try {
            this.update({ settings: await getSettings() });
        }
        catch {
            this.update({ error: "No se pudieron leer los ajustes. Revisa el backend de Decky.", loading: false });
        }
        if (this.stopped)
            return;
        this.ready = true;
        this.timer = setInterval(() => { void this.refresh(); }, 30000);
        const client = globalThis.SteamClient;
        const schedule = () => {
            clearTimeout(this.debounce);
            this.debounce = setTimeout(() => { void this.refresh(); }, 1500);
        };
        try {
            this.handles.push(client?.Apps?.RegisterForAppOverviewChanges?.(schedule));
        }
        catch { /* poll fallback */ }
        try {
            this.handles.push(client?.System?.RegisterForOnResumeFromSuspend?.(schedule));
        }
        catch { /* poll fallback */ }
        await this.refresh();
    }
    async refresh() {
        if (this.stopped || !this.ready)
            return;
        if (this.active) {
            this.rerun = true;
            return;
        }
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
            const shortcuts = [];
            // Limit outstanding Steam subscriptions even with a large ROM library.
            for (let i = 0; i < external.length && !this.stopped; i += 12) {
                shortcuts.push(...await Promise.all(external.slice(i, i + 12).map(g => this.reader.read(g))));
            }
            if (this.stopped)
                return;
            const checks = shortcuts.length ? await checkShortcuts(shortcuts) : {};
            this.update({ games, shortcuts, checks, error: null, scannedAt: Date.now(), loading: false });
        }
        catch (e) {
            // Clear old proof on failure: don't keep displaying a removed external game.
            this.update({ checks: {}, error: e instanceof Error ? e.message : String(e), loading: false });
        }
        finally {
            this.active = false;
            if (this.rerun && !this.stopped) {
                this.rerun = false;
                void this.refresh();
            }
        }
    }
    async setEnabled(enabled) {
        const settings = await saveSettings({ ...this.state.settings, enabled });
        this.update({ settings });
        if (enabled)
            void this.refresh();
    }
    async setVisibility(appid, visible) {
        const visibility = { ...this.state.settings.visibility, [String(appid)]: visible };
        const settings = await saveSettings({ ...this.state.settings, visibility });
        this.update({ settings });
    }
    dispose() {
        // Rendered adapters return their original Steam element immediately.
        this.update({ settings: { ...this.state.settings, enabled: false } });
        this.stopped = true;
        clearInterval(this.timer);
        clearTimeout(this.debounce);
        this.reader.dispose();
        for (const h of this.handles) {
            try {
                h?.unregister?.();
            }
            catch { /* best effort */ }
        }
        this.listeners.clear();
    }
}

// Only traverse React children, not arbitrary Steam objects or cyclic fibers.
// Clone ancestors, preserving keys, refs, styles, callbacks and component types.
function replaceFirst(tree, match, replacement) {
    let found = false;
    function walk(node, depth = 0) {
        if (found || depth > 40)
            return node;
        if (Array.isArray(node)) {
            let changed = false;
            const next = node.map(child => { const value = walk(child, depth + 1); changed || (changed = value !== child); return value; });
            return changed ? next : node;
        }
        if (!SP_REACT.isValidElement(node))
            return node;
        if (match(node)) {
            found = true;
            return replacement(node);
        }
        const children = node.props.children;
        if (children === undefined)
            return node;
        const next = walk(children, depth + 1);
        return next === children ? node : SP_REACT.cloneElement(node, {}, next);
    }
    return { tree: walk(tree), found };
}

function installHome(router, after, controller) {
    let alive = true;
    const patches = [];
    const memos = new WeakMap();
    const functions = new WeakMap();
    function FilteredCarousel({ original }) {
        const state = SP_REACT.useSyncExternalStore(controller.subscribe, controller.get, controller.get);
        SP_REACT.useEffect(() => { void controller.refresh(); }, []);
        if (!alive || !state.settings.enabled)
            return original;
        let apps = state.games;
        try {
            apps = catalog(original.props.games);
        }
        catch { /* startup: empty until known */ }
        const games = chooseGames(apps, state.checks, state.settings.visibility);
        // Steam's native carousel assumes at least one game. Omit it for zero
        // matches rather than injecting a fake app, blank tile, or uninstalled game.
        if (!games.length)
            return null;
        return SP_REACT.cloneElement(original, { games });
    }
    const adaptCarousel = (rendered) => {
        const result = replaceFirst(rendered, node => Array.isArray(node.props.games) && typeof node.props.onItemFocus === "function", node => SP_JSX.jsx(FilteredCarousel, { original: node }, node.key));
        controller.integration(result.found ? "Conectado al carrusel nativo." : "No se encontró el carrusel. Esta versión de Steam requiere adaptación.");
        return result.tree;
    };
    // The three native layers are verified against Deck Shelves' current
    // Home integration. We keep every patch handle and remove our own patches.
    function hook(element, stage, transform) {
        if (!SP_REACT.isValidElement(element))
            return element;
        const type = element.type;
        const post = (_args, rendered) => {
            if (!alive)
                return rendered;
            try {
                return transform(rendered);
            }
            catch (error) {
                console.error("[Installed Home] Home hook:", error);
                controller.integration("Integración incompatible: se conservó el Inicio original.");
                return rendered;
            }
        };
        if (type && typeof type === "object" && typeof type.type === "function") {
            let seen = memos.get(type);
            if (!seen) {
                seen = new Set();
                memos.set(type, seen);
            }
            if (!seen.has(stage)) {
                patches.push(after(type, "type", post));
                seen.add(stage);
            }
            return element;
        }
        if (typeof type === "function") {
            let byStage = functions.get(type);
            if (!byStage) {
                byStage = new Map();
                functions.set(type, byStage);
            }
            let wrapped = byStage.get(stage);
            if (!wrapped) {
                const slot = { type };
                patches.push(after(slot, "type", post));
                wrapped = slot.type;
                byStage.set(stage, wrapped);
            }
            return { ...element, type: wrapped };
        }
        controller.integration("Estructura de Inicio no compatible; no se aplicó el filtro.");
        return element;
    }
    const findRecents = (rendered) => {
        const result = replaceFirst(rendered, node => "autoFocus" in node.props && "showBackground" in node.props, node => hook(node, "recents", adaptCarousel));
        if (!result.found)
            controller.integration("No se encontró la fila de recientes. Abre Inicio o revisa la compatibilidad.");
        return result.tree;
    };
    const route = (props) => ({ ...props, children: hook(props.children, "route", rendered => hook(rendered, "home", findRecents)),
    });
    const handle = router.addPatch("/library/home", route);
    return () => {
        alive = false;
        router.removePatch("/library/home", handle);
        for (const patch of patches.reverse()) {
            try {
                patch.unpatch();
            }
            catch (error) {
                console.warn("[Installed Home] Cleanup:", error);
            }
        }
        patches.length = 0;
    };
}

var index = definePlugin(() => {
    const controller = new Controller();
    const cleanup = installHome(routerHook, DFL.afterPatch, controller);
    void controller.start();
    function Content() {
        const state = SP_REACT.useSyncExternalStore(controller.subscribe, controller.get);
        const [message, setMessage] = SP_REACT.useState("");
        const [saving, setSaving] = SP_REACT.useState(false);
        const ids = new Set(chooseGames(state.games, state.checks, state.settings.visibility));
        const steam = state.games.filter(g => ids.has(g.appid) && g.app_type !== SHORTCUT).length;
        const external = state.games.filter(g => ids.has(g.appid) && g.app_type === SHORTCUT).length;
        async function action(fn) {
            setSaving(true);
            setMessage("");
            try {
                await fn();
            }
            catch (e) {
                setMessage(e instanceof Error ? e.message : String(e));
            }
            finally {
                setSaving(false);
            }
        }
        return SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Inicio \u00B7 solo instalados", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Activar filtro", checked: state.settings.enabled, disabled: saving, description: "Carrusel original, ordenado por actividad reciente.", onChange: enabled => void action(() => controller.setEnabled(enabled)) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: `${steam} de Steam · ${external} externos` }), state.loading && SP_JSX.jsx(DFL.PanelSectionRow, { children: "Actualizando lista\u2026" }), SP_JSX.jsx(DFL.PanelSectionRow, { children: state.integration }), state.error && SP_JSX.jsx(DFL.PanelSectionRow, { children: state.error }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", disabled: state.loading || saving, onClick: () => void controller.refresh(), children: "Actualizar lista" }) })] }), !!state.shortcuts.length && SP_JSX.jsxs(DFL.PanelSection, { title: "Juegos externos en Inicio", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: "Activa los que quieras mostrar. Tu selecci\u00F3n se guarda autom\u00E1ticamente." }), [...state.shortcuts].sort((a, b) => a.name.localeCompare(b.name)).map(game => SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: game.name, checked: ids.has(game.appid), disabled: saving, onChange: visible => void action(() => controller.setVisibility(game.appid, visible)) }) }, game.appid))] }), message && SP_JSX.jsx(DFL.PanelSection, { children: SP_JSX.jsx(DFL.PanelSectionRow, { children: message }) })] });
    }
    return { name: "Installed Home", titleView: SP_JSX.jsx("span", { children: "Installed Home" }), icon: SP_JSX.jsx(FaHdd, {}), content: SP_JSX.jsx(Content, {}),
        onDismount() { controller.dispose(); cleanup(); }, };
});

export { index as default };
//# sourceMappingURL=index.js.map
