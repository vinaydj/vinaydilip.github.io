import './style.css'
import Experience from './Experience/Experience.js'

// Create experience instance
const experience = new Experience(document.querySelector(".experience-canvas"))

// Make experience globally accessible
window.experience = experience

// Logo Click -> Reset Camera View
const logoReset = document.getElementById('logoReset')
if (logoReset) {
  logoReset.addEventListener('click', () => {
    if (experience.camera && typeof experience.camera.resetToDefault === 'function') {
      experience.camera.resetToDefault(true)
    }
  })
}

console.log('🚀 Experience initialized')