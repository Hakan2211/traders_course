import React, { useCallback, useEffect, useRef, useState } from 'react'
import type p5 from 'p5'
import P5Sketch from '@/components/mdx_components/2d_environment/p5Sketch/p5SketchContainer'
import { cn } from '@/lib/utils'

type TradeSide = 'buy' | 'sell'

interface TradeRow {
  id: number
  timestampSec: number
  timeLabel: string
  price: number
  size: number
  side: TradeSide
  y: number
  alpha: number
  flash: number // 0..1 pulse for big trades
}

interface Bubble {
  id: number
  timestampSec: number
  price: number
  size: number
  side: TradeSide
  age: number
  ttl: number
  glow: number // 0..1 for aggression pulse
}

type Scenario = 'Neutral' | 'Momentum' | 'Absorption' | 'Exhaustion' | 'Replay'

interface MetricsSnapshot {
  printsPerSec: number
  buyRatio: number // 0..1 over rolling window
  cumulativeDelta: number
  scenario: Scenario
  burstActive: boolean
}

export const TapeReading2D: React.FC = () => {
  // Controls (learner HUD)
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState(1) // 0.25..2x animation rate
  const [showBubbles, setShowBubbles] = useState(true)
  const [showDeltaBar, setShowDeltaBar] = useState(true)
  const [minSizeFilter, setMinSizeFilter] = useState(0) // BTC
  const [highlightBig, setHighlightBig] = useState(true)
  const [scenario, setScenario] = useState<Scenario>('Neutral')

  // Refs for p5 access (avoid re-creating sketch)
  const isPlayingRef = useRef(isPlaying)
  const speedRef = useRef(speed)
  const showBubblesRef = useRef(showBubbles)
  const showDeltaBarRef = useRef(showDeltaBar)
  const minSizeFilterRef = useRef(minSizeFilter)
  const highlightBigRef = useRef(highlightBig)
  const scenarioRef = useRef<Scenario>(scenario)
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])
  useEffect(() => {
    speedRef.current = speed
  }, [speed])
  useEffect(() => {
    showBubblesRef.current = showBubbles
  }, [showBubbles])
  useEffect(() => {
    showDeltaBarRef.current = showDeltaBar
  }, [showDeltaBar])
  useEffect(() => {
    minSizeFilterRef.current = minSizeFilter
  }, [minSizeFilter])
  useEffect(() => {
    highlightBigRef.current = highlightBig
  }, [highlightBig])
  useEffect(() => {
    scenarioRef.current = scenario
  }, [scenario])

  // Metrics for HTML overlay (updated from sketch)
  const metricsRef = useRef<MetricsSnapshot>({
    printsPerSec: 0,
    buyRatio: 0.5,
    cumulativeDelta: 0,
    scenario,
    burstActive: false,
  })
  const [metricsUI, setMetricsUI] = useState<MetricsSnapshot>(
    metricsRef.current,
  )
  useEffect(() => {
    const iv = setInterval(() => {
      setMetricsUI({ ...metricsRef.current })
    }, 200)
    return () => clearInterval(iv)
  }, [])

  // Developer-facing defaults (kept inside sketch but exposed via scenarios)
  const BIG_TRADE_THRESHOLD = 1.2 // BTC equivalent for highlight pulse
  const PRICE_DECIMALS = 1

  const sketch = useCallback(
    (p: p5, parentEl: HTMLDivElement) => {
      // Layout
      let width = parentEl.clientWidth
      let height = parentEl.clientHeight
      const margin = { top: 36, right: 24, bottom: 64, left: 24 }
      const gap = 18
      // Reserve space at the bottom for the HTML control panel so canvas content
      // (rows/bubbles) never collides with the delta bar and controls overlay.
      const controlsReserve = 110 // px
      const inner = () => ({
        x: margin.left,
        y: margin.top,
        w: width - margin.left - margin.right,
        h: height - margin.top - margin.bottom,
      })
      // Panels (70% rows, 30% bubbles)
      const panels = () => {
        const r = inner()
        const leftW = Math.floor(r.w * 0.7) - gap / 2
        const rightW = r.w - leftW - gap
        return {
          left: { x: r.x, y: r.y, w: leftW, h: r.h },
          right: { x: r.x + leftW + gap, y: r.y, w: rightW, h: r.h },
        }
      }

      // Theme
      // const bg = { r: 10, g: 13, b: 16 };
      const txtBuy = { r: 0, g: 255, b: 154 } // #00ff9a
      const txtSell = { r: 255, g: 78, b: 78 } // #ff4e4e
      const grid = { r: 48, g: 56, b: 68 }
      const neutral = { r: 24, g: 28, b: 34 }

      // Price baseline for y mapping in bubbles
      let midPrice = 48630.0
      let priceDrift = 0

      // Data buffers
      let nextId = 1
      const rows: TradeRow[] = []
      const bubbles: Bubble[] = []
      const recentTimes: number[] = [] // seconds for last ~3s
      const recentSides: TradeSide[] = []
      const recentBuySellWindow: { t: number; side: TradeSide }[] = []
      let cumulativeDelta = 0

      // Spawn rhythm
      let nextSpawn = 0 // seconds until next trade
      const sampleExp = (ratePerSec: number) => {
        const u = Math.max(1e-6, Math.random())
        return -Math.log(u) / Math.max(1e-6, ratePerSec)
      }

      // Scenario engine
      function getScenarioParams(s: Scenario): {
        tradeRate: number
        buyBias: number
        avgSize: number
        sizeJitter: number
      } {
        switch (s) {
          case 'Momentum':
            return {
              tradeRate: 8,
              buyBias: 0.72,
              avgSize: 0.48,
              sizeJitter: 0.6,
            }
          case 'Absorption':
            return {
              tradeRate: 9,
              buyBias: 0.32,
              avgSize: 0.55,
              sizeJitter: 0.7,
            }
          case 'Exhaustion':
            return {
              tradeRate: 3,
              buyBias: 0.5,
              avgSize: 0.35,
              sizeJitter: 0.4,
            }
          case 'Replay':
            return {
              tradeRate: 10,
              buyBias: 0.62,
              avgSize: 0.5,
              sizeJitter: 0.8,
            }
          case 'Neutral':
          default:
            return {
              tradeRate: 6,
              buyBias: 0.5,
              avgSize: 0.42,
              sizeJitter: 0.55,
            }
        }
      }

      // Visual state
      const rowHeight = 22
      let scrollSpeedPxPerSec = 120 // updated from scenario rate
      let aggressionTint = 0 // -1 (sell) .. +1 (buy)
      let burstTimer = 0 // sec
      let streakSide: TradeSide | null = null
      let streakCount = 0

      // Metrics
      let logicalTime = 0 // sec
      const rollingWindowSecForRate = 3
      const burstWindowSec = 0.2

      function formatTime(tsSec: number) {
        const date = new Date(tsSec * 1000)
        const hh = String(date.getHours()).padStart(2, '0')
        const mm = String(date.getMinutes()).padStart(2, '0')
        const ss = String(date.getSeconds()).padStart(2, '0')
        const ms = String(date.getMilliseconds()).padStart(3, '0')
        return `${hh}:${mm}:${ss}.${ms}`
      }

      function clamp(v: number, lo: number, hi: number) {
        return Math.max(lo, Math.min(hi, v))
      }

      function lerp(a: number, b: number, t: number) {
        return a + (b - a) * t
      }

      function easeOutQuad(t: number) {
        return 1 - (1 - t) * (1 - t)
      }
      function easeInCubic(t: number) {
        return t * t * t
      }

      function spawnTrade() {
        const params = getScenarioParams(scenarioRef.current)
        const minSz = Math.max(0, minSizeFilterRef.current)
        const side: TradeSide = Math.random() < params.buyBias ? 'buy' : 'sell'
        const sizeBase =
          params.avgSize + (Math.random() * 2 - 1) * params.sizeJitter * 0.5
        const size = Math.max(0.02, sizeBase + Math.random() * 0.4)

        // Random walk price around mid
        priceDrift += (Math.random() - 0.5) * 0.4
        priceDrift = clamp(priceDrift, -8, 8)
        const price = midPrice + priceDrift + (Math.random() - 0.5) * 0.8

        // Filtered by size (for display)
        if (size < minSz) {
          return // skip visual spawn, keep rhythm
        }

        const yStart = inner().y + inner().h - rowHeight - 6
        const now = logicalTime
        const id = nextId++
        const row: TradeRow = {
          id,
          timestampSec: now,
          timeLabel: formatTime(now),
          price: Number(price.toFixed(PRICE_DECIMALS)),
          size: Number(size.toFixed(3)),
          side,
          y: yStart,
          alpha: 0, // fade-in
          flash: highlightBigRef.current && size >= BIG_TRADE_THRESHOLD ? 1 : 0,
        }
        rows.push(row)
        if (rows.length > 220) rows.splice(0, rows.length - 220)

        if (showBubblesRef.current) {
          const bub: Bubble = {
            id,
            timestampSec: now,
            price,
            size,
            side,
            age: 0,
            ttl: 6, // seconds; keep long enough to traverse the strip
            glow: side === 'buy' ? 1 : 1,
          }
          bubbles.push(bub)
          if (bubbles.length > 240) bubbles.splice(0, bubbles.length - 240)
        }

        // Stats
        cumulativeDelta += side === 'buy' ? size : -size
        recentTimes.push(now)
        recentSides.push(side)
        recentBuySellWindow.push({ t: now, side })

        // Keep windows bounded
        const cutoff = now - rollingWindowSecForRate
        while (recentTimes.length && recentTimes[0] < cutoff)
          recentTimes.shift()
        while (recentBuySellWindow.length && recentBuySellWindow[0].t < cutoff)
          recentBuySellWindow.shift()
        if (recentSides.length > 600)
          recentSides.splice(0, recentSides.length - 600)

        // Burst detection (N trades in < burstWindowSec)
        const burstCutoff = now - burstWindowSec
        let burstCount = 0
        for (let i = recentTimes.length - 1; i >= 0; i--) {
          if (recentTimes[i] >= burstCutoff) burstCount++
          else break
        }
        if (burstCount >= 7) {
          burstTimer = 0.35 // flash
        }

        // Streak detection
        if (streakSide === side) {
          streakCount++
        } else {
          streakSide = side
          streakCount = 1
        }
      }

      function updateSpawn(dt: number) {
        const params = getScenarioParams(scenarioRef.current)
        const effectiveRate = params.tradeRate * speedRef.current // trades per second
        // Target scroll speed so that average spacing keeps readable cadence
        scrollSpeedPxPerSec = lerp(
          scrollSpeedPxPerSec,
          // Aim for >= rowHeight spacing to prevent overlap
          clamp(rowHeight * effectiveRate * 1.2, 40, 420),
          0.08,
        )
        // Exponential inter-arrival
        nextSpawn -= dt
        while (nextSpawn <= 0) {
          spawnTrade()
          nextSpawn += sampleExp(effectiveRate)
        }
      }

      function updateRows(dt: number) {
        // Scroll upward and fade
        for (let i = rows.length - 1; i >= 0; i--) {
          const r = rows[i]
          r.y -= scrollSpeedPxPerSec * dt
          // Smooth fade-in only; top-edge fade handled in drawRows
          r.alpha = clamp(r.alpha + dt * 2.0, 0, 1)
          if (r.y < inner().y - rowHeight - 10) {
            rows.splice(i, 1)
          } else {
            // diminish big flash
            if (r.flash > 0) r.flash = clamp(r.flash - dt * 2.0, 0, 1)
          }
        }
        // De-overlap pass: ensure a minimum vertical spacing between adjacent rows
        const minSpacing = Math.max(18, rowHeight * 0.95)
        for (let i = rows.length - 2; i >= 0; i--) {
          const upper = rows[i]
          const lower = rows[i + 1]
          if (lower.y - upper.y < minSpacing) {
            upper.y = lower.y - minSpacing
          }
        }
      }

      function updateBubbles(dt: number) {
        if (!showBubblesRef.current) return
        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i]
          b.age += dt
          b.glow = clamp(b.glow - dt * 1.2, 0, 1)
          if (b.age >= b.ttl) {
            bubbles.splice(i, 1)
          }
        }
      }

      function updateAggression(dt: number) {
        // Ratio in recent 3s
        const buyCount = recentBuySellWindow.filter(
          (x) => x.side === 'buy',
        ).length
        const total = Math.max(1, recentBuySellWindow.length)
        const buyRatio = buyCount / total
        const target = buyRatio * 2 - 1 // -1..+1
        aggressionTint = lerp(aggressionTint, target, 0.08)
        // Update metricsRef
        const printsPerSec = recentTimes.length / rollingWindowSecForRate
        metricsRef.current.printsPerSec = printsPerSec
        metricsRef.current.buyRatio = buyRatio
        metricsRef.current.cumulativeDelta = cumulativeDelta
        metricsRef.current.scenario = scenarioRef.current
        metricsRef.current.burstActive = burstTimer > 0
        // Timers
        if (burstTimer > 0) burstTimer = Math.max(0, burstTimer - dt)
      }

      function drawBackground() {
        // Base
        // p.background(bg.r, bg.g, bg.b);
        p.clear()
        const r = inner()
        // Aggression overlay tint
        const gBuy = { r: 0, g: 60, b: 40 }
        const gSell = { r: 70, g: 30, b: 30 }
        const tint =
          aggressionTint >= 0
            ? lerp(0, 1, Math.abs(aggressionTint))
            : lerp(0, 1, Math.abs(aggressionTint))
        const col =
          aggressionTint >= 0
            ? { r: gBuy.r, g: gBuy.g, b: gBuy.b }
            : { r: gSell.r, g: gSell.g, b: gSell.b }
        p.noStroke()
        p.fill(col.r, col.g, col.b, clamp(28 * Math.abs(aggressionTint), 0, 60))
        p.rect(r.x, r.y, r.w, r.h, 14)

        // Subtle vertical gradient overlay (cinematic)
        // const ctx = p.drawingContext as CanvasRenderingContext2D;
        // const grad = ctx.createLinearGradient(0, 0, 0, height);
        // grad.addColorStop(0, 'rgba(255,255,255,0.02)');
        // grad.addColorStop(1, 'rgba(0,0,0,0.35)');
        // ctx.fillStyle = grad;
        // ctx.fillRect(0, 0, width, height);
      }

      function drawPanels() {
        const r = panels()
        // Panel cards and grid
        p.noStroke()
        p.fill(18, 20, 26, 180) // Reduced alpha
        p.rect(r.left.x, r.left.y, r.left.w, r.left.h, 12)
        p.rect(r.right.x, r.right.y, r.right.w, r.right.h, 12)
        // Gridlines
        p.stroke(grid.r, grid.g, grid.b, 140)
        p.strokeWeight(1)
        const leftVisibleBottom = r.left.y + r.left.h - controlsReserve - 8
        for (let y = r.left.y + 8; y < leftVisibleBottom; y += 22) {
          p.line(r.left.x + 10, y, r.left.x + r.left.w - 10, y)
        }
        const rightVisibleBottom = r.right.y + r.right.h - controlsReserve - 8
        for (let y = r.right.y + 8; y < rightVisibleBottom; y += 28) {
          p.line(r.right.x + 8, y, r.right.x + r.right.w - 8, y)
        }
      }

      function drawRows() {
        const r = panels()
        const left = r.left
        // Headers
        p.noStroke()
        p.fill(220)
        p.textSize(12)
        p.textAlign(p.LEFT, p.BOTTOM)
        p.text('Time', left.x + 14, left.y + 18)
        p.text('Price', left.x + 140, left.y + 18)
        p.text('Size', left.x + 240, left.y + 18)
        p.text('Side', left.x + 310, left.y + 18)

        // Clip to panel
        p.push()
        p.rectMode(p.CORNER)
        p.noStroke()
        const _pAny_rows = p as any
        if (_pAny_rows.beginClip) {
          _pAny_rows.beginClip()
          p.rect(left.x, left.y + 22, left.w, left.h - 26 - controlsReserve, 10)
          _pAny_rows.endClip && _pAny_rows.endClip()
        }

        // Rows
        for (let i = 0; i < rows.length; i++) {
          const rw = rows[i]
          const y = rw.y
          if (y < left.y + 18 || y > left.y + left.h - 6) continue
          // Fade only near the top edge to avoid mid-panel fade-out
          const topFadeStart = left.y + 64
          const topFadeEnd = left.y + 28
          const edgeAlpha =
            y <= topFadeStart
              ? clamp(
                  (y - topFadeEnd) / Math.max(1, topFadeStart - topFadeEnd),
                  0,
                  1,
                )
              : 1
          const alpha = Math.floor(255 * rw.alpha * edgeAlpha)
          const isBuy = rw.side === 'buy'

          // Optional flash pulse for big trades
          if (rw.flash > 0) {
            const a = Math.floor(140 * rw.flash)
            p.fill(255, 255, 255, a)
            p.rect(left.x + 8, y - rowHeight * 0.5, left.w - 16, rowHeight, 6)
          }

          // Text glow color
          const baseCol = isBuy ? txtBuy : txtSell
          p.fill(baseCol.r, baseCol.g, baseCol.b, alpha)
          p.textSize(rw.size >= BIG_TRADE_THRESHOLD ? 13 : 12)
          p.textAlign(p.LEFT, p.CENTER)
          p.text(rw.timeLabel, left.x + 14, y)
          p.text(rw.price.toFixed(PRICE_DECIMALS), left.x + 140, y)
          p.text(rw.size.toFixed(3) + ' BTC', left.x + 240, y)
          p.text(isBuy ? 'Buy' : 'Sell', left.x + 310, y)
        }
        p.pop()
      }

      function drawBubbles() {
        if (!showBubblesRef.current) return
        const r = panels()
        const right = r.right
        // Axes info: y = price mapping; x = time (latest at right)
        const timeWindow = 6 // sec visible across the strip
        const now = logicalTime
        // Baseline and labels
        p.noStroke()
        p.fill(220)
        p.textSize(12)
        p.textAlign(p.LEFT, p.BOTTOM)
        p.text('Heat (Price–Time)', right.x + 12, right.y + 18)

        // Clip
        p.push()
        const _pAny_bub = p as any
        if (_pAny_bub.beginClip) {
          _pAny_bub.beginClip()
          p.rect(
            right.x,
            right.y + 22,
            right.w,
            right.h - 26 - controlsReserve,
            10,
          )
          _pAny_bub.endClip && _pAny_bub.endClip()
        }

        // Additive blend for glow
        const ctx = p.drawingContext as any
        const prev = ctx.globalCompositeOperation
        ctx.globalCompositeOperation = 'lighter'

        for (let i = 0; i < bubbles.length; i++) {
          const b = bubbles[i]
          const t = clamp((now - b.timestampSec) / timeWindow, 0, 1)
          // Right -> left travel with safe margins so dots don't hug edges
          const x = right.x + 24 + (right.w - 48) * (1 - t)
          // Map price around midPrice into panel
          const priceSpan = 36 // +- range for y
          const dy = clamp(
            (b.price - midPrice + priceSpan) / (priceSpan * 2),
            0,
            1,
          )
          const y = right.y + 28 + (right.h - 56) * (1 - dy)
          const sideCol = b.side === 'buy' ? txtBuy : txtSell
          const rPix = clamp(5 + b.size * 18, 5, 30)
          const alpha = Math.floor(200 * (1 - b.age / Math.max(0.001, b.ttl)))
          p.noStroke()
          p.fill(sideCol.r, sideCol.g, sideCol.b, alpha)
          p.circle(x, y, rPix)
          // Halo
          p.fill(sideCol.r, sideCol.g, sideCol.b, Math.floor(alpha * 0.35))
          p.circle(x, y, rPix * 1.8)
        }
        ctx.globalCompositeOperation = prev
        p.pop()
      }

      function drawDeltaBar() {
        if (!showDeltaBarRef.current) return
        const r = inner()
        const cx = r.x + r.w / 2
        // Position the delta bar above the bottom overlay controls
        const controlsReserve = 96 // px of vertical space for the control panel
        const y = r.y + r.h - controlsReserve
        const w = r.w * 0.9
        const hBar = 10
        p.noStroke()
        p.fill(neutral.r, neutral.g, neutral.b, 200)
        p.rect(cx - w / 2, y, w, hBar, 6)
        const norm = clamp(cumulativeDelta / 40, -1, 1) // normalize by rough scale
        if (norm >= 0) {
          p.fill(txtBuy.r, txtBuy.g, txtBuy.b, 220)
          p.rect(cx, y, (w / 2) * norm, hBar, 6)
        } else {
          p.fill(txtSell.r, txtSell.g, txtSell.b, 220)
          p.rect(cx + (w / 2) * norm, y, (w / 2) * -norm, hBar, 6)
        }
        p.noStroke()
        p.fill(220)
        p.textSize(11)
        p.textAlign(p.CENTER, p.TOP)
        p.text('Delta', cx, y + 14)
      }

      function drawTopHUD() {
        const r = inner()
        const left = panels().left
        // Stats computed from metricsRef to keep consistency
        const printsPerSec = metricsRef.current.printsPerSec
        const ratio = metricsRef.current.buyRatio
        const delta = metricsRef.current.cumulativeDelta
        // Top-left block
        p.noStroke()
        p.fill(18, 22, 30, 220)
        p.rect(r.x + 8, r.y - 28, 240, 24, 8)
        p.fill(225)
        p.textSize(12)
        p.textAlign(p.LEFT, p.CENTER)
        p.text(
          `Prints/s: ${printsPerSec.toFixed(2)}   Buy%: ${(ratio * 100).toFixed(
            0,
          )}%   CVD: ${delta.toFixed(2)}`,
          r.x + 16,
          r.y - 16,
        )
        // Scenario label top-right
        const label = `Scenario: ${scenarioRef.current}`
        const tw = p.textWidth(label) + 24
        p.fill(18, 22, 30, 220)
        p.rect(r.x + r.w - tw - 8, r.y - 28, tw, 24, 8)
        p.fill(225)
        p.textAlign(p.LEFT, p.CENTER)
        p.text(label, r.x + r.w - tw, r.y - 16)
      }

      function drawBurstFX() {
        if (burstTimer <= 0) return
        const r = inner()
        const k = burstTimer / 0.35
        const a = Math.floor(220 * k)
        const ctx = p.drawingContext as CanvasRenderingContext2D
        const grad = ctx.createRadialGradient(
          r.x + r.w * 0.5,
          r.y + r.h * 0.5,
          10,
          r.x + r.w * 0.5,
          r.y + r.h * 0.5,
          Math.max(r.w, r.h) * 0.6,
        )
        grad.addColorStop(0, `rgba(255,255,255,${0.08 * k})`)
        grad.addColorStop(1, `rgba(255,255,255,0)`)
        ctx.fillStyle = grad
        ctx.fillRect(r.x, r.y, r.w, r.h)
        // 'BURST' tag
        p.noStroke()
        p.fill(255, 255, 255, a)
        p.textSize(18)
        p.textAlign(p.CENTER, p.CENTER)
        p.text('BURST', r.x + r.w / 2, r.y + 24)
      }

      p.setup = () => {
        p.createCanvas(width, height)
        p.frameRate(60)
        // Start spawn immediately
        nextSpawn = 0
      }

      p.draw = () => {
        const dtRaw = Math.min(1 / 20, Math.max(0, p.deltaTime / 1000)) // clamp dt for safety
        const dt = isPlayingRef.current ? dtRaw * speedRef.current : 0
        logicalTime += dt

        // Shake effect on burst
        if (burstTimer > 0) {
          const j = (1 - burstTimer / 0.35) * 3
          p.translate((Math.random() - 0.5) * j, (Math.random() - 0.5) * j)
        }

        updateSpawn(dt)
        updateRows(dt)
        updateBubbles(dt)
        updateAggression(dt)

        p.resetMatrix() // do not affect HUD
        drawBackground()
        drawPanels()
        drawRows()
        drawBubbles()
        drawDeltaBar()
        drawTopHUD()
        drawBurstFX()
      }

      p.windowResized = () => {
        width = parentEl.clientWidth
        height = parentEl.clientHeight
        p.resizeCanvas(width, height)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <div className="w-full h-full">
      {/* Top HTML HUD (lightweight, mirrors canvas stats) */}
      <div
        className={cn(
          'absolute z-10 top-2 left-1/2 -translate-x-1/2',
          'pointer-events-none flex items-center gap-3 text-[12px] text-slate-200',
        )}
      >
        <span className="bg-slate-900/70 border border-slate-700 rounded-md px-2 py-1 pointer-events-auto">
          Prints/s: {metricsUI.printsPerSec.toFixed(2)}
        </span>
        <span className="bg-slate-900/70 border border-slate-700 rounded-md px-2 py-1 pointer-events-auto">
          Buy Ratio: {(metricsUI.buyRatio * 100).toFixed(0)}%
        </span>
        <span className="bg-slate-900/70 border border-slate-700 rounded-md px-2 py-1 pointer-events-auto">
          CVD: {metricsUI.cumulativeDelta.toFixed(2)}
        </span>
        {metricsUI.burstActive ? (
          <span className="bg-amber-600/90 border border-amber-500 rounded-md px-2 py-1 pointer-events-auto">
            BURST
          </span>
        ) : null}
      </div>

      {/* Bottom controls HUD */}
      <div
        className={cn(
          'absolute z-10 bottom-3 left-1/2 -translate-x-1/2',
          'pointer-events-auto flex items-center gap-2 flex-wrap justify-center',
          'bg-slate-900/80 border border-slate-700 rounded-xl shadow px-3 py-2',
        )}
      >
        <button
          type="button"
          onClick={() => setIsPlaying((v) => !v)}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium',
            isPlaying
              ? 'bg-emerald-600/80 hover:bg-emerald-600 text-white'
              : 'bg-slate-700/80 hover:bg-slate-700 text-slate-100',
          )}
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <div className="flex items-center gap-2 px-2">
          <label htmlFor="tr2d-speed" className="text-xs text-slate-200/90">
            Speed
          </label>
          <input
            id="tr2d-speed"
            type="range"
            min={0.25}
            max={2}
            step={0.25}
            value={speed}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSpeed(Number(e.target.value))
            }
            className="accent-blue-400"
            aria-label="Playback speed"
          />
          <div className="text-xs text-slate-100/80 w-10 text-right">
            {speed.toFixed(2)}x
          </div>
        </div>

        <div className="flex items-center gap-2 px-2">
          <label htmlFor="tr2d-minsize" className="text-xs text-slate-200/90">
            Min Size
          </label>
          <input
            id="tr2d-minsize"
            type="range"
            min={0}
            max={2}
            step={0.05}
            value={minSizeFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setMinSizeFilter(Number(e.target.value))
            }
            className="accent-blue-400"
            aria-label="Filter by minimum trade size"
          />
          <div className="text-xs text-slate-100/80 w-16 text-right">
            {minSizeFilter.toFixed(2)} BTC
          </div>
        </div>

        <div className="flex items-center gap-2 px-2">
          <label htmlFor="tr2d-bubbles" className="text-xs text-slate-200/90">
            Bubbles
          </label>
          <input
            id="tr2d-bubbles"
            type="checkbox"
            checked={showBubbles}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setShowBubbles(e.target.checked)
            }
            className="accent-teal-400"
            aria-label="Toggle bubbles"
          />
        </div>

        <div className="flex items-center gap-2 px-2">
          <label htmlFor="tr2d-delta" className="text-xs text-slate-200/90">
            Delta Bar
          </label>
          <input
            id="tr2d-delta"
            type="checkbox"
            checked={showDeltaBar}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setShowDeltaBar(e.target.checked)
            }
            className="accent-teal-400"
            aria-label="Toggle delta bar"
          />
        </div>

        <div className="flex items-center gap-2 px-2">
          <label htmlFor="tr2d-highlight" className="text-xs text-slate-200/90">
            Big Trades
          </label>
          <input
            id="tr2d-highlight"
            type="checkbox"
            checked={highlightBig}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setHighlightBig(e.target.checked)
            }
            className="accent-rose-400"
            aria-label="Highlight big trades"
          />
        </div>

        <div className="flex items-center gap-2 px-2">
          <label htmlFor="tr2d-scenario" className="text-xs text-slate-200/90">
            Scenario
          </label>
          <select
            id="tr2d-scenario"
            value={scenario}
            onChange={(e) => setScenario(e.target.value as Scenario)}
            className="bg-slate-800 text-slate-100 text-xs rounded-md px-2 py-1 border border-slate-700"
            aria-label="Scenario selection"
          >
            <option>Neutral</option>
            <option>Momentum</option>
            <option>Absorption</option>
            <option>Exhaustion</option>
            <option>Replay</option>
          </select>
        </div>
      </div>

      <P5Sketch sketch={sketch} />
    </div>
  )
}

export default TapeReading2D
