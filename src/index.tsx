import { definePlugin, routerHook } from "@decky/api";
import { afterPatch, ButtonItem, PanelSection, PanelSectionRow, ToggleField } from "@decky/ui";
import { useState, useSyncExternalStore } from "react";
import { FaHdd } from "react-icons/fa";
import { Controller } from "./controller";
import { installHome } from "./home";
import { chooseGames, SHORTCUT } from "./model";

export default definePlugin(() => {
  const controller = new Controller();
  const cleanup = installHome(routerHook, afterPatch, controller);
  void controller.start();

  function Content() {
    const state = useSyncExternalStore(controller.subscribe, controller.get);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const ids = new Set(chooseGames(state.games, state.checks, state.settings.visibility));
    const steam = state.games.filter(g => ids.has(g.appid) && g.app_type !== SHORTCUT).length;
    const external = state.games.filter(g => ids.has(g.appid) && g.app_type === SHORTCUT).length;
    async function action(fn: () => Promise<void>) {
      setSaving(true); setMessage("");
      try { await fn(); } catch (e) { setMessage(e instanceof Error ? e.message : String(e)); }
      finally { setSaving(false); }
    }
    return <>
      <PanelSection title="Inicio · solo instalados">
        <PanelSectionRow><ToggleField label="Activar filtro" checked={state.settings.enabled} disabled={saving}
          description="Carrusel original, ordenado por actividad reciente."
          onChange={enabled => void action(() => controller.setEnabled(enabled))} /></PanelSectionRow>
        <PanelSectionRow>{`${steam} de Steam · ${external} externos`}</PanelSectionRow>
        {state.loading && <PanelSectionRow>Actualizando lista…</PanelSectionRow>}
        <PanelSectionRow>{state.integration}</PanelSectionRow>
        {state.error && <PanelSectionRow>{state.error}</PanelSectionRow>}
        <PanelSectionRow><ButtonItem layout="below" disabled={state.loading || saving}
          onClick={() => void controller.refresh()}>Actualizar lista</ButtonItem></PanelSectionRow>
      </PanelSection>
      {!!state.shortcuts.length && <PanelSection title="Juegos externos en Inicio">
        <PanelSectionRow>Activa los que quieras mostrar. Tu selección se guarda automáticamente.</PanelSectionRow>
        {[...state.shortcuts].sort((a, b) => a.name.localeCompare(b.name)).map(game =>
          <PanelSectionRow key={game.appid}><ToggleField label={game.name}
            checked={ids.has(game.appid)} disabled={saving}
            onChange={visible => void action(() => controller.setVisibility(game.appid, visible))} />
          </PanelSectionRow>)}
      </PanelSection>}
      {message && <PanelSection><PanelSectionRow>{message}</PanelSectionRow></PanelSection>}
    </>;
  }
  return { name: "Installed Home", titleView: <span>Installed Home</span>, icon: <FaHdd />, content: <Content />,
    onDismount() { controller.dispose(); cleanup(); },
  };
});
