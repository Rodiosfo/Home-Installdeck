# Installed Home — 0.1.2 (versión de prueba)

Juegos de Steam instalados y juegos externos elegidos por ti en el carrusel de Inicio.
Conserva el carrusel de Steam, sus carátulas, clases CSS, estilos, controles
y callbacks. No inyecta CSS, no oculta tarjetas mediante estilos y no modifica
CSS Loader ni sus temas. No requiere root, conexión a Internet ni paquetes Python.

## Cambios en 0.1.2

Consulta también las colecciones de accesos no-Steam y la caché de accesos de Steam,
para detectar juegos recién añadidos que falten en la colección principal.
La lista para seleccionar juegos aparece antes de terminar las comprobaciones de rutas.
No modifica el lanzamiento de juegos. No diagnostica ni corrige el incidente de Cemu.
Verificada con 21 pruebas automatizadas y compilación; pendiente de prueba en Steam Deck.
Si falta un juego, pulsa **Actualizar lista** y comprueba también Biblioteca → No Steam.

## Actualizar desde 0.1.0 o 0.1.1

Instala este ZIP desde Decky sobre Installed Home. Conserva el mismo nombre
y los ajustes anteriores. Si la interfaz muestra el botón antiguo, reinicia Steam.

## Instalación

1. Copia `Installed-Home-0.1.2.zip` a Descargas en tu Steam Deck. No lo descomprimas.
2. En Modo Juego abre Decky → ajustes → General y activa el modo desarrollador.
3. En la sección Desarrollador elige **Instalar plugin desde ZIP** y selecciona el archivo.
4. Abre **Installed Home** y comprueba que **Activar filtro** esté encendido.
5. Vuelve a Inicio. Si ya estabas allí al instalar, entra a Biblioteca y regresa
   a Inicio. Si Decky solicita reiniciar Steam, hazlo.

El nombre de las opciones puede variar con el idioma y la versión de Decky.
Es un ZIP de plugin compilado, no un ejecutable de escritorio.

## Qué muestra

- Juegos y demos de Steam instalados en este dispositivo (incluida una microSD
  montada que Steam reconozca). No considera una instalación remota como local.
- Accesos no-Steam registrados en Steam: detección automática o selección mediante interruptor.
- Accesos de emulación/Wine con ejecutable y archivo de juego/ROM comprobables.
- Enlaces de Heroic con registros locales compatibles de Epic/GOG/Amazon y
  ruta de instalación disponible. La detección de Amazon es provisional; los
  formatos cubiertos por pruebas de fixtures son Epic y GOG.
- Orden por última actividad/instalación; no elimina juegos por no haberse jugado.

El filtro actúa sobre el **carrusel principal**, no reemplaza la página completa.
Las noticias, recomendaciones y demás secciones originales de Steam permanecen.
No modifica la biblioteca ni borra, instala o desinstala juegos.
No añade a Steam juegos que todavía no tengan acceso registrado.

## Elegir juegos externos

Abre Installed Home → **Juegos externos en Inicio**. La lista muestra cada
juego externo registrado en Steam con un interruptor al lado:

- Activado: se muestra en Inicio.
- Desactivado: se oculta del carrusel de Inicio.

Se guarda automáticamente al cambiar el interruptor. No se pide una ruta,
no hay que abrir un explorador y no hace falta pulsar otro botón de guardar.
La selección tiene prioridad sobre la detección automática, incluso si el
plugin no reconoce el lanzador. También puedes ocultar un externo detectado.
Al actualizar desde 0.1.0 se conservan los ajustes anteriores.

Para los accesos que aún no has seleccionado, se utiliza la detección automática.
Los juegos de Steam siguen filtrándose por instalación local, sin intervención.
Si desinstalas un externo que activaste manualmente, desmarca su interruptor.
La selección confirma tu intención de mostrarlo; no certifica que sus archivos
sigan presentes. El plugin nunca cambia el destino del acceso directo.

**Actualizar lista** vuelve a leer los juegos. También se actualiza cada
30 segundos, al recibir cambios de Steam y al reanudar.

## CSS Loader y otros plugins

Se conserva el DOM del carrusel cuando hay resultados. El filtro solo cambia
su lista `games`; el diseño y las reglas de los temas siguen siendo de Steam
y CSS Loader. Cuando no hay resultados se omite el carrusel, porque el
componente nativo no debe recibir una lista vacía.

No se promete compatibilidad universal: los temas pueden asumir un número
de tarjetas o estructuras concretas. No se ha probado esta versión en hardware.
Para la primera prueba, desactiva otros plugins que **reemplazan el mismo
carrusel**, por ejemplo la sustitución de recientes de Deck Shelves. CSS Loader
puede permanecer activo. No hace falta desactivar todos los plugins de Decky.

## Desactivar / volver atrás

Apaga **Activar filtro**. Se vuelve a entregar la lista original de Steam.
Al descargar el plugin se liberan los listeners, timers y parches propios.
También puedes desinstalarlo desde Decky. Los juegos y temas no se modifican.
Si una actualización de Steam rompe la integración, el panel informa el problema
y se conserva el Inicio original; el filtro ya no se garantiza hasta adaptarlo.

## Estado de validación

- TypeScript: comprobación de tipos y compilación correctas.
- 10 pruebas frontend: filtro local, accesos externos, orden, desinstalación,
  selección de externos, preservación de propiedades visuales y adaptación/desactivación/limpieza.
- 11 pruebas backend: archivos reales temporales, instalación/eliminación,
  rutas con espacios, ROMs, fixtures de Heroic Epic/GOG, rutas de comprobación,
  persistencia de selecciones, migración de ajustes y ausencia de ejecución de comandos.
- Prueba de integración React con árbol simulado; no es una ejecución en Steam.
- **Pendiente:** arranque en Steam Deck, navegación real con mando, suspensión,
  instalación/desinstalación real y tus temas concretos de CSS Loader.

La base de integración se contrastó el 12 de octubre de 2026 con Decky Loader
3.2.10 y el código de Home de Deck Shelves. La versión local del usuario todavía
no se ha observado. No se ha enviado este plugin a la tienda oficial.

## Desarrollo

Se incluye el código fuente en el mismo ZIP. No incluye `node_modules`.
Requisitos para recompilar: Node.js compatible con las dependencias, pnpm,
Python 3.10 o posterior para las pruebas. La construcción de esta entrega usó
Node 24.19.0, pnpm 11.25.0 y Python 3.12.14.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm test
python3 -m unittest discover -s tests -p 'test_*.py' -v
```

`src/model.ts`: reglas de selección y orden.
`src/steam.ts`: catálogo y suscripciones de detalles de accesos.
`src/controller.ts`: refresco, ajustes y comunicación con Python.
`src/home.tsx`: parche limitado a `/library/home` y adaptador del carrusel.
`src/tree.tsx`: recorrido inmutable de hijos React.
`src/index.tsx`: panel de ajustes.
`main.py`: comprobación local de archivos y ajustes propios.

Ver `NOTICE.md` y `licenses/` para las referencias y licencias.
