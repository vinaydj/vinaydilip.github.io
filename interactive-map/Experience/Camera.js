import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import gsap from 'gsap'
import Experience from './Experience.js'

export default class Camera {
  constructor() {
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas

    this.currentMode = 'perspective'
    this.isAnimating = false
    this.animationQueue = []

    this.setInstance()
    this.setControls()
    this.setCameraPresets()
    this.bindControlEvents()

    // Initialize to elevated starting position for the intro swoop
    const isoPreset = this.presets.isometric
    this.perspectiveCamera.position.set(
      isoPreset.position.x * 2.5,
      isoPreset.position.y * 3.0,
      isoPreset.position.z * 2.5
    )
    this.controls.target.copy(isoPreset.target)
    this.controls.update()
  }

  setInstance() {
    // 1. Perspective Camera
    this.perspectiveCamera = new THREE.PerspectiveCamera(
      28.57,
      this.sizes.width / this.sizes.height,
      0.001,
      100
    )
    this.scene.add(this.perspectiveCamera)

    // 2. Orthographic Camera
    this.frustumSize = 0.1
    const aspect = this.sizes.width / this.sizes.height
    this.orthographicCamera = new THREE.OrthographicCamera(
      (-this.frustumSize * aspect) / 2,
      (this.frustumSize * aspect) / 2,
      this.frustumSize / 2,
      -this.frustumSize / 2,
      0.001,
      100
    )
    this.scene.add(this.orthographicCamera)

    // Default active camera
    this.instance = this.perspectiveCamera
  }

  setControls() {
    this.controls = new OrbitControls(this.perspectiveCamera, this.canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.rotateSpeed = 0.8
    this.controls.zoomSpeed = 1.2
    this.controls.minDistance = 0.01
    this.controls.maxDistance = 0.5
    this.controls.target.set(-0.016, -0.006, -0.02)
    this.controls.update()

    this.defaultTarget = new THREE.Vector3(-0.016, -0.006, -0.02)
  }

  setCameraPresets() {
    const center = new THREE.Vector3(-0.016, -0.006, -0.02)

    this.presets = {
      isometric: {
        position: new THREE.Vector3(0.135, 0.105, 0.135),
        target: center.clone(),
        mode: 'perspective'
      },
      top: {
        position: new THREE.Vector3(-0.016, 0.18, -0.01999),
        target: center.clone(),
        mode: 'perspective'
      },
      plan: {
        position: new THREE.Vector3(-0.016, 0.09, -0.01999),
        target: center.clone(),
        mode: 'orthographic'
      }
    }
  }

  playEntranceAnimation(onComplete = null) {
    this.isAnimating = true
    this.controls.enabled = false

    const isoPreset = this.presets.isometric

    // Set starting position
    this.perspectiveCamera.position.set(
      isoPreset.position.x * 2.2,
      isoPreset.position.y * 2.8,
      isoPreset.position.z * 2.2
    )
    this.controls.target.copy(isoPreset.target)
    this.controls.update()

    // Highlight Isometric button in the UI
    document.querySelectorAll('.cam-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === 'isometric')
    })

    // Animate camera position in
    gsap.to(this.perspectiveCamera.position, {
      duration: 1.8,
      ease: 'power2.out',
      x: isoPreset.position.x,
      y: isoPreset.position.y,
      z: isoPreset.position.z,
      onUpdate: () => {
        this.controls.update()
      },
      onComplete: () => {
        this.controls.enabled = true
        this.isAnimating = false
        if (onComplete) onComplete()
        this.processQueue()
      }
    })

    // Synchronize target transition
    gsap.to(this.controls.target, {
      duration: 1.8,
      ease: 'power2.out',
      x: isoPreset.target.x,
      y: isoPreset.target.y,
      z: isoPreset.target.z
    })
  }

  bindControlEvents() {
    const initButtons = () => {
      const buttons = document.querySelectorAll('.cam-btn')
      if (buttons.length === 0) {
        setTimeout(initButtons, 100)
        return
      }

      buttons.forEach((btn) => {
        btn.removeEventListener('click', this.handleCameraClick)
        btn.addEventListener('click', this.handleCameraClick = () => {
          this.setCameraView(btn.dataset.view)
        })
      })
    }

    initButtons()
  }

  setCameraView(viewName) {
    const preset = this.presets[viewName]
    if (!preset) return

    if (this.isAnimating) {
      this.animationQueue.push(viewName)
      return
    }

    document.querySelectorAll('.cam-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === viewName)
    })

    gsap.killTweensOf(this.perspectiveCamera.position)
    gsap.killTweensOf(this.orthographicCamera.position)
    gsap.killTweensOf(this.controls.target)

    const isOrthographic = preset.mode === 'orthographic'
    const isModeSwitch = this.currentMode !== preset.mode

    if (isModeSwitch) {
      this.switchCameraMode(isOrthographic, preset)
    } else {
      this.animateCameraPosition(preset)
    }
  }

  switchCameraMode(isOrthographic, preset) {
    this.isAnimating = true

    const currentCamera = isOrthographic ? this.perspectiveCamera : this.orthographicCamera
    const newCamera = isOrthographic ? this.orthographicCamera : this.perspectiveCamera

    newCamera.position.copy(currentCamera.position)
    this.controls.target.copy(this.defaultTarget)

    this.controls.object = newCamera
    this.currentMode = isOrthographic ? 'orthographic' : 'perspective'
    this.instance = newCamera

    this.controls.update()

    this.animateCameraPosition(preset, () => {
      this.isAnimating = false
      this.processQueue()
    })
  }

  animateCameraPosition(preset, onComplete = null) {
    this.isAnimating = true
    const camera = this.controls.object

    gsap.to(camera.position, {
      duration: 1.0,
      ease: 'power3.inOut',
      x: preset.position.x,
      y: preset.position.y,
      z: preset.position.z,
      onUpdate: () => {
        this.controls.update()
      },
      onComplete: () => {
        this.isAnimating = false
        if (onComplete) onComplete()
        this.processQueue()
      }
    })

    gsap.to(this.controls.target, {
      duration: 1.0,
      ease: 'power3.inOut',
      x: preset.target.x,
      y: preset.target.y,
      z: preset.target.z,
      onUpdate: () => {
        this.controls.update()
      }
    })
  }

  processQueue() {
    if (this.animationQueue.length > 0) {
      const nextView = this.animationQueue.shift()
      this.setCameraView(nextView)
    }
  }

  resize() {
    const aspect = this.sizes.width / this.sizes.height

    this.perspectiveCamera.aspect = aspect
    this.perspectiveCamera.updateProjectionMatrix()

    const frustumSize = this.frustumSize
    this.orthographicCamera.left = (-frustumSize * aspect) / 2
    this.orthographicCamera.right = (frustumSize * aspect) / 2
    this.orthographicCamera.top = frustumSize / 2
    this.orthographicCamera.bottom = -frustumSize / 2
    this.orthographicCamera.updateProjectionMatrix()
  }

  update() {
    if (this.controls) {
      this.controls.update()
    }
  }

  destroy() {
    document.querySelectorAll('.cam-btn').forEach((btn) => {
      btn.removeEventListener('click', this.handleCameraClick)
    })

    if (this.controls) {
      this.controls.dispose()
    }

    gsap.killTweensOf(this.perspectiveCamera.position)
    gsap.killTweensOf(this.orthographicCamera.position)
    gsap.killTweensOf(this.controls.target)
  }
}