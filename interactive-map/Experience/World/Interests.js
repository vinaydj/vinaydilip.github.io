import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Interests {
  constructor(containerElement = document) {
    this.container = containerElement
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.camera = this.experience.camera
    this.debug = this.experience.debug
    this.device = this.sizes.device
    this.scrolling = this.experience.scrolling

    // Track active listener references for clean component unmounting
    this.cleanupListeners = []

    this.onDeviceSwitch = (device) => {
      this.device = device
      this.updatePanelStyle()
    }
    this.sizes.on('switchdevice', this.onDeviceSwitch)

    // Setup
    this.points = []
    this.raycaster = new THREE.Raycaster()
    this.setInterests()
    this.showInfos()
    this.setRaycasterDebugger()
  }

  updatePanelStyle() {
    this.infoPanelRightStyle = this.device === 'desktop' ? '-33%' : '-100%'
  }

  setInterests() {
    this.points = [
      // 🌡️ Temperature Sensor 1 - Window Side (DHT21 P1)
      {
        id: 'dht21-1',
        position: new THREE.Vector3(-0.01025, -0.00585, -0.01193),
        element: this.container.querySelector('.temp1')
      },
      // 🌡️ Temperature Sensor 2 - Room Centre (DHT21 P2)
      {
        id: 'dht21-2',
        position: new THREE.Vector3(-0.01027, -0.00575, -0.02188),
        element: this.container.querySelector('.temp2')
      },
      // 🌡️ Temperature Sensor 3 - Corridor Boundary (DHT21 P3)
      {
        id: 'dht21-3',
        position: new THREE.Vector3(-0.01026, -0.00575, -0.03168),
        element: this.container.querySelector('.temp3')
      },
      // 🚶 Motion / Occupancy Sensor - Room Core
      {
        id: 'pir-core',
        position: new THREE.Vector3(-0.02770, -0.00135, -0.02568),
        element: this.container.querySelector('.motion')
      },
      // 🏭 Air Quality Node - ENS160 VOC/CO2eq
      {
        id: 'ens160-aq',
        position: new THREE.Vector3(-0.00772, -0.01480, -0.01848),
        element: this.container.querySelector('.co2')
      },
      // 🖥️ Edge Processing Hub - Pi Zero 2 W / FastAPI
      {
        id: 'hub-server',
        position: new THREE.Vector3(-0.02527, -0.00964, -0.00976),
        element: this.container.querySelector('.server')
      }
    ]
  }

  setRaycasterDebugger() {
    const onDebugClick = (event) => {
      if (event.altKey) {
        const mouse = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        )

        const targetCamera =
          this.camera?.orthographicCamera ||
          this.camera?.perspectiveCamera ||
          this.camera?.instance

        if (!targetCamera) return

        this.raycaster.setFromCamera(mouse, targetCamera)
        const intersects = this.raycaster.intersectObjects(this.scene.children, true)

        if (intersects.length > 0) {
          const hit = intersects[0].point
          const code = `new THREE.Vector3(${hit.x.toFixed(5)}, ${hit.y.toFixed(5)}, ${hit.z.toFixed(5)})`

          console.log(
            `%c📍 Clicked 3D Coordinate:`, 'color: #00ff00; font-weight: bold;',
            `\n${code}`
          )

          if (navigator.clipboard) {
            navigator.clipboard.writeText(code)
            console.log('%c📋 Copied to clipboard!', 'color: #38bdf8;')
          }
        }
      }
    }

    window.addEventListener('click', onDebugClick)
    this.cleanupListeners.push(() => window.removeEventListener('click', onDebugClick))
  }

  showInfos() {
    const infoPanel = this.container.querySelector('.info-panel')
    const closeIcn = this.container.querySelector('.close')

    // Query inner UI elements once
    const dom = {
      image: this.container.querySelector('.info-panel-image'),
      logo: this.container.querySelector('.info-panel-logo'),
      title: this.container.querySelector('.info-panel-title'),
      lead: this.container.querySelector('.info-panel-lead'),
      desc: this.container.querySelector('.info-panel-description'),
      content: this.container.querySelector('.info-panel-content'),
      statToday: this.container.querySelector('.info-panel-stat-today'),
      stat2Box: this.container.querySelector('.info-panel-stat2'),
      stat2Label: this.container.querySelector('.info-panel-stat2-label'),
      stat2Value: this.container.querySelector('.info-panel-stat2-value'),
      stat3Box: this.container.querySelector('.info-panel-stat3'),
      stat3Label: this.container.querySelector('.info-panel-stat3-label'),
      stat3Value: this.container.querySelector('.info-panel-stat3-value'),
      meta: this.container.querySelector('.info-panel-meta'),
      website: this.container.querySelector('.info-panel-website')
    }

    // Condenses a 7-value Mon-Sun `schedule` array into 3 compact stats so
    // the panel never needs to scroll. Numeric readings (temperature, ppm,
    // % CPU) get a 7-day average + peak; non-numeric ones (Active/Standby)
    // get an active-day count instead, with no third stat.
    const summarizeSchedule = (schedule) => {
      const today = schedule[schedule.length - 1]
      const nums = schedule.map((s) => {
        const m = String(s).match(/-?\d+(\.\d+)?/)
        return m ? parseFloat(m[0]) : null
      })
      if (nums.every((n) => n !== null)) {
        const unitMatch = String(schedule[0]).match(/[^\d.\-]+$/)
        const unit = unitMatch ? unitMatch[0] : ''
        const avg = nums.reduce((a, b) => a + b, 0) / nums.length
        const peak = Math.max(...nums)
        return {
          today,
          secondLabel: '7d Avg',
          second: avg.toFixed(1) + unit,
          thirdLabel: '7d Peak',
          third: peak.toFixed(1) + unit
        }
      }
      const activeCount = schedule.filter((s) => /active/i.test(s)).length
      return {
        today,
        secondLabel: 'Active Days',
        second: `${activeCount}/7`,
        thirdLabel: null,
        third: null
      }
    }

    this.updatePanelStyle()

    // Professional architectural telemetry database
    const sensorData = [
      {
        logo: import.meta.env.BASE_URL + 'images/icon-sensor.svg',
        title: '🌡️ Temperature Sensor #1 — Facade Zone',
        lead: 'Current: 22.4°C | Range: 18.0–24.0°C | Status: ✅ Calibrated',
        description: `Perimeter zone sensor monitoring solar radiation exposure and thermal gradient dynamics along the window boundary. Integrated into the 1R1C model for boundary heat-flux verification. <br><br>
          📊 <b>7-Day Free-Float Profile:</b><br>
          • 24h Mean: 21.85°C (±0.45 K)<br>
          • Solar Gain Peak: 24.20°C (14:30 CEST)<br>
          • Surface Convective Factor: h_c ≈ 3.2 W/m²K<br><br>
          ⚙️ <b>Thermal Twin Response:</b> Boundary conditions nominal; passive thermal mass damping active.`,
        schedule: ['22.4°C', '22.1°C', '21.8°C', '21.5°C', '21.9°C', '22.2°C', '22.6°C'],
        meta: ['Node ID: ESP32-DHT21-P1', 'Sampling: 2s (2-min resample)'],
        website: '#'
      },
      {
        logo: import.meta.env.BASE_URL + 'images/icon-sensor.svg',
        title: '🌡️ Temperature Sensor #2 — Core Zone',
        lead: 'Current: 21.8°C | Range: 19.0–23.0°C | Status: ✅ Nominal',
        description: `Core ambient temperature node tracking steady-state indoor operational temperature ($T_i$). Serves as primary calibration target for the lumped capacitance $C_i$ decay model. <br><br>
          📊 <b>Calibration Baseline:</b><br>
          • Time Constant: τ ≈ 239.7 h<br>
          • Model Fit: RMSE 0.92°C (75.8% within ±1.0 K)<br>
          • Thermal Resistance ($R_{env}$): 0.218 K/W<br><br>
          ⚙️ <b>State:</b> Equilibrium maintained without mechanical active load.`,
        schedule: ['21.8°C', '21.5°C', '21.2°C', '20.9°C', '21.3°C', '21.6°C', '22.0°C'],
        meta: ['Node ID: ESP32-DHT21-P2', 'ADC Reference: 3.3V Regulated'],
        website: '#'
      },
      {
        logo: import.meta.env.BASE_URL + 'images/icon-sensor.svg',
        title: '🌡️ Temperature Sensor #3 — Corridor Interface',
        lead: 'Current: 20.5°C | Range: 18.0–22.0°C | Status: ⚠️ Draft Identified',
        description: `Positioned at the entrance boundary to detect air exchange and infiltration losses during door openings and occupant circulation. <br><br>
          📊 <b>Infiltration Telemetry:</b><br>
          • Infiltration Heat Loss: ~18.4 W/K<br>
          • 7-Day Minimum: 19.20°C (06:00 CEST)<br>
          • Mean Stratification Delta: ΔT = 1.35 K<br><br>
          ⚙️ <b>Envelope Status:</b> Moderate air infiltration during peak transit hours.`,
        schedule: ['20.5°C', '20.2°C', '19.9°C', '19.6°C', '20.0°C', '20.3°C', '20.8°C'],
        meta: ['Node ID: ESP32-DHT21-P3', 'Calibration Offset: -0.15 K'],
        website: '#'
      },
      {
        logo: import.meta.env.BASE_URL + 'images/icon-sensor.svg',
        title: '🚶 PIR Motion & Occupancy Sensor',
        lead: 'Current: Occupied (1 Active) | Status: 🟢 High Sensitivity',
        description: `Passive Infrared (PIR) sensor tracking instantaneous occupant movement at a 2.0 m ceiling mount. Fused with gas sensor trend derivatives for continuous occupancy estimation. <br><br>
          📊 <b>Spatial Activity Metrics:</b><br>
          • Event Count (Last 24h): 48 activations<br>
          • Dynamic Filter: 5-sample moving average window<br>
          • Internal Heat Gain Factor: 80 W sensible per occupant<br><br>
          ⚙️ <b>Automation State:</b> Telemetry streaming active; edge filtering online.`,
        schedule: ['Active', 'Active', 'Standby', 'Standby', 'Active', 'Active', 'Active'],
        meta: ['Node ID: PIR-HC-SR501', 'Detection Radius: 120° / 6.0 m'],
        website: '#'
      },
      {
        logo: import.meta.env.BASE_URL + 'images/icon-sensor.svg',
        title: '🏭 ENS160 Air Quality & CO₂eq Node',
        lead: 'Current: 412 ppm CO₂eq | TVOC: 0.12 mg/m³ | Status: ✅ Optimal',
        description: `Multi-gas metal-oxide sensor monitoring indoor air quality indices, ambient volatile organic compounds, and estimated metabolic carbon dioxide accumulation. <br><br>
          📊 <b>Air Quality Profile:</b><br>
          • Baseline CO₂eq: 412 ppm (Safe threshold < 800 ppm)<br>
          • Air Quality Index (AQI-U): 1 (Excellent)<br>
          • Compensation: Dynamic temperature-compensated via AHT21<br><br>
          ⚙️ <b>Ventilation Requirement:</b> Baseline natural infiltration rate sufficient.`,
        schedule: ['412 ppm', '398 ppm', '405 ppm', '420 ppm', '435 ppm', '428 ppm', '415 ppm'],
        meta: ['Node ID: ENS160-I2C-0x53', 'Protocol: I2C Fast-Mode (400 kHz)'],
        website: '#'
      },
      {
        logo: import.meta.env.BASE_URL + 'images/icon-sensor.svg',
        title: '🖥️ Central Edge Gateway — Pi Zero 2 W',
        lead: 'CPU: 34% | RAM: 218MB/512MB | Status: 🟢 Online (127d Uptime)',
        description: `Central edge unit running asynchronous ingestion pipelines, SQLite time-series storage, and REST telemetry endpoints for real-time 3D synchronization. <br><br>
          📊 <b>Infrastructure Metrics:</b><br>
          • Ingestion Rate: 0.5 Hz polling with 2-min aggregate rollups<br>
          • Stack: FastAPI / SQLite / Nginx / Three.js WebSockets<br>
          • Active Sensor Nodes: 6 / 6 Connected<br><br>
          ⚙️ <b>Health:</b> Operating temperature 42.1°C; zero packet drop over 168 hours.`,
        schedule: ['34% CPU', '31% CPU', '36% CPU', '29% CPU', '42% CPU', '38% CPU', '33% CPU'],
        meta: ['Gateway: RPi-Zero-2W-HUB', 'Network: Static 192.168.1.120'],
        website: '#'
      }
    ]

    // Populate and open panel on click
    const openPanel = (data) => {
      if (this.scrolling) this.scrolling.target = 0
      if (!infoPanel) return

      // Apply open state using class and style
      infoPanel.classList.add('open')
      infoPanel.style.right = '0'
      if (dom.content) dom.content.scrollTop = 0

      if (dom.image) {
        if (data.image) {
          dom.image.src = data.image
          dom.image.style.display = ''
        } else {
          dom.image.removeAttribute('src')
          dom.image.style.display = 'none'
        }
      }
      if (dom.logo && data.logo) dom.logo.src = data.logo
      if (dom.title) dom.title.innerHTML = data.title
      if (dom.lead) dom.lead.innerHTML = data.lead
      // Keep only the lead sentence(s), drop the long bulleted breakdown --
      // panel has no scroll, so the description has to stay short.
      if (dom.desc) dom.desc.innerHTML = String(data.description || '').split('<br><br>')[0]

      if (data.schedule) {
        const stats = summarizeSchedule(data.schedule)
        if (dom.statToday) dom.statToday.innerHTML = stats.today
        if (dom.stat2Label) dom.stat2Label.innerHTML = stats.secondLabel
        if (dom.stat2Value) dom.stat2Value.innerHTML = stats.second
        if (dom.stat3Box) dom.stat3Box.style.display = stats.thirdLabel ? '' : 'none'
        if (dom.stat3Label) dom.stat3Label.innerHTML = stats.thirdLabel || ''
        if (dom.stat3Value) dom.stat3Value.innerHTML = stats.third || ''
      }

      if (dom.meta) dom.meta.innerHTML = (data.meta || []).join(' · ')

      if (dom.website) dom.website.href = data.website || '#'
    }

    // Close panel function
    const closePanel = () => {
      if (!infoPanel) return
      infoPanel.classList.remove('open')
      infoPanel.style.right = this.infoPanelRightStyle
    }

    // Bind points of interest dynamically
    this.points.forEach((pt, index) => {
      if (!pt.element) return
      const clickHandler = () => openPanel(sensorData[index])
      pt.element.addEventListener('click', clickHandler)
      this.cleanupListeners.push(() => pt.element.removeEventListener('click', clickHandler))
    })

    // Panel close handler
    if (closeIcn && infoPanel) {
      closeIcn.addEventListener('click', closePanel)
      this.cleanupListeners.push(() => closeIcn.removeEventListener('click', closePanel))
    }

    // Close panel on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape' && infoPanel && infoPanel.classList.contains('open')) {
        closePanel()
      }
    }
    document.addEventListener('keydown', escapeHandler)
    this.cleanupListeners.push(() => document.removeEventListener('keydown', escapeHandler))

    // Isolate scrolling to prevent window and 3D camera pan/orbit bleed
    const isolateScroll = (e) => {
      e.stopPropagation();
      // Allow scrolling within panel
      const panel = e.currentTarget;
      const scrollable = panel.querySelector('.info-panel-content');
      if (scrollable) {
        const maxScroll = scrollable.scrollHeight - scrollable.clientHeight;
        if (maxScroll <= 0) {
          e.preventDefault();
        }
      }
    };
  }

  resize() { }

  update() {
    const targetCamera = this.camera?.instance || this.camera?.perspectiveCamera
    if (!targetCamera) return

    // Ensure camera matrices are updated before projecting
    targetCamera.updateMatrixWorld()
    targetCamera.updateProjectionMatrix()

    for (const point of this.points) {
      if (!point.element) continue

      const screenPosition = point.position.clone()
      screenPosition.project(targetCamera)

      // Check if point is behind the perspective camera
      if (targetCamera.isPerspectiveCamera && screenPosition.z > 1) {
        point.element.classList.remove('visible')
        continue
      }

      const translateX = screenPosition.x * this.sizes.width * 0.5
      const translateY = -screenPosition.y * this.sizes.height * 0.5

      point.element.classList.add('visible')
      point.element.style.transform = `translate(-50%, -50%) translate(${translateX}px, ${translateY}px)`
    }
  }

  destroy() {
    this.cleanupListeners.forEach((cleanup) => cleanup())
    this.cleanupListeners = []
  }
}