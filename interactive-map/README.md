# Digital Twin — Interactive Building Map

Interactive 3D visualization of a building fitted with live environmental sensors, built to accompany the "Cost-Effective Digital Twin for Existing Buildings" thesis project. The 3D model is explorable in real time, with clickable points of interest exposing live-style telemetry (temperature, occupancy, air quality, and edge-gateway status) for each sensor node.

## Overview

- Orbit/pan/zoom around the 3D building model (Isometric / Top / Plan camera presets)
- Clickable sensor markers open a detail panel with readings, 7-day trend logs, and hardware metadata
- Built as a standalone Vite + Three.js app

## Sensor Nodes

- 3x DHT21 temperature sensors (facade, core, corridor zones)
- PIR motion / occupancy sensor
- ENS160 air quality (CO2eq / TVOC) node
- Edge gateway (Raspberry Pi Zero 2 W) status

## Built with

- HTML, CSS, JavaScript
- [Three.js](https://threejs.org/)
- [GSAP](https://greensock.com/gsap/)
- [Vite](https://vitejs.dev/)

## Running locally

```bash
npm install
npm run dev
```

## Author

- [Vinay Dilip J](https://www.linkedin.com/in/vinay-dilip/)
