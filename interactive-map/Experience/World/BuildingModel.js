import * as THREE from 'three'
import Experience from '../Experience.js'

export default class BuildingModel {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    // Verify model asset loaded before accessing scene
    this.buildingModel = this.resources.items?.buildingModel
    if (!this.buildingModel) {
      console.error('BuildingModel model resource not found in resources.items')
      return
    }

    this.actualBuildingModel = this.buildingModel.scene

    // Debug UI controls for all directions
    if (this.debug && this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder('modelParan')
      
      // Position controls
      const posFolder = this.debugFolder.addFolder('Position')
      posFolder.add(this.actualBuildingModel.position, 'x').min(-1).max(1).step(0.005).name('X (Left/Right)')
      posFolder.add(this.actualBuildingModel.position, 'y').min(-1).max(1).step(0.005).name('Y (Up/Down)')
      posFolder.add(this.actualBuildingModel.position, 'z').min(-1).max(1).step(0.005).name('Z (Forward/Back)')

      // Rotation controls
      const rotFolder = this.debugFolder.addFolder('Rotation')
      rotFolder.add(this.actualBuildingModel.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.01).name('Rotate X')
      rotFolder.add(this.actualBuildingModel.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('Rotate Y')
      rotFolder.add(this.actualBuildingModel.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.01).name('Rotate Z')
    }

    this.setModel()
  }

  setModel() {
    // Set default offsets for all directions
    this.actualBuildingModel.position.set(
      -0.03,  // X: Left (-) / Right (+)
      -0.02, // Y: Down (-) / Up (+)
      0.00   // Z: Forward (+) / Back (-)
    )

    // Setup shadows
    this.actualBuildingModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    this.scene.add(this.actualBuildingModel)
  }

  resize() {}

  update() {}

  destroy() {
    if (this.actualBuildingModel) {
      this.scene.remove(this.actualBuildingModel)
      this.actualBuildingModel.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose())
          } else {
            child.material?.dispose()
          }
        }
      })
    }

    if (this.debugFolder && this.debug?.ui) {
      this.debugFolder.destroy()
    }
  }
}