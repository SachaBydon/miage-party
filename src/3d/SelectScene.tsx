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
  Material
} from '@babylonjs/core'
import '@babylonjs/loaders'
import { loadObject } from '../utils'

export const initScene = async (scene: Scene) => {
  scene.clearColor = new Color4(0.5, 0.5, 1)

  const canvas = scene.getEngine().getRenderingCanvas()
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  let camera = new ArcRotateCamera(
    'Camera',
    0,
    0,
    5,
    new Vector3(25, 20, 0),
    scene
  )
  new HemisphericLight('light', new Vector3(0, 1, 0), scene)
  new HemisphericLight('light', new Vector3(0, -1, 0), scene)


  const obj1 = await loadObject('assets/', 'scene.glb', scene)
  const obj2 = await loadObject('assets/', 'scene.glb', scene)
  const obj3 = await loadObject('assets/', 'scene.glb', scene)
  const obj4 = await loadObject('assets/', 'scene.glb', scene)

  let character_meshes = [
    obj1[0],
    obj2[0],
    obj3[0],
    obj4[0],
  ]

  let character_texture_meshes = [
    obj1[1],
    obj2[1],
    obj3[1],
    obj4[1],
  ]

  let character_pos = 0
  for(let char of character_meshes) {
    char.position.x = character_pos
    character_pos += 6
  }

  const colors = [new Color3(0.9, 0, 0), new Color3(0, 0.9, 0), new Color3(0, 0, .9), new Color3(0.45, 0, .45)]
  for(let i in character_texture_meshes) {
    const mat = new PBRMaterial('mat-test-2', scene)
    mat.albedoColor = colors[i]
    mat.roughness = .5
    mat.metallic = .2
    character_texture_meshes[i].material = mat
  }

  const idle_animation: AnimationGroup | null = scene.getAnimationGroupByName('idle')
  idle_animation?.start(true, 1.0, idle_animation.from, idle_animation.to, false)
  

  const target = character_meshes[0].position.clone()
  target.x = character_meshes[0].position.x + character_meshes[3].position.x / 2
  target.y = target.y - .5

  camera.position.x = target.x
  camera.position.y = 3
  camera.position.z = -20

  camera.target = target

  for(let char of character_meshes) {
    char.lookAt(new Vector3(camera.position.x, 0, camera.position.z))
    char.rotate(new Vector3(0, 1, 0), Tools.ToRadians(180))
  }

}

export const onRender = (scene: Scene) => {

}


export default {
  initScene,
  onRender
}