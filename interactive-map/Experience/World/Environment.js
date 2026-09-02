import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.bgColor = 0xf7f9fa

    this.setBackground()
    this.setLights()
  }

  setBackground() {
    this.scene.background = new THREE.Color(this.bgColor)
  }

  setLights() {
    // 1. Balanced ambient light to reveal base textures
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    this.scene.add(this.ambientLight)

    // 2. Subtle hemisphere bounce for natural depth
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xd0d0d0, 0.6)
    this.scene.add(this.hemiLight)

    // 3. Directional sun light for highlights and shadows
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.2)
    this.sunLight.position.set(5, 10, 7)
    this.sunLight.castShadow = true
    this.sunLight.shadow.mapSize.set(2048, 2048)
    this.sunLight.shadow.normalBias = 0.05
    this.scene.add(this.sunLight)

    // 4. Fill light to prevent dark interior corners
    this.fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
    this.fillLight.position.set(-5, 5, -5)
    this.scene.add(this.fillLight)
  }

  resize() {}
  update() {}
  destroy() {}
}