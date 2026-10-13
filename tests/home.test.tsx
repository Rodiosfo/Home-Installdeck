import assert from "node:assert/strict";
import test from "node:test";
import React, { createElement, memo, ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";
import { installHome } from "../src/home";
import { replaceFirst } from "../src/tree";
import type { Controller } from "../src/controller";
import { Snapshot, SHORTCUT } from "../src/model";

// Import the actual distributed patcher in Node without loading @decky/ui's
// browser-only discovery code or relying on its package's CJS/ESM metadata.
const patcherSource = await readFile(new URL("../node_modules/@decky/ui/dist/utils/patcher.js", import.meta.url), "utf8");
const { afterPatch } = await import(`data:text/javascript;base64,${Buffer.from(patcherSource).toString("base64")}`);

test("immutable tree transform preserves classes, style, key, ref and callbacks", () => {
  const focus = () => {};
  const style = { color: "red" };
  const target = createElement("div", { key: "stable", className: "steam-native", style, onFocus: focus }, "before");
  const sibling = createElement("aside", {}, "untouched");
  const tree = createElement("main", {}, [target, sibling]);
  const result = replaceFirst(tree, n => n.key === "stable", n => createElement(n.type, { ...n.props, key: n.key }, "after"));
  const output = result.tree as ReactElement<any>;
  assert.equal((tree.props as any).children[0], target);
  assert.equal(output.props.children[1], sibling);
  assert.equal(output.props.children[0].props.className, "steam-native");
  assert.equal(output.props.children[0].props.style, style);
  assert.equal(output.props.children[0].props.onFocus, focus);
});

test("native Home adapter filters without changing DOM styling, handles empty/disabled and unpatches", () => {
  let callback: any;
  let removed = false;
  const router = { addPatch: (_path: string, fn: any) => (callback = fn), removePatch: (_path: string, fn: any) => { assert.equal(fn, callback); removed = true; } };
  let state: Snapshot = {
    settings: { enabled: true, paths: {} }, games: [
      { appid: 1, app_type: 1, local_per_client_data: { installed: true } },
      { appid: 2, app_type: 1, local_per_client_data: { installed: false } },
      { appid: 3, app_type: SHORTCUT }],
    shortcuts: [], checks: { "3": { installed: true, reason: "present" } },
    loading: false, error: null, scannedAt: 1, integration: "",
  };
  const controller = { get: () => state, subscribe: () => () => {}, integration: () => {}, refresh: async () => {} } as unknown as Controller;
  const seen: any[] = [];
  const focus = () => {};
  const Carousel = (props: any) => { seen.push(props); return <div className={props.className} style={props.style}>{props.games.join(",")}</div>; };
  const Recents = memo((_props: any) => <section className="steam-section"><Carousel games={[2, 1]} onItemFocus={focus}
    className="native-carousel css-theme-class" style={{ color: "blue" }} showFeaturedItem /></section>);
  const Home = memo(() => <main><Recents autoFocus showBackground /><aside>News</aside></main>);
  const root = () => createElement(Home);
  const nativeHome = Home.type;
  const nativeRecents = Recents.type;
  const cleanup = installHome(router, afterPatch, controller);
  const render = () => renderToStaticMarkup(callback({ children: createElement(root) }).children);
  const filtered = render();
  assert.match(filtered, />1,3<\/div>/);
  assert.match(filtered, /class="native-carousel css-theme-class" style="color:blue"/);
  assert.match(filtered, /<aside>News<\/aside>/);
  assert.equal(seen.at(-1).onItemFocus, focus);
  assert.equal(seen.at(-1).showFeaturedItem, true);
  state = { ...state, settings: { ...state.settings, enabled: false } };
  assert.match(render(), />2,1<\/div>/);
  state = { ...state, games: [], settings: { ...state.settings, enabled: true }, checks: {} };
  assert.equal(render(), '<main><section class="steam-section"></section><aside>News</aside></main>');
  cleanup();
  assert.ok(removed);
  assert.equal(Home.type, nativeHome);
  assert.equal(Recents.type, nativeRecents);
});
