/**
 * Generate 10 tabbar PNG icons (81x81, transparent).
 * No native deps; pure JS PNG encoder + simple raster drawing.
 *
 * Output:
 *  static/tabbar/tab_home_off.png / tab_home_on.png
 *  static/tabbar/tab_crops_off.png / tab_crops_on.png
 *  static/tabbar/tab_mall_off.png / tab_mall_on.png
 *  static/tabbar/tab_ai_off.png / tab_ai_on.png
 *  static/tabbar/tab_me_off.png / tab_me_on.png
 */

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const OUT_DIR = path.join(__dirname, '..', 'static', 'tabbar')
const SIZE = 81

const COLORS = {
  off: hexToRgba('#98A2B3'),
  on: hexToRgba('#0B6D3B')
}

function hexToRgba(hex, a = 255) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return { r, g, b, a }
}

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v
}

function makeCanvas(w, h) {
  const data = Buffer.alloc(w * h * 4, 0) // RGBA
  return { w, h, data }
}

function setPixel(c, x, y, rgba) {
  x = x | 0
  y = y | 0
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return
  const i = (y * c.w + x) * 4
  c.data[i] = rgba.r
  c.data[i + 1] = rgba.g
  c.data[i + 2] = rgba.b
  c.data[i + 3] = rgba.a
}

function blendPixel(c, x, y, rgba, alpha /*0..1*/) {
  x = x | 0
  y = y | 0
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return
  alpha = clamp(alpha, 0, 1)
  const i = (y * c.w + x) * 4
  const a0 = c.data[i + 3] / 255
  const a1 = (rgba.a / 255) * alpha
  const ao = a1 + a0 * (1 - a1)
  if (ao <= 0) return
  const r0 = c.data[i]
  const g0 = c.data[i + 1]
  const b0 = c.data[i + 2]
  const r1 = rgba.r
  const g1 = rgba.g
  const b1 = rgba.b
  c.data[i] = Math.round((r1 * a1 + r0 * a0 * (1 - a1)) / ao)
  c.data[i + 1] = Math.round((g1 * a1 + g0 * a0 * (1 - a1)) / ao)
  c.data[i + 2] = Math.round((b1 * a1 + b0 * a0 * (1 - a1)) / ao)
  c.data[i + 3] = Math.round(ao * 255)
}

function drawLine(c, x0, y0, x1, y1, rgba, thickness = 5) {
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy
  const r = Math.max(1, Math.floor(thickness / 2))
  while (true) {
    drawDisk(c, x0, y0, r, rgba)
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x0 += sx
    }
    if (e2 < dx) {
      err += dx
      y0 += sy
    }
  }
}

function drawDisk(c, cx, cy, r, rgba) {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      const d2 = x * x + y * y
      if (d2 <= r * r) setPixel(c, cx + x, cy + y, rgba)
    }
  }
}

function drawRect(c, x, y, w, h, rgba) {
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) setPixel(c, x + xx, y + yy, rgba)
  }
}

function drawRoundRectOutline(c, x, y, w, h, radius, rgba, thickness = 5) {
  // outline via lines + quarter-circles
  const r = radius
  const t = thickness
  // straight segments
  drawLine(c, x + r, y, x + w - r, y, rgba, t)
  drawLine(c, x + r, y + h, x + w - r, y + h, rgba, t)
  drawLine(c, x, y + r, x, y + h - r, rgba, t)
  drawLine(c, x + w, y + r, x + w, y + h - r, rgba, t)
  // corners
  drawArc(c, x + r, y + r, r, Math.PI, 1.5 * Math.PI, rgba, t)
  drawArc(c, x + w - r, y + r, r, 1.5 * Math.PI, 0, rgba, t)
  drawArc(c, x + w - r, y + h - r, r, 0, 0.5 * Math.PI, rgba, t)
  drawArc(c, x + r, y + h - r, r, 0.5 * Math.PI, Math.PI, rgba, t)
}

function drawArc(c, cx, cy, r, a0, a1, rgba, thickness = 5) {
  const steps = Math.max(16, Math.floor(r * 3))
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps
    const x = Math.round(cx + Math.cos(a) * r)
    const y = Math.round(cy + Math.sin(a) * r)
    drawDisk(c, x, y, Math.max(1, Math.floor(thickness / 2)), rgba)
  }
}

function iconHome(c, rgba, filled) {
  const t = 5
  const cx = 40
  // roof
  drawLine(c, cx - 18, 38, cx, 22, rgba, t)
  drawLine(c, cx, 22, cx + 18, 38, rgba, t)
  // walls
  drawRoundRectOutline(c, cx - 14, 36, 28, 26, 6, rgba, t)
  if (filled) {
    // simple fill
    for (let y = 40; y <= 58; y++) {
      for (let x = cx - 11; x <= cx + 11; x++) blendPixel(c, x, y, rgba, 0.20)
    }
  }
}

function iconSprout(c, rgba, filled) {
  const t = 5
  const cx = 40
  // stem
  drawLine(c, cx, 56, cx, 34, rgba, t)
  // leaves
  drawArc(c, cx - 8, 36, 10, 0.2 * Math.PI, 1.2 * Math.PI, rgba, t)
  drawArc(c, cx + 8, 36, 10, -0.2 * Math.PI, 0.8 * Math.PI, rgba, t)
  // soil
  drawLine(c, cx - 18, 58, cx + 18, 58, rgba, t)
  if (filled) {
    for (let y = 38; y <= 54; y++) {
      for (let x = cx - 10; x <= cx + 10; x++) blendPixel(c, x, y, rgba, 0.16)
    }
  }
}

function iconBag(c, rgba, filled) {
  const t = 5
  const cx = 40
  drawRoundRectOutline(c, cx - 16, 30, 32, 34, 8, rgba, t)
  // handle
  drawArc(c, cx, 30, 12, Math.PI, 0, rgba, t)
  if (filled) {
    for (let y = 36; y <= 60; y++) {
      for (let x = cx - 12; x <= cx + 12; x++) blendPixel(c, x, y, rgba, 0.18)
    }
  }
}

function iconRobot(c, rgba, filled) {
  const t = 5
  const cx = 40
  // antenna
  drawLine(c, cx, 20, cx, 26, rgba, t)
  drawDisk(c, cx, 18, 4, rgba)
  // head
  drawRoundRectOutline(c, cx - 18, 26, 36, 34, 10, rgba, t)
  // eyes
  drawDisk(c, cx - 7, 42, 3, rgba)
  drawDisk(c, cx + 7, 42, 3, rgba)
  if (filled) {
    for (let y = 32; y <= 56; y++) {
      for (let x = cx - 13; x <= cx + 13; x++) blendPixel(c, x, y, rgba, 0.16)
    }
  }
}

function iconUser(c, rgba, filled) {
  const t = 5
  const cx = 40
  // head
  drawArc(c, cx, 34, 11, 0, 2 * Math.PI, rgba, t)
  // shoulders
  drawArc(c, cx, 56, 18, Math.PI, 2 * Math.PI, rgba, t)
  if (filled) {
    for (let y = 42; y <= 62; y++) {
      for (let x = cx - 14; x <= cx + 14; x++) blendPixel(c, x, y, rgba, 0.14)
    }
  }
}

function pngEncode(canvas) {
  const { w, h, data } = canvas
  // filter type 0 per row
  const raw = Buffer.alloc((w * 4 + 1) * h)
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0
    data.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4)
  }
  const idat = zlib.deflateSync(raw, { level: 9 })

  const chunks = []
  chunks.push(pngSig())
  chunks.push(chunk('IHDR', ihdr(w, h)))
  chunks.push(chunk('IDAT', idat))
  chunks.push(chunk('IEND', Buffer.alloc(0)))
  return Buffer.concat(chunks)
}

function pngSig() {
  return Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
}

function ihdr(w, h) {
  const b = Buffer.alloc(13)
  b.writeUInt32BE(w, 0)
  b.writeUInt32BE(h, 4)
  b[8] = 8 // bit depth
  b[9] = 6 // color type RGBA
  b[10] = 0
  b[11] = 0
  b[12] = 0
  return b
}

function chunk(type, data) {
  const t = Buffer.from(type)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0)
  return Buffer.concat([len, t, data, crc])
}

// CRC32
const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c >>> 0
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function writeIcon(name, drawFn, state) {
  const canvas = makeCanvas(SIZE, SIZE)
  const color = COLORS[state]
  const filled = state === 'on'
  drawFn(canvas, color, filled)
  const out = pngEncode(canvas)
  fs.writeFileSync(path.join(OUT_DIR, name), out)
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  writeIcon('tab_home_off.png', iconHome, 'off')
  writeIcon('tab_home_on.png', iconHome, 'on')
  writeIcon('tab_crops_off.png', iconSprout, 'off')
  writeIcon('tab_crops_on.png', iconSprout, 'on')
  writeIcon('tab_mall_off.png', iconBag, 'off')
  writeIcon('tab_mall_on.png', iconBag, 'on')
  writeIcon('tab_ai_off.png', iconRobot, 'off')
  writeIcon('tab_ai_on.png', iconRobot, 'on')
  writeIcon('tab_me_off.png', iconUser, 'off')
  writeIcon('tab_me_on.png', iconUser, 'on')
  console.log('[ok] generated tabbar icons in', OUT_DIR)
}

main()

