import * as THREE from 'three'
import Experience from "../Experience.js"
import { EventEmitter } from 'events'

import Environment from './Environment.js'
import BuildingModel from './BuildingModel.js'
import Interests from './Interests.js'

export default class World extends EventEmitter {
  constructor() {
    super()
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas
    this.camera = this.experience.camera
    this.resources = this.experience.resources

    this.resources.on('ready', () => {
      this.environment = new Environment()
      this.buildingModel = new BuildingModel()
      this.interests = new Interests()
      this.emit('worldready')
    })
  }

  resize() {
    if (this.environment?.resize) this.environment.resize()
    if (this.buildingModel?.resize) this.buildingModel.resize()
    if (this.interests?.resize) this.interests.resize()
  }

  update() {
    if (this.buildingModel) {
      this.buildingModel.update()
    }

    if (this.interests) {
      this.interests.update()
    }
  }

  destroy() {
    if (this.environment?.destroy) this.environment.destroy()
    if (this.buildingModel?.destroy) this.buildingModel.destroy()
    if (this.interests?.destroy) this.interests.destroy()
  }
}