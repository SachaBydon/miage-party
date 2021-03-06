import {
  Vector3,
  MeshBuilder,
  Mesh,
  Scene,
  StandardMaterial,
  Color3,
  Color4,
  AnimationGroup,
  ArcRotateCamera,
  Tools,
  DynamicTexture,
  PBRMaterial,
  Texture,
  HemisphericLight,
  Material,
  PointerEventTypes,
} from '@babylonjs/core'
import '@babylonjs/loaders'
import { loadObject } from '../utils'

// Global data
const railLength = 20

let points: Vector3[] = [
  new Vector3(0 * railLength, 0, 1 * railLength),
  new Vector3(0 * railLength, 0, 2 * railLength),
  new Vector3(1 * railLength, 0, 3 * railLength),
  new Vector3(2 * railLength, 0, 3 * railLength),
  new Vector3(3 * railLength, 0, 2 * railLength),
  new Vector3(3 * railLength, 0, 1 * railLength),
  new Vector3(2 * railLength, 0, 0 * railLength),
  new Vector3(1 * railLength, 0, 0 * railLength),
]
let currentPoint = 0

let character_mesh: Mesh
let character_texture_mesh: Mesh
// let current_animation = 'idle'
let camera: ArcRotateCamera

// Initialization of the scene
export const initScene = async (scene: Scene) => {
  scene.clearColor = new Color4(0.5, 0.5, 1)

  const canvas = scene.getEngine().getRenderingCanvas()
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
      case PointerEventTypes.POINTERDOWN:
        console.log('POINTER DOWN')
        break
      case PointerEventTypes.POINTERUP:
        console.log('POINTER UP')
        break
      case PointerEventTypes.POINTERMOVE:
        console.log('POINTER MOVE')
        break
      case PointerEventTypes.POINTERWHEEL:
        console.log('POINTER WHEEL')
        break
      case PointerEventTypes.POINTERPICK:
        console.log('POINTER PICK')
        break
      case PointerEventTypes.POINTERTAP:
        console.log('POINTER TAP')
        break
      case PointerEventTypes.POINTERDOUBLETAP:
        console.log('POINTER DOUBLE-TAP')
        break
    }
  })

  camera = new ArcRotateCamera(
    'Camera',
    (3 * Math.PI) / 2,
    Math.PI / 2.5,
    5,
    new Vector3(25, 20, 0),
    scene
  )
  new HemisphericLight('light', new Vector3(0, 1, 0), scene)
  new HemisphericLight('light', new Vector3(0, -1, 0), scene)

  // camera.attachControl(canvas, true)

  MeshBuilder.CreateLines('lines', { points: points }, scene)
  MeshBuilder.CreateLines('lines', { points: [points[7], points[0]] }, scene)

  const obj = await loadObject('assets/', 'scene.glb', scene)
  const character_mesh_animations = [...scene.animationGroups]
  scene.removeAnimationGroup(character_mesh_animations[0])
  scene.removeAnimationGroup(character_mesh_animations[1])

  const obj32 = await loadObject('assets/', 'scene.glb', scene)
  const character_2_mesh_animations = [...scene.animationGroups]
  scene.removeAnimationGroup(character_2_mesh_animations[0])
  scene.removeAnimationGroup(character_2_mesh_animations[1])

  character_mesh = obj[0]
  character_texture_mesh = obj[1]

  // character_mesh.position.y = 0

  // const mat1 = new PBRMaterial('mat-test-2', scene)
  // mat1.albedoColor = new Color3(0.9, 0, 0)
  // mat1.roughness = .5
  // mat1.metallic = .2
  const mat1 = new StandardMaterial('mat-test-2', scene)
  mat1.diffuseColor = new Color3(1, 1, 1)
  mat1.ambientTexture = new Texture('assets/criminalMaleA.png', scene)
  // character_texture_mesh.overrideMaterialSideOrientation = Material.CounterClockWiseSideOrientation

  // mat1.diffuseColor = new Color3(0.9, 0, 0)
  character_texture_mesh.material = mat1
  console.log(character_texture_mesh)

  // const idle_animation: AnimationGroup | null = scene.getAnimationGroupByName('idle')
  // const run_animation: AnimationGroup | null =
  //   scene.getAnimationGroupByName('run')
  // if (run_animation) {
  //   run_animation.start(true, 1.0, run_animation.from, run_animation.to, false)
  // }
  // const player_2_run_animation = scene.animationGroups[3]
  // player_2_run_animation

  console.log(scene.animationGroups)
  const anim = character_2_mesh_animations[1]
  anim.start(true, 1.0, anim.from, anim.to, false)


  for (let i in points) {
    const index = parseInt(i)
    const point = MeshBuilder.CreateCylinder(
      'point',
      { diameter: 5, height: 0.4, hasRings: true },
      scene
    )
    const p2 = MeshBuilder.CreateCylinder(
      'point',
      { diameter: 4.2, height: 0.41 },
      scene
    )
    point.addChild(p2)
    point.position = points[index]

    const prev = index == 0 ? nbPoints - 1 : index - 1
    point.lookAt(points[prev])
    point.rotate(new Vector3(0, 1, 0), Math.PI)

    const material_background = new StandardMaterial('Mat', scene)
    material_background.diffuseColor = Color3.Black()
    point.material = material_background

    const text_texture = new DynamicTexture(
      'dynamic texture',
      { width: 256, height: 256 },
      scene,
      false
    )
    const material_text = new StandardMaterial('Mat', scene)
    material_text.diffuseTexture = text_texture
    p2.material = material_text
    const font = 'bold 120px monospace'
    const textureContext = text_texture.getContext()
    textureContext.textAlign = 'center'
    const text = (index + 1).toString()
    const posX = 256 / 2
    const posY = (256 + 70) / 2

    text_texture.drawText(text, posX, posY, font, 'black', 'white', true, true)
    text_texture.update()
  }
}

let speed = 0.5
let nbPoints = points.length

export const onRender = (scene: Scene) => {
  if (!character_mesh) return

  const current = Math.floor(currentPoint)
  const next = current == nbPoints - 1 ? 0 : current + 1
  const diff = currentPoint - current
  const position = Vector3.Zero()
  const distance = Math.sqrt(
    Math.pow(points[current].x - points[next].x, 2) +
      Math.pow(points[current].z - points[next].z, 2)
  )
  const deltaTimeInMillis = scene.getEngine().getDeltaTime()
  const velocity = (speed * deltaTimeInMillis) / distance / 30

  position.x = points[current].x + (points[next].x - points[current].x) * diff
  position.y = points[current].y + (points[next].y - points[current].y) * diff
  position.z = points[current].z + (points[next].z - points[current].z) * diff
  character_mesh.position = position

  currentPoint = currentPoint + velocity

  if (currentPoint >= nbPoints) currentPoint = 0

  character_mesh.lookAt(points[next])
  character_mesh.rotate(new Vector3(0, 1, 0), Tools.ToRadians(180))
  camera.target = character_mesh.position

  const marge = [20, 40]

  const newPos = camera.position.clone()
  if (camera.position.x > character_mesh.position.x + marge[1]) {
    newPos.x = character_mesh.position.x + marge[1]
  }

  if (camera.position.z > character_mesh.position.z + marge[1]) {
    newPos.z = character_mesh.position.z + marge[1]
  }

  if (camera.position.x < character_mesh.position.x + marge[0]) {
    newPos.x = character_mesh.position.x + marge[0]
  }
  if (camera.position.x < character_mesh.position.z + marge[0]) {
    newPos.z = character_mesh.position.z + marge[0]
  }
  camera.position = newPos
}

export default {
  initScene,
  onRender,
}
