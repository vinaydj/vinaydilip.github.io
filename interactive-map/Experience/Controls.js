import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Experience from './Experience.js'

export default class Controls {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas
    this.resources = this.experience.resources
    this.sizes = this.experience.sizes
    this.time = this.experience.time
    this.camera = this.experience.camera

    console.log('🎮 Controls constructor called')
    this.setOrbitControls()
  }

  setOrbitControls() {
    console.log('🔄 Setting up OrbitControls...')
    
    // ⭐ IMPORTANT: Make sure we have the camera and canvas
    if (!this.camera || !this.camera.orthographicCamera) {
      console.error('❌ Camera not ready!')
      return
    }
    
    if (!this.canvas) {
      console.error('❌ Canvas not ready!')
      return
    }
    
    this.controls = new OrbitControls(this.camera.orthographicCamera, this.canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.enableZoom = true
    this.controls.zoomSpeed = 1.0
    this.controls.enableRotate = true
    this.controls.rotateSpeed = 1.0
    this.controls.enablePan = true
    this.controls.panSpeed = 1.0
    this.controls.maxPolarAngle = Math.PI / 2
    this.controls.minPolarAngle = 0
    this.controls.maxZoom = 10
    this.controls.minZoom = 0.1
    this.controls.listenToKeyEvents(window)
    
    // ⭐ FORCE ENABLED
    this.controls.enabled = true
    
    // ⭐ Update controls immediately
    this.controls.update()
    
    console.log('🟢 OrbitControls initialized and enabled =', this.controls.enabled)
    console.log('🟢 Camera:', this.camera.orthographicCamera.position)
  }

  resize() {}

  update() {
    if (this.controls) {
      this.controls.update()
    }
  }
}