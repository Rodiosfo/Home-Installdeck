# Referencias y atribuciones

Installed Home es una implementación pequeña para filtrar el carrusel nativo.
No está afiliado a Valve, Decky Loader, CSS Loader, Heroic ni Deck Shelves.

- Plantilla y preset de compilación de Steam Deck Homebrew:
  https://github.com/SteamDeckHomebrew/decky-plugin-template
  Referencia consultada: `90d0780e882a17f5714fc6de044c645f22608290`.
  Se conserva la licencia BSD-3-Clause en `LICENSE`.
- Integración nativa de Deck Shelves de Jonathan Santos:
  https://github.com/santojon/Deck-Shelves/blob/main/src/runtime/recentsReplace.tsx
  Referencia consultada: `cacdd7dfcff12cf6f63df7bf78276ae37f4e7964`.
  El recorrido de las capas de Inicio y la identificación del carrusel se
  adaptaron de esa referencia. Licencia BSD-3-Clause en `licenses/Deck-Shelves.txt`.
- Decky API 1.1.3: biblioteca de comunicación, incluida en el bundle.
  LGPL-2.1; licencia en `licenses/decky-api.txt`, fuente distribuida en
  `third_party/decky-api/`. Puede modificarse y volver a enlazarse mediante
  la construcción desde fuente; no se restringe su depuración o modificación.
- React Icons 5.3.0: icono del panel, incluido en el bundle.
  Licencia MIT en `licenses/react-icons.txt`; el icono Font Awesome
  se distribuye bajo CC BY 4.0. Ver `licenses/font-awesome.txt`.
- `@decky/ui` y React son referencias externas al compilar; se utiliza la
  copia provista por Steam/Decky, no se incluye una segunda copia en el plugin.
  Los archivos de prueba importan el patcher de la dependencia local instalada.

Datos de Heroic contrastados con sus fuentes oficiales de instalación:
https://github.com/Heroic-Games-Launcher/HeroicGamesLauncher

No se incluye código fuente de Steam ni archivos personales del usuario.
