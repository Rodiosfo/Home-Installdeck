import assert from "node:assert/strict";
import test from "node:test";
import { chooseGames, locallyInstalled, Overview, SHORTCUT } from "../src/model";

const game = (appid: number, extra: Partial<Overview> = {}): Overview => ({ appid, app_type: 1, display_name: `Game ${appid}`, ...extra });
test("selection overrides external detection in either direction, never Steam's local check", () => {
  const apps = [game(1, { app_type: SHORTCUT }), game(2, { app_type: SHORTCUT }), game(3)];
  const checks = { "1": { installed: false, reason: "unknown" }, "2": { installed: true, reason: "file" } };
  assert.deepEqual(chooseGames(apps, checks, { "1": true, "2": false, "3": true }), [1]);
  assert.deepEqual(chooseGames(apps, {}, { "1": true }), [1]);
  assert.deepEqual(chooseGames(apps, {}, { "1": false }), []);
});
test("only local Steam installs count, not remote installs or play history", () => {
  assert.equal(locallyInstalled(game(1, { local_per_client_data: { installed: false }, per_client_data: [{ clientid: "42", installed: true }] })), false);
  assert.equal(locallyInstalled(game(1, { per_client_data: [{ clientid: "42", installed: true }] })), false);
  assert.equal(locallyInstalled(game(1, { rt_last_time_played: 9999999 })), false);
  assert.equal(locallyInstalled(game(1, { per_client_data: [{ clientid: "0", installed: true }] })), true);
  assert.equal(locallyInstalled(game(1, { local_per_client_data: { installed: false }, per_client_data: [{ clientid: "0", installed: true }] })), false);
});
test("includes verified shortcuts, excludes unverified ones, tools and invisible entries", () => {
  const installed = { local_per_client_data: { installed: true } };
  const apps = [game(1, installed), game(2), game(3, { ...installed, app_type: 4 }),
    game(4, { ...installed, app_type: SHORTCUT }), game(5, { app_type: SHORTCUT }),
    game(6, { ...installed, visible_in_game_list: false }), game(7, { ...installed, app_type: 8 })];
  assert.deepEqual(chooseGames(apps, { "5": { installed: true, reason: "file exists" } }), [1, 5, 7]);
});
test("sorts by recent activity, deduplicates, includes never-played games", () => {
  const installed = { local_per_client_data: { installed: true } };
  const one = game(1, { ...installed, rt_last_time_played_or_installed: 500 });
  assert.deepEqual(chooseGames([one, game(2, { ...installed, rt_last_time_played_or_installed: 1000 }), one, game(3, installed)], {}), [2, 1, 3]);
});
test("uninstall and removal of external proof immediately remove a game", () => {
  const app = game(1, { local_per_client_data: { installed: true } });
  assert.deepEqual(chooseGames([app], {}), [1]);
  app.local_per_client_data!.installed = false;
  assert.deepEqual(chooseGames([app], {}), []);
  assert.deepEqual(chooseGames([game(2, { app_type: SHORTCUT })], { "2": { installed: false, reason: "removed" } }), []);
});
