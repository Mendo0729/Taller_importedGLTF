import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/**
 * Asignacion #2 — Sistemas Graficos
 * Museo de modelos glTF: carga correcta de la escena completa, variantes .glb
 * y .gltf, archivos Draco, iluminacion, camara y navegacion interactiva.
 *
 * Todos los modelos se cargan desde /static de Vite (publicDir de vite.config.js).
 * No se agregan solo scene.children[0]: algunos modelos (FlightHelmet) tienen
 * varias piezas y esa tecnica los mutilaria.
 */
const BASE = import.meta.env.BASE_URL

const models = [
  {
    id: 'helmet',
    name: 'Casco de vuelo',
    format: 'glTF + texturas PBR',
    subtitle: 'Sala 01 · Aviacion',
    path: 'models/FlightHelmet/glTF/FlightHelmet.gltf',
    description: 'Pieza detallada con materiales metalicos, cuero, cristal y mapas de normales. Archivo glTF con recursos externos.',
    license: 'Microsoft · CC0 / dominio publico',
    animation: false
  },
  {
    id: 'duck',
    name: 'Pato de demostracion',
    format: 'glTF + BIN + PNG',
    subtitle: 'Sala 02 · Formato estandar',
    path: 'models/Duck/glTF/Duck.gltf',
    description: 'Archivo JSON glTF que referencia una geometria .bin y una imagen PNG externa.',
    license: 'Sony Computer Entertainment · SCEA Shared Source License',
    animation: false
  },
  {
    id: 'duck-binary',
    name: 'Pato binario',
    format: 'glTF-Binary (.glb)',
    subtitle: 'Sala 03 · Modelo empaquetado',
    path: 'models/Duck/glTF-Binary/Duck.glb',
    description: 'El mismo modelo en un unico archivo binario con la geometria y el material.',
    license: 'Sony Computer Entertainment · SCEA Shared Source License',
    animation: false
  },
  {
    id: 'duck-draco',
    name: 'Pato Draco',
    format: 'glTF + compresion Draco',
    subtitle: 'Sala 04 · Geometria comprimida',
    path: 'models/Duck/glTF-Draco/Duck.gltf',
    description: 'La geometria comprimida se decodifica mediante DRACOLoader con un decodificador local WebAssembly.',
    license: 'Sony Computer Entertainment · SCEA Shared Source License',
    animation: false
  },
  {
    id: 'duck-embedded',
    name: 'Pato integrado',
    format: 'glTF-Embedded',
    subtitle: 'Sala 05 · Recursos incrustados',
    path: 'models/Duck/glTF-Embedded/Duck.gltf',
    description: 'Representacion glTF con datos incluidos dentro de un unico archivo JSON.',
    license: 'Sony Computer Entertainment · SCEA Shared Source License',
    animation: false
  },
  {
    id: 'fox',
    name: 'Zorro animado',
    format: 'glTF-Binary + animaciones',
    subtitle: 'Sala 06 · Animacion',
    path: 'models/Fox/glTF-Binary/Fox.glb',
    description: 'Modelo con esqueleto y distintas animaciones, reproducidas con THREE.AnimationMixer.',
    license: 'PixelMannen CC0 · animacion de tomkranis CC BY 4.0',
    animation: true
  }
]

const elements = {
  canvas: document.querySelector('#experience'),
  selection: document.querySelector('#model-selection'),
  title: document.querySelector('#model-title'),
  format: document.querySelector('#model-format'),
  subtitle: document.querySelector('#model-subtitle'),
  description: document.querySelector('#model-description'),
  license: document.querySelector('#model-license'),
  message: document.querySelector('#loading-message'),
  loading: document.querySelector('#loading'),
  progress: document.querySelector('#progress-bar'),
  reset: document.querySelector('#reset-camera'),
  rotate: document.querySelector('#rotate-model'),
  grid: document.querySelector('#toggle-grid'),
  animations: document.querySelector('#animation-controls'),
  animationSelect: document.querySelector('#animation-select'),
  help: document.querySelector('#status-text')
}

const scene = new THREE.Scene()
scene.background = new THREE.Color('#070c17')
scene.fog = new THREE.Fog('#070c17', 11, 24)

// Un pedestal de exhibicion y una cuadricula proporcionan referencia espacial.
const plinth = new THREE.Group()
const baseMaterial = new THREE.MeshStandardMaterial({
  color: '#192a36', metalness: 0.72, roughness: 0.3
})
const topMaterial = new THREE.MeshStandardMaterial({
  color: '#304e5b', metalness: 0.72, roughness: 0.23
})
const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.72, 1.82, 0.25, 96), baseMaterial)
platform.position.y = 0.155
platform.receiveShadow = true
platform.castShadow = true
plinth.add(platform)
const top = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.68, 0.055, 96), topMaterial)
top.position.y = 0.308
top.receiveShadow = true
plinth.add(top)
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(1.68, 0.012, 8, 112),
  new THREE.MeshBasicMaterial({ color: '#84d5e4' })
)
ring.rotation.x = Math.PI / 2
ring.position.y = 0.345
plinth.add(ring)
scene.add(plinth)

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: '#0a1723', metalness: 0.15, roughness: 0.87 })
)
floor.rotation.x = -Math.PI / 2
floor.receiveShadow = true
floor.position.y = -0.025
scene.add(floor)

const grid = new THREE.GridHelper(24, 24, 0x335563, 0x223744)
grid.position.y = 0.002
grid.material.opacity = 0.28
grid.material.transparent = true
scene.add(grid)

scene.add(new THREE.HemisphereLight('#dbeefa', '#243242', 1.2))
const key = new THREE.DirectionalLight('#f5e8d7', 3.1)
key.position.set(3, 7, 4)
key.castShadow = true
key.shadow.mapSize.set(2048, 2048)
key.shadow.camera.left = -6
key.shadow.camera.right = 6
key.shadow.camera.top = 6
key.shadow.camera.bottom = -6
key.shadow.normalBias = 0.025
scene.add(key)

const fill = new THREE.DirectionalLight('#78c9ec', 1.25)
fill.position.set(-5, 3, -4)
scene.add(fill)
const backLight = new THREE.DirectionalLight('#e5b06e', 0.65)
backLight.position.set(0, 5, -5)
scene.add(backLight)

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100)
const home = new THREE.Vector3(4.3, 3.0, 5.2)
const target = new THREE.Vector3(0, 1.45, 0)
camera.position.copy(home)

const renderer = new THREE.WebGLRenderer({
  canvas: elements.canvas, antialias: true, powerPreference: 'high-performance'
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.22
renderer.outputEncoding = THREE.sRGBEncoding

const controls = new OrbitControls(camera, elements.canvas)
controls.target.copy(target)
controls.enableDamping = true
controls.dampingFactor = 0.055
controls.minDistance = 2.4
controls.maxDistance = 12
controls.maxPolarAngle = Math.PI * 0.49
controls.update()

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath(BASE + 'draco/gltf/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

const holder = new THREE.Group()
scene.add(holder)

let currentLoad = 0
let spinning = true
let activeModel = null
let mixer = null
let currentAction = null
let activeAnimations = []
const clock = new THREE.Clock()

function setProgress(text, percent) {
  elements.loading.hidden = false
  elements.message.textContent = text
  elements.help.textContent = text
  elements.progress.style.width = (percent || 6) + '%'
}

function hideProgress(text) {
  elements.loading.hidden = true
  elements.help.textContent = text
}

function resetCamera() {
  camera.position.copy(home)
  controls.target.copy(target)
  controls.update()
}
elements.reset.addEventListener('click', resetCamera)

elements.rotate.addEventListener('click', () => {
  spinning = !spinning
  elements.rotate.setAttribute('aria-pressed', String(spinning))
  elements.rotate.textContent = spinning ? 'Pausar rotacion' : 'Iniciar rotacion'
})
elements.grid.addEventListener('click', () => {
  grid.visible = !grid.visible
  elements.grid.setAttribute('aria-pressed', String(grid.visible))
  elements.grid.textContent = grid.visible ? 'Ocultar cuadricula' : 'Mostrar cuadricula'
})

function selectAnimation(index) {
  if (!mixer || !activeAnimations[index]) return
  if (currentAction) currentAction.stop()
  currentAction = mixer.clipAction(activeAnimations[index])
  currentAction.reset()
  currentAction.play()
}
elements.animationSelect.addEventListener('change', (event) => {
  selectAnimation(Number(event.target.value))
})

function clearModel() {
  if (mixer) {
    mixer.stopAllAction()
    if (activeModel) mixer.uncacheRoot(activeModel)
  }
  mixer = null
  currentAction = null
  activeAnimations = []
  if (activeModel) holder.remove(activeModel)
  activeModel = null
  elements.animations.hidden = true
}

function centerAndScale(object) {
  // Centrar TODO el gltf.scene permite conservar todas las piezas del modelo.
  object.updateMatrixWorld(true)
  const bounds = new THREE.Box3().setFromObject(object)
  const size = bounds.getSize(new THREE.Vector3())
  const largest = Math.max(size.x, size.y, size.z, 0.001)
  object.scale.multiplyScalar(2.65 / largest)
  object.updateMatrixWorld(true)
  bounds.setFromObject(object)
  const center = bounds.getCenter(new THREE.Vector3())
  object.position.x -= center.x
  object.position.z -= center.z
  object.position.y += 0.375 - bounds.min.y
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

function updateSelection(id) {
  elements.selection.querySelectorAll('button[data-model]').forEach((button) => {
    const selected = button.dataset.model === id
    button.classList.toggle('active', selected)
    button.setAttribute('aria-pressed', String(selected))
  })
}

function loadModel(id) {
  const spec = models.find((model) => model.id === id)
  if (!spec) return
  const loadId = ++currentLoad
  clearModel()
  updateSelection(id)
  elements.title.textContent = spec.name
  elements.subtitle.textContent = spec.subtitle
  elements.format.textContent = spec.format
  elements.description.textContent = spec.description
  elements.license.textContent = spec.license
  holder.rotation.set(0, 0, 0)
  resetCamera()
  setProgress('Cargando ' + spec.name + '…', 8)

  gltfLoader.load(
    BASE + spec.path,
    (gltf) => {
      // Evitar mostrar modelos de una solicitud antigua si el usuario cambia rapido.
      if (loadId !== currentLoad) return
      activeModel = gltf.scene
      centerAndScale(activeModel)
      holder.add(activeModel)
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(activeModel)
        activeAnimations = gltf.animations
        elements.animationSelect.replaceChildren()
        for (const [i, clip] of gltf.animations.entries()) {
          const option = document.createElement('option')
          option.value = String(i)
          option.textContent = clip.name || 'Animacion ' + (i + 1)
          elements.animationSelect.appendChild(option)
        }
        elements.animations.hidden = false
        selectAnimation(0)
      }
      hideProgress('Modelo cargado correctamente · arrastra para orbitar')
    },
    (event) => {
      if (loadId !== currentLoad) return
      const percent = event.total ? Math.min(95, Math.round(event.loaded / event.total * 100)) : 45
      setProgress('Descargando recursos 3D…', percent)
    },
    (error) => {
      if (loadId !== currentLoad) return
      console.error('Error cargando el archivo glTF:', error)
      setProgress('No se pudo cargar el modelo. Verifica los archivos y la URL.', 0)
      elements.help.textContent = 'Error de carga. Comprueba la consola del navegador.'
    }
  )
}

function createNavigation() {
  const fragment = document.createDocumentFragment()
  for (const model of models) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'model-card'
    button.dataset.model = model.id
    button.setAttribute('aria-pressed', 'false')
    const name = document.createElement('strong')
    name.textContent = model.name
    const description = document.createElement('span')
    description.textContent = model.format
    button.append(name, description)
    button.addEventListener('click', () => loadModel(model.id))
    fragment.appendChild(button)
  }
  elements.selection.appendChild(fragment)
}

function onResize() {
  const width = window.innerWidth
  const height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height, false)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
}
window.addEventListener('resize', onResize)
onResize()

window.addEventListener('keydown', (event) => {
  if (event.target.closest('button, select, input, textarea')) return
  if (event.key.toLowerCase() === 'r') resetCamera()
})

const animate = () => {
  const dt = Math.min(clock.getDelta(), 0.05)
  if (mixer) mixer.update(dt)
  if (spinning && activeModel) holder.rotation.y += dt * 0.21
  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
createNavigation()
loadModel('helmet')
animate()
