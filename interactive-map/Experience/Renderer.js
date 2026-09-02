import * as THREE from 'three'
import Experience from './Experience.js'

export default class Renderer {
  constructor() {
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas
    this.camera = this.experience.camera

    this.setRenderer()
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    })

    if (this.renderer.outputColorSpace !== undefined) {
      this.renderer.outputColorSpace = THREE.SRGBColorSpace
    } else {
      this.renderer.outputEncoding = THREE.sRGBEncoding
    }

    // Match studio tone mapping and exposure
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2

    // Soft shadows
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
  }

  resize() {
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
  }

  update() {
    // Render whichever camera is currently active in Camera.instance
    const activeCamera = this.camera?.instance || this.camera?.perspectiveCamera
    if (activeCamera) {
      this.renderer.render(this.scene, activeCamera)
    }
  }

  destroy() {
    this.renderer.dispose()
  }
}