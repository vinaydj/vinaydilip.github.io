import { clamp, lerp } from '../Utils/math.js'

export default class Scrolling {
  constructor({
    blockers = ['menu--open'],
    easing = 0.1,
    element,
    speed = 1,
    trigger = document.querySelector('.info-panel-content')
  }) {
    this.blockers = blockers
    this.element = element
    this.speed = speed
    this.trigger = trigger
    this.wrapper = element.children[0]

    this.current = 0
    this.target = 0
    this.easing = easing
    this.limit = 0

    // Bind handlers once to allow clean listener removal
    this.onWheelBound = this.onWheel.bind(this)
    this.onTouchStartBound = this.onTouchStart.bind(this)
    this.onTouchMoveBound = this.onTouchMove.bind(this)
    this.onTouchEndBound = this.onTouchEnd.bind(this)

    this.addObserver()
    this.addEventListeners()
  }

  onWheel ({ deltaY }) {
    if (this.blockers.some(className => document.documentElement.classList.contains(className))) return

    this.target += deltaY * this.speed
  }

  onTouchStart (event) {
    if (this.blockers.some(className => document.documentElement.classList.contains(className))) return

    this.isDown = true

    this.y = event.touches ? event.touches[0].clientY : event.clientY
    this.position = this.current
  }

  onTouchMove (event) {
    if (!this.isDown) return

    const y = event.touches ? event.touches[0].clientY : event.clientY
    const distance = this.y - y

    this.target = this.position + (distance * 4)
  }

  onTouchEnd () {
    this.isDown = false
  }

  addObserver() {
    this.observer = new window.ResizeObserver(entries => {
      for (const entry of entries) {
        this.resize()
      }
    })

    this.observer.observe(this.wrapper)
  }

  addEventListeners () {
    if (!this.trigger) return

    // Pass { passive: true } to prevent scroll-blocking warnings
    this.trigger.addEventListener('wheel', this.onWheelBound, { passive: true })
    this.trigger.addEventListener('touchstart', this.onTouchStartBound, { passive: true })
    this.trigger.addEventListener('touchmove', this.onTouchMoveBound, { passive: true })
    this.trigger.addEventListener('touchend', this.onTouchEndBound, { passive: true })

    this.trigger.addEventListener('mousedown', this.onTouchStartBound)
    this.trigger.addEventListener('mousemove', this.onTouchMoveBound)
    this.trigger.addEventListener('mouseup', this.onTouchEndBound)
  }

  removeEventListeners () {
    if (!this.trigger) return

    this.trigger.removeEventListener('wheel', this.onWheelBound)
    this.trigger.removeEventListener('touchstart', this.onTouchStartBound)
    this.trigger.removeEventListener('touchmove', this.onTouchMoveBound)
    this.trigger.removeEventListener('touchend', this.onTouchEndBound)

    this.trigger.removeEventListener('mousedown', this.onTouchStartBound)
    this.trigger.removeEventListener('mousemove', this.onTouchMoveBound)
    this.trigger.removeEventListener('mouseup', this.onTouchEndBound)
  }

  update () {
    this.target = clamp(this.target, 0, this.limit)
    this.current = lerp(this.current, this.target, this.easing)

    this.element.style.transform = `translate3d(0, -${this.current + 60}px, 0)`
  }

  resize() {
    if (this.wrapper && this.element) {
      this.limit = this.wrapper.clientHeight - this.element.clientHeight
    }
  }
}