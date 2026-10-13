import asyncio
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import types
import unittest

fake_decky = types.ModuleType("decky")
sys.modules["decky"] = fake_decky
spec = importlib.util.spec_from_file_location("installed_home_backend", Path(__file__).resolve().parents[1] / "main.py")
backend = importlib.util.module_from_spec(spec)
spec.loader.exec_module(backend)


class InstallationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.home = Path(self.tmp.name)
        fake_decky.DECKY_USER_HOME = str(self.home)
        fake_decky.DECKY_PLUGIN_SETTINGS_DIR = str(self.home / "plugin-settings")

    def tearDown(self):
        self.tmp.cleanup()

    def file(self, relative):
        path = self.home / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("fixture")
        return path

    def check(self, exe, options="", **kw):
        return backend.check_shortcut({"exe": exe, "launchOptions": options, **kw}, self.home)

    def test_direct_game_present_then_uninstalled(self):
        exe = self.file("Games/Name With Spaces/Game.exe")
        self.assertTrue(self.check(f'"{exe}"')["installed"])
        self.assertTrue(self.check(str(exe))["installed"])
        exe.unlink()
        self.assertFalse(self.check(f'"{exe}"')["installed"])

    def test_remote_and_launcher_not_proof(self):
        launcher = self.file("bin/flatpak")
        self.assertFalse(self.check(str(launcher), "run com.heroicgameslauncher.hgl")["installed"])
        self.assertFalse(self.check(str(launcher), "https://example.org/game")["installed"])
        script = self.file("start-game.sh")
        self.assertFalse(self.check(str(script))["installed"])

    def test_rom_present_then_drive_removed(self):
        runner = self.file("emulator.AppImage")
        rom = self.file("SD/My ROM.rvz")
        self.assertTrue(self.check(str(runner), f'-f "{rom}"')["installed"])
        rom.unlink()
        self.assertFalse(self.check(str(runner), f'-f "{rom}"')["installed"])

    def test_heroic_epic_manifest_and_real_executable(self):
        exe = self.file("Games/Epic/Game.exe")
        manifest = self.file(".config/legendary/installed.json")
        manifest.write_text(json.dumps({"abc": {"install_path": str(exe.parent), "executable": "Game.exe"}}))
        self.assertTrue(self.check("/usr/bin/flatpak", "heroic://launch/legendary/abc")["installed"])
        exe.unlink()
        self.assertFalse(self.check("/usr/bin/flatpak", "heroic://launch/legendary/abc")["installed"])

    def test_heroic_gog_flatpak_manifest(self):
        exe = self.file("Games/GOG/Game.exe")
        manifest = self.file(".var/app/com.heroicgameslauncher.hgl/config/heroic/gog_store/installed.json")
        manifest.write_text(json.dumps({"installed": [{"appName": "123", "install_path": str(exe.parent)}]}))
        self.assertTrue(self.check("/usr/bin/flatpak", "heroic://launch/gog/123")["installed"])
        self.assertFalse(self.check("/usr/bin/flatpak", "heroic://launch/gog/456")["installed"])

    def test_proof_file_rechecked_not_permanent_override(self):
        proof = self.file("Games/Lutris/game.exe")
        self.assertTrue(backend.check_shortcut({}, self.home, str(proof))["installed"])
        proof.unlink()
        self.assertFalse(backend.check_shortcut({}, self.home, str(proof))["installed"])

    def test_relative_exe_with_startdir_and_home_expansion(self):
        self.file("Games/test.exe")
        self.assertTrue(self.check("test.exe", startDir='"$HOME/Games"')["installed"])
        self.assertFalse(self.check("missing.exe", startDir='"$HOME/Games"')["installed"])

    def test_command_text_is_never_executed(self):
        marker = self.home / "should-not-exist"
        self.assertFalse(self.check(f'$(touch {marker})')["installed"])
        self.assertFalse(marker.exists())

    def test_settings_persist_only_to_plugin_folder(self):
        plugin = backend.Plugin()
        proof = self.file("Games/test.exe")
        value = {"enabled": False, "paths": {"123": str(proof)}, "visibility": {}}
        self.assertEqual(asyncio.run(plugin.save_settings(value)), value)
        self.assertEqual(asyncio.run(plugin.get_settings()), value)
        self.assertTrue(proof.is_file())
        proof.unlink()
        checks = asyncio.run(plugin.check_shortcuts([{"appid": 123, "exe": "other"}]))
        self.assertFalse(checks["123"]["installed"])
        # A missing old proof must not prevent disabling the filter.
        asyncio.run(plugin.save_settings({**value, "enabled": True}))
        with self.assertRaises(ValueError):
            asyncio.run(plugin.save_settings({"enabled": True, "paths": {"12": str(self.home / 'missing')}}))

    def test_selection_survives_restart_and_does_not_require_a_path(self):
        plugin = backend.Plugin()
        values = {"enabled": True, "paths": {}, "visibility": {"321": True, "322": False}}
        asyncio.run(plugin.save_settings(values))
        restarted = backend.Plugin()
        self.assertEqual(asyncio.run(restarted.get_settings()), values)
        items = [{"appid": 321, "exe": ""}, {"appid": 322, "exe": ""}]
        checks = asyncio.run(restarted.check_shortcuts(items))
        self.assertTrue(checks["321"]["installed"])
        self.assertFalse(checks["322"]["installed"])
        values["visibility"]["321"] = False
        asyncio.run(restarted.save_settings(values))
        self.assertFalse(asyncio.run(restarted.check_shortcuts(items))["321"]["installed"])

    def test_previous_settings_keep_their_values(self):
        plugin = backend.Plugin()
        path = plugin._settings_file()
        path.parent.mkdir(parents=True)
        path.write_text(json.dumps({"enabled": False, "paths": {"1": "/old/game.exe"}}))
        self.assertEqual(asyncio.run(plugin.get_settings()), {"enabled": False, "paths": {"1": "/old/game.exe"}, "visibility": {}})


if __name__ == "__main__":
    unittest.main()
