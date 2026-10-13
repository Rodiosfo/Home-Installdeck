"""Read-only installation checks. No shell execution, root, network or Steam edits."""
import asyncio
import json
import os
from pathlib import Path
import re
import shlex
from urllib.parse import unquote, urlparse

import decky

GAME_FILES = {".exe", ".appimage", ".x86_64", ".elf", ".iso", ".chd", ".cue",
              ".gdi", ".nsp", ".xci", ".nes", ".sfc", ".smc", ".gba", ".gbc",
              ".gb", ".nds", ".3ds", ".cia", ".rvz", ".wbfs", ".cso", ".pbp",
              ".z64", ".n64", ".v64", ".rom", ".m3u"}
WRAPPERS = {"bash", "sh", "zsh", "fish", "env", "python", "python3", "flatpak",
            "wine", "wine64", "proton", "xdg-open", "gio", "lutris", "heroic",
            "legendary", "umu-run", "steam", "gamescope", "gamemoderun"}


def result(installed, reason, proof=None):
    value = {"installed": bool(installed), "reason": reason}
    if proof:
        value["proof"] = str(proof)
    return value


def path_of(raw, home, start=None):
    value = str(raw or "").strip().strip('"')
    value = value.replace("${HOME}", str(home)).replace("$HOME", str(home))
    if value.startswith("~/"):
        value = str(home / value[2:])
    if value.startswith("file://"):
        value = unquote(urlparse(value).path)
    if not value or "\x00" in value:
        return None
    path = Path(value)
    if not path.is_absolute():
        if start is None:
            return None
        path = start / path
    return path


def tokens(raw):
    try:
        return shlex.split(str(raw or ""), posix=True)
    except ValueError:
        return []


def load_json(path):
    if path.stat().st_size > 16 * 1024 * 1024:
        raise ValueError("Archivo de configuración demasiado grande.")
    with path.open(encoding="utf-8") as stream:
        return json.load(stream)


def heroic_check(uri, home):
    parsed = urlparse(uri)
    parts = [unquote(x) for x in parsed.path.strip("/").split("/")]
    if parsed.netloc != "launch" or len(parts) != 2:
        return result(False, "Enlace de Heroic no reconocido; indica un archivo del juego.")
    store, appid = parts
    configs = [home / ".config", home / ".var/app/com.heroicgameslauncher.hgl/config"]
    candidates = []
    for config in configs:
        if store == "legendary":
            candidates += [config / "legendary/installed.json", config / "heroic/legendaryConfig/legendary/installed.json"]
        elif store in {"gog", "nile"}:
            candidates.append(config / f"heroic/{'gog_store' if store == 'gog' else 'nile_config'}/installed.json")
    for path in candidates:
        try:
            data = load_json(path)
            records = data.get("installed", data) if isinstance(data, dict) else data
            if isinstance(records, dict):
                record = records.get(appid)
            elif isinstance(records, list):
                record = next((r for r in records if isinstance(r, dict) and
                               str(r.get("appName", r.get("app_name", r.get("id", "")))) == appid), None)
            else:
                continue
            if not isinstance(record, dict):
                continue
            directory = path_of(record.get("install_path"), home)
            if not directory or not directory.is_dir():
                continue
            exe = record.get("executable")
            if exe:
                executable = path_of(str(exe).replace("\\", "/"), home, directory)
                if executable and executable.is_file():
                    return result(True, "Instalación de Heroic y ejecutable presentes.", executable)
            elif next(directory.iterdir(), None) is not None:
                return result(True, "Registro de instalación de Heroic y carpeta con contenido presentes.", directory)
        except (OSError, ValueError, TypeError):
            continue
    return result(False, "Heroic: no se pudo confirmar una instalación local; indica un archivo del juego.")


def check_shortcut(item, home, proof=None):
    if proof:
        path = path_of(proof, home)
        present = bool(path and path.is_file())
        return result(present, "Archivo de comprobación presente." if present else "El archivo de comprobación ya no está disponible.", path)
    exe = str(item.get("exe", ""))
    options = str(item.get("launchOptions", ""))
    # Launcher existence alone must never count as installation of its game.
    uri = re.search(r"heroic://[^\s\"']+", exe + " " + options)
    if uri:
        return heroic_check(uri.group(), home)
    if re.search(r"(?:https?|steam|lutris|com\.epicgames\.launcher)://", exe + " " + options, re.I):
        return result(False, "Acceso por enlace o lanzador: indica un archivo local del juego.")
    start = path_of(item.get("startDir"), home)
    exetokens = tokens(exe)
    launch = tokens(options)
    if not exetokens:
        return result(False, "Steam todavía no proporcionó el destino del acceso directo.")
    # Prefer the complete Exe field: Steam often stores unquoted paths with spaces.
    direct = path_of(exe, home, start)
    if not direct or not direct.is_file():
        direct = path_of(exetokens[0], home, start)
    # ROM/executable arguments allow emulation and Wine wrappers without running them.
    game_args = []
    for token in exetokens[1:] + launch:
        if Path(token).suffix.lower() in GAME_FILES:
            path = path_of(token, home, start)
            if path:
                game_args.append(path)
    if game_args:
        if not direct or not direct.is_file():
            return result(False, "No está disponible el ejecutable del acceso directo.")
        if all(p.is_file() for p in game_args):
            return result(True, "Destino del acceso y archivo del juego/ROM presentes.", game_args[0])
        return result(False, "Falta un archivo del juego/ROM indicado por el acceso directo.")
    if not direct:
        return result(False, "Destino no reconocido; indica un archivo del juego.")
    if direct.name.lower() in WRAPPERS or direct.suffix.lower() in {".sh", ".py", ".desktop"}:
        return result(False, "Este acceso usa un lanzador o script; indica un archivo del juego.")
    if direct.is_file():
        return result(True, "Ejecutable local del acceso directo presente.", direct)
    return result(False, "El ejecutable del acceso directo no existe o el disco está desconectado.")


class Plugin:
    async def _main(self):
        decky.logger.info("Installed Home 0.1.2: local Steam checks and external game selection")

    def _settings_file(self):
        return Path(decky.DECKY_PLUGIN_SETTINGS_DIR) / "settings.json"

    def _read_settings(self):
        try:
            data = load_json(self._settings_file())
            return {"enabled": data.get("enabled", True) is True,
                    "paths": {str(k): str(v) for k, v in data.get("paths", {}).items() if str(k).isdigit()},
                    "visibility": {str(k): v for k, v in data.get("visibility", {}).items() if str(k).isdigit() and isinstance(v, bool)}}
        except (OSError, ValueError, AttributeError, TypeError):
            return {"enabled": True, "paths": {}, "visibility": {}}

    async def get_settings(self):
        return await asyncio.to_thread(self._read_settings)

    async def save_settings(self, settings):
        if not isinstance(settings, dict) or not isinstance(settings.get("enabled"), bool):
            raise ValueError("Ajustes no válidos.")
        paths = settings.get("paths", {})
        if not isinstance(paths, dict) or len(paths) > 5000:
            raise ValueError("Lista de archivos no válida.")
        cleaned = {}
        home = Path(decky.DECKY_USER_HOME)
        old = self._read_settings()["paths"]
        for appid, raw in paths.items():
            if not str(appid).isdigit() or not isinstance(raw, str) or len(raw) > 4096:
                raise ValueError("Ruta no válida.")
            path = path_of(raw, home)
            if not path:
                raise ValueError("Usa la ruta completa del archivo.")
            if old.get(str(appid)) != str(path) and not path.is_file():
                raise ValueError("No existe ese archivo. Selecciona el ejecutable o una ROM, no una carpeta.")
            cleaned[str(appid)] = str(path)
        visibility = settings.get("visibility", {})
        if not isinstance(visibility, dict) or len(visibility) > 10000 or any(
                not str(k).isdigit() or not isinstance(v, bool) for k, v in visibility.items()):
            raise ValueError("Selección de juegos no válida.")
        value = {"enabled": settings["enabled"], "paths": cleaned, "visibility": {str(k): v for k, v in visibility.items()}}
        def write():
            path = self._settings_file()
            path.parent.mkdir(parents=True, exist_ok=True)
            temporary = path.with_suffix(".tmp")
            temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")
            os.replace(temporary, path)
        await asyncio.to_thread(write)
        return value

    async def check_shortcuts(self, shortcuts):
        if not isinstance(shortcuts, list) or len(shortcuts) > 10000:
            raise ValueError("Lista de accesos no válida.")
        home = Path(decky.DECKY_USER_HOME)
        settings = self._read_settings()
        def scan():
            checked = {}
            for item in shortcuts:
                if not isinstance(item, dict) or not isinstance(item.get("appid"), int):
                    continue
                appid = str(item["appid"])
                if appid in settings["visibility"]:
                    checked[appid] = result(settings["visibility"][appid], "Selección guardada por ti.")
                    continue
                try:
                    checked[appid] = check_shortcut(item, home, settings["paths"].get(appid))
                except (OSError, ValueError, TypeError):
                    checked[appid] = result(False, "No se pudo comprobar el archivo de este acceso.")
            return checked
        return await asyncio.to_thread(scan)

    async def _unload(self):
        pass

    async def _uninstall(self):
        # Only Decky owns deletion of the plugin/settings. Never touch game files.
        pass
