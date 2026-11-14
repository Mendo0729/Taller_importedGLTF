# Registro de verificación — Asignación #2

Los requisitos funcionales se implementan en src/main.js.

## Comprobaciones automatizadas

Ejecutar desde imported-models:

~~~powershell
npm install
npm test
npm run build
~~~

- npm test valida cabeceras glTF/GLB, archivos binarios, texturas y decodificador Draco.
- npm run build compila el sitio y copia los recursos a dist/.
- Los scripts de GitHub Actions realizan ambas verificaciones.

## Comprobación manual sugerida

Abrir npm run dev en un navegador compatible con WebGL y verificar:

1. El casco de vuelo aparece completo y con materiales PBR.
2. OrbitControls permite rotar, hacer zoom y desplazar la cámara.
3. Se observan el pedestal, la cuadrícula y las luces.
4. Los cinco formatos de prueba del menú cargan sin errores.
5. Duck Draco carga mediante el decoder WASM local.
6. Fox permite reproducir y cambiar animaciones.
7. Los controles de rotación y cámara funcionan en escritorio y móvil.

La validación estática y del servidor no sustituye una prueba visual con WebGL
en un navegador real.
