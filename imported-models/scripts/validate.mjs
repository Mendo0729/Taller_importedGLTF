import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const staticRoot = path.join(root, 'static')
const cases = [
  'models/FlightHelmet/glTF/FlightHelmet.gltf',
  'models/Duck/glTF/Duck.gltf',
  'models/Duck/glTF-Binary/Duck.glb',
  'models/Duck/glTF-Draco/Duck.gltf',
  'models/Duck/glTF-Embedded/Duck.gltf',
  'models/Fox/glTF-Binary/Fox.glb'
]

for (const rel of cases) {
  const file = path.join(staticRoot, rel)
  assert(fs.existsSync(file), 'No existe el archivo: ' + rel)
  assert(fs.statSync(file).size > 100, 'Archivo vacio: ' + rel)

  if (file.endsWith('.glb')) {
    const header = Buffer.alloc(12)
    const fd = fs.openSync(file, 'r')
    fs.readSync(fd, header, 0, 12, 0)
    fs.closeSync(fd)
    assert.equal(header.toString('ascii', 0, 4), 'glTF', 'Cabecera .glb incorrecta: ' + rel)
    assert.equal(header.readUInt32LE(4), 2, 'GLB debe ser version 2: ' + rel)
    assert.equal(header.readUInt32LE(8), fs.statSync(file).size)
  } else {
    const gltf = JSON.parse(fs.readFileSync(file, 'utf8'))
    assert.equal(gltf.asset.version, '2.0', 'Se esperaba glTF 2.0: ' + rel)
    const dependencies = [
      ...(gltf.buffers || []).map(buffer => buffer.uri),
      ...(gltf.images || []).map(image => image.uri)
    ].filter(Boolean).filter(uri => !uri.startsWith('data:'))
    for (const uri of dependencies) {
      const dependency = path.resolve(path.dirname(file), decodeURIComponent(uri))
      assert(
        dependency.startsWith(staticRoot + path.sep) && fs.existsSync(dependency),
        'Falta recurso referenciado por ' + rel + ': ' + uri
      )
    }
  }
  console.log('MODELO_VALIDO', rel)
}

for (const rel of ['draco/gltf/draco_decoder.js', 'draco/gltf/draco_decoder.wasm']) {
  const p = path.join(staticRoot, rel)
  assert(fs.existsSync(p) && fs.statSync(p).size > 100)
  console.log('DECODIFICADOR_VALIDO', rel)
}

for (const rel of ['src/index.html', 'src/main.js', 'src/style.css', 'readme.md', 'CREDITOS.md']) {
  assert(fs.existsSync(path.join(root, rel)), 'Falta archivo requerido: ' + rel)
}
const html = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8')
assert(html.includes('main.js'), 'index.html no carga main.js')
const script = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8')
for (const item of ['GLTFLoader', 'DRACOLoader', 'OrbitControls', 'PerspectiveCamera', 'WebGLRenderer', 'GridHelper', 'AnimationMixer']) {
  assert(script.includes(item), 'Falta API requerida: ' + item)
}
console.log('VALIDACION_EXITOSA: 6 modelos, dependencias, decoder, código y documentación')
