import { cloneElement, isValidElement, ReactElement, ReactNode, useEffect, useSyncExternalStore } from "react";
import type { Controller } from "./controller";
import { chooseGames } from "./model";
import { catalog } from "./steam";
import { replaceFirst } from "./tree";

type Patch = { unpatch(): void };
type Patcher = (object: any, key: string, fn: (args: any[], value: any) => any) => Patch;
type Router = { addPatch(path: string, callback: any): any; removePatch(path: string, callback: any): void };

export function installHome(router: Router, after: Patcher, controller: Controller) {
  let alive = true;
  const patches: Patch[] = [];
  const memos = new WeakMap<object, Set<string>>();
  const functions = new WeakMap<Function, Map<string, Function>>();

  function FilteredCarousel({ original }: { original: ReactElement<any> }) {
    const state = useSyncExternalStore(controller.subscribe, controller.get, controller.get);
    useEffect(() => { void controller.refresh(); }, []);
    if (!alive || !state.settings.enabled) return original;
    let apps = state.games;
    try { apps = catalog(original.props.games); } catch { /* startup: empty until known */ }
    const games = chooseGames(apps, state.checks, state.settings.visibility);
    // Steam's native carousel assumes at least one game. Omit it for zero
    // matches rather than injecting a fake app, blank tile, or uninstalled game.
    if (!games.length) return null;
    return cloneElement(original, { games });
  }

  const adaptCarousel = (rendered: ReactNode) => {
    const result = replaceFirst(rendered,
      node => Array.isArray(node.props.games) && typeof node.props.onItemFocus === "function",
      node => <FilteredCarousel key={node.key} original={node} />);
    controller.integration(result.found ? "Conectado al carrusel nativo." : "No se encontró el carrusel. Esta versión de Steam requiere adaptación.");
    return result.tree;
  };

  // The three native layers are verified against Deck Shelves' current
  // Home integration. We keep every patch handle and remove our own patches.
  function hook(element: ReactNode, stage: string, transform: (value: any) => any): ReactNode {
    if (!isValidElement<any>(element)) return element;
    const type: any = element.type;
    const post = (_args: any[], rendered: any) => {
      if (!alive) return rendered;
      try { return transform(rendered); }
      catch (error) {
        console.error("[Installed Home] Home hook:", error);
        controller.integration("Integración incompatible: se conservó el Inicio original.");
        return rendered;
      }
    };
    if (type && typeof type === "object" && typeof type.type === "function") {
      let seen = memos.get(type);
      if (!seen) { seen = new Set(); memos.set(type, seen); }
      if (!seen.has(stage)) { patches.push(after(type, "type", post)); seen.add(stage); }
      return element;
    }
    if (typeof type === "function") {
      let byStage = functions.get(type);
      if (!byStage) { byStage = new Map(); functions.set(type, byStage); }
      let wrapped = byStage.get(stage);
      if (!wrapped) {
        const slot = { type };
        patches.push(after(slot, "type", post));
        wrapped = slot.type;
        byStage.set(stage, wrapped!);
      }
      return { ...element, type: wrapped } as ReactElement;
    }
    controller.integration("Estructura de Inicio no compatible; no se aplicó el filtro.");
    return element;
  }

  const findRecents = (rendered: ReactNode) => {
    const result = replaceFirst(rendered,
      node => "autoFocus" in node.props && "showBackground" in node.props,
      node => hook(node, "recents", adaptCarousel));
    if (!result.found) controller.integration("No se encontró la fila de recientes. Abre Inicio o revisa la compatibilidad.");
    return result.tree;
  };
  const route = (props: any) => ({ ...props, children:
    hook(props.children, "route", rendered => hook(rendered, "home", findRecents)),
  });
  const handle = router.addPatch("/library/home", route);
  return () => {
    alive = false;
    router.removePatch("/library/home", handle);
    for (const patch of patches.reverse()) {
      try { patch.unpatch(); } catch (error) { console.warn("[Installed Home] Cleanup:", error); }
    }
    patches.length = 0;
  };
}
