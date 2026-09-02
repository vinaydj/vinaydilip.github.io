import * as THREE from 'three'
import GSAP from 'gsap'
import { EventEmitter } from 'events'
import Experience from "./Experience"

export default class Preloader extends EventEmitter {
  constructor() {
    super()
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.sizes = this.experience.sizes
    this.camera = this.experience.camera
    this.world = this.experience.world
    this.device = this.sizes.device

    this.progress = 0
    this.counterElement = document.querySelector('#counter') || document.querySelector('.loading-progress')
    this.progressFillElement = document.querySelector('#progressFill') || document.querySelector('.progress-fill')
    this.preloaderElement = document.querySelector('#preloader') || document.querySelector('.preloader')

    this.sizes.on('switchdevice', (device) => {
      this.device = device
    })

    this.world.on('worldready', () => {
      this.setAssets()
      this.startLoading()
    })
  }

  setAssets() {
    this.group = this.experience.world.buildingModel?.group
  }

  startLoading() {
    this.simulateLoading()
  }

  simulateLoading() {
    const increment = Math.floor(Math.random() * 6) + 1
    this.progress = Math.min(this.progress + increment, 100)

    if (this.counterElement) {
      this.counterElement.textContent = `${this.progress}%`
    }

    if (this.progressFillElement) {
      this.progressFillElement.style.width = `${this.progress}%`
    }

    if (this.progress < 100) {
      const delay = Math.floor(Math.random() * 80) + 40
      setTimeout(() => this.simulateLoading(), delay)
    } else {
      setTimeout(() => {
        this.playIntro()
      }, 400)
    }
  }

  firstIntro() {
    return new Promise((resolve) => {
      this.timeline = new GSAP.timeline({
        onComplete: resolve
      })

      // Fade out preloader overlay
      if (this.preloaderElement) {
        this.timeline.to(this.preloaderElement, {
          opacity: 0,
          duration: 0.6,
          delay: 0.2,
          onStart: () => {
            this.preloaderElement.style.pointerEvents = 'none'
            // Trigger the camera entrance swoop right as preloader fades out
            if (this.camera && this.camera.playEntranceAnimation) {
              this.camera.playEntranceAnimation()
            }
          },
          onComplete: () => {
            this.preloaderElement.classList.add('hidden')
            this.preloaderElement.style.display = 'none'

            this.emit('enablecontrols')
            this.emit('preloadercomplete')

            this.setupLogoClickHandler()
          }
        })
      }
    })
  }

  setupLogoClickHandler() {
    const logo = document.getElementById('logoReset')
    if (logo) {
      logo.removeEventListener('click', this.resetCameraView)
      logo.addEventListener('click', this.resetCameraView.bind(this))
    }
  }

  resetCameraView() {
    if (this.camera && this.camera.setCameraView) {
      this.camera.setCameraView('isometric')
    }
  }

  async playIntro() {
    await this.firstIntro()
  }

  resize() {}

  update() {}
}