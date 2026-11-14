# Asignación #2: Integración de Objetos 3D con Three.js

**Materia:** Sistemas Gráficos  
**Proyecto:** Museo glTF — Galería interactiva de modelos 3D  
**Tecnología:** Three.js + Vite + JavaScript, WebGL, GLTFLoader y DRACOLoader

## Temática

El concepto es un **museo virtual de modelos glTF**: una sala de exhibición para comparar formatos de modelos 3D reales y sus propiedades. El protagonista es un casco de aviación con materiales PBR. El visitante también puede ver un pato en varios empaquetados glTF y un zorro con animación de esqueleto. Cada pieza forma parte de la colección didáctica de formatos glTF de Khronos incluida en el repositorio.

## Lo implementado

- THREE.Scene, PerspectiveCamera, WebGLRenderer y OrbitControls.
- Luces hemisférica, principal, relleno y contraluz; sombras y mapeo de tonos.
- Suelo y GridHelper para referencia espacial.
- GLTFLoader para cargar **la escena completa** y no perder partes del modelo.
- Ajuste automático de escala y posición, respetando proporciones originales.
- DRACOLoader con decodificador WASM local para modelos comprimidos.
- Seis ejemplos: casco, pato glTF, pato GLB, pato Draco, pato Embedded y zorro GLB animado.
- AnimationMixer con selección de clips de animación del zorro.
- Controles para pausar rotación, reiniciar cámara y mostrar cuadrícula.
- Indicador de carga, reporte de errores y diseño adaptable a teléfonos.

## Requisitos

Node.js 18 o superior y npm, más un navegador moderno compatible con WebGL. No abrir index.html con file://: los archivos de modelos y texturas requieren HTTP.

## Ejecución en Windows / PowerShell

Desde la carpeta del repositorio:

~~~powershell
cd .\imported-models
npm install
npm run dev
~~~

Abre la URL local mostrada por Vite, normalmente http://localhost:5173.

Para generar una versión distribuible:

~~~powershell
npm run build
npm run preview
~~~

La compilación se guarda en dist/ y contiene los modelos y las texturas.

## Estructura

~~~text
imported-models/
├── src/
│   ├── index.html           # Interfaz web
│   ├── main.js              # Three.js, glTF, Draco, cámara y animación
│   └── style.css            # Estilos adaptables
├── static/
│   ├── models/
│   │   ├── Duck/            # glTF, .glb, Draco, Embedded y mapas
│   │   ├── FlightHelmet/    # Casco PBR, geometría y texturas
│   │   └── Fox/             # Zorro animado
│   └── draco/gltf/          # Decodificador JS y WASM
├── package.json
├── package-lock.json
├── vite.config.js
├── CREDITOS.md
└── readme.md
~~~

## Guía de interacción

1. Abre el **Casco de vuelo**, que se muestra completo sobre el pedestal.
2. Haz clic en cada pieza del menú para alternar entre formatos.
3. Selecciona **Pato Draco** para verificar que el modelo comprimido carga.
4. Selecciona **Zorro animado** y cambia el clip de animación.
5. Arrastra con botón izquierdo para orbitar; usa la rueda para zoom y botón derecho para desplazar. Presiona R para reiniciar la cámara.
6. Prueba la iluminación, la cuadrícula y la rotación mediante los controles.

## Correspondencia con los PDF

| PDF | Requisito | Implementación |
|---|---|---|
| Asignación #2 | Definir una temática | Museo de modelos glTF |
| Asignación #2 | Modelo .gltf o .glb con licencia | Casco y modelos documentados en CREDITOS.md |
| Asignación #2 | Scene, PerspectiveCamera, WebGLRenderer | src/main.js |
| Asignación #2 | OrbitControls e iluminación | src/main.js |
| Asignación #2 | GLTFLoader y modelo completo | src/main.js |
| Asignación #2 | Suelo/cuadrícula y cámara | Pedestal, suelo, cuadrícula y encuadre |
| Asignación #2 | ZIP con código y assets | entrega/Asignacion2_MuseoGLTF.zip |
| Desplegar-en-TreeJS | glTF, GLB, Embedded y Draco | Opciones para Duck |
| Desplegar-en-TreeJS | FlightHelmet con varias piezas | Se añade gltf.scene completo |
| Desplegar-en-TreeJS | DRACOLoader y decodificador | static/draco/gltf/ |
| Desplegar-en-TreeJS | Conceptos de animación | Fox con AnimationMixer |

## Fuentes, licencias y atribuciones

Consulta [CREDITOS.md](CREDITOS.md) antes de redistribuir modelos.
El casco es CC0; el pato se conserva como material educativo con licencia
SCEA; el zorro combina modelo CC0 y animación CC BY 4.0.

La guía del PDF se usa como referencia técnica. La escena y la interfaz constituyen una implementación propia.
