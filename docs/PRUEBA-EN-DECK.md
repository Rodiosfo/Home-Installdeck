# Comprobación pendiente en Steam Deck

Esta lista es para validar la versión de prueba, no describe pruebas ya realizadas.

1. Anotar versión de SteamOS, canal de Steam, Decky y temas activos de CSS Loader.
2. Comparar el carrusel con filtro apagado y encendido: mismas carátulas,
   tamaños, animaciones y navegación; solo cambia el conjunto de juegos.
3. Verificar un Steam instalado, uno desinstalado y uno disponible solo por
   Remote Play. Solo el primero debe aparecer.
4. Activar y desactivar externos, incluidos accesos no detectados. Verificar que
   cambien en Inicio y que la selección sobreviva a reiniciar Steam.
5. Si corresponde, probar Heroic y una ROM con microSD montada/desmontada.
6. Confirmar que un juego nunca abierto, pero instalado, aparece.
7. Cambiar de juego con cruceta/stick, abrirlo, volver a Inicio y reanudar
   desde suspensión. Revisar foco, selección y fondo destacado.
8. Alternar tus temas CSS Loader y volver a comparar con filtro apagado.
9. Apagar el filtro y desinstalar el plugin. Confirmar restauración del Inicio.

Si no filtra, compartir el texto del estado en el panel y las versiones.
Si falta un externo, compartir cómo se añadió (manual, Heroic, Lutris,
Steam ROM Manager, etc.) y el motivo mostrado al seleccionarlo.
No hace falta compartir contraseñas, tokens ni todo el contenido de los logs.

## Accesos nuevos (0.1.2)

- Con el plugin instalado, añadir un juego de Heroic a Steam. Confirmar que aparece en Biblioteca → No Steam.
- Pulsar Actualizar lista en Installed Home; comprobar que aparece y puede seleccionarse antes de terminar el análisis de rutas.
- Activar su interruptor, volver a Inicio y verificar que aparece una sola vez.
- Si no está en la biblioteca normal de Steam, resolver primero la importación; el plugin no crea accesos.
- Comprobar por separado el lanzamiento con y sin plugin. No se ha reproducido el incidente de Cemu.
