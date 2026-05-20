#!/usr/bin/env node
// Run: node scripts/generate-icons.js
// Creates simple SVG-based PNG placeholders for PWA icons

const fs = require('fs')
const path = require('path')

const sizes = [192, 512]

const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ECDC4"/>
      <stop offset="100%" stop-color="#9B6BC4"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#g)"/>
  <text x="50%" y="55%" font-size="${size * 0.5}" text-anchor="middle" dominant-baseline="middle">🎈</text>
</svg>`

const iconsDir = path.join(__dirname, '../public/icons')
fs.mkdirSync(iconsDir, { recursive: true })

sizes.forEach((s) => {
  const filePath = path.join(iconsDir, `icon-${s}.svg`)
  fs.writeFileSync(filePath, svg(s))
  console.log(`Generated ${filePath}`)
})

console.log('Icons generated. For production, convert SVG to PNG.')
