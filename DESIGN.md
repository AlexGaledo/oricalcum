---
name: Oricalcum
colors:
  bg: "#0b0c0e"
  surface: "#111316"
  surface-2: "#16191d"
  line: "rgba(255, 255, 255, 0.08)"
  line-strong: "rgba(255, 255, 255, 0.16)"
  text: "#e7e9ec"
  text-dim: "rgba(231, 233, 236, 0.6)"
  text-faint: "rgba(231, 233, 236, 0.35)"
  accent: "#10A37F"
  accent-rgb: "16, 163, 127"
  accent-presets:
    - label: "Mono"
      value: "#10A37F"
    - label: "Oracle"
      value: "#8B5CF6"
    - label: "Cyber"
      value: "#06B6D4"
    - label: "Solar"
      value: "#F59E0B"
  accent-swatches:
    - "#10A37F"
    - "#8B5CF6"
    - "#06B6D4"
    - "#F59E0B"
    - "#EF4444"
    - "#FFFFFF"
  dot-selected: "rgba(0, 0, 0, 0.78)"
  dot-light: "#ffffff"
  edge-temp: "rgba(255, 255, 255, 0.04)"
  minimap-vp-fill: "rgba(255, 255, 255, 0.05)"
  minimap-node-fill: "rgba(var(--accent-rgb), 0.4)"
  connect-banner-shadow: "rgba(var(--accent-rgb), 0.25)"
  ghost-bg: "rgba(var(--accent-rgb), 0.08)"
  cta-bg: "rgba(var(--accent-rgb), 0.08)"
  cta-bg-hover: "rgba(var(--accent-rgb), 0.16)"
  tool-btn-active-bg: "rgba(var(--accent-rgb), 0.15)"
  node-accent-shadow: "rgba(var(--accent-rgb), calc(0.18 * var(--glow-strength)))"
  node-accent-shadow-hover: "rgba(var(--accent-rgb), calc(0.32 * var(--glow-strength)))"
  node-accent-shadow-selected: "rgba(var(--accent-rgb), calc(0.5 * var(--glow-strength)))"
  node-accent-shadow-source: "rgba(var(--accent-rgb), calc(0.7 * var(--glow-strength)))"
  edge-shadow: "rgba(var(--accent-rgb), calc(0.4 * var(--glow-strength)))"
  edge-orbit-shadow: "rgba(var(--accent-rgb), 0.9)"
  bg-grid-line: "rgba(255, 255, 255, 0.04)"
  bg-paper-line: "rgba(255, 255, 255, 0.05)"
  bg-collage-radial: "rgba(var(--accent-rgb), 0.04)"
  tweaks-panel-bg: "rgba(22, 25, 29, 0.78)"
  tweaks-border: "rgba(255, 255, 255, 0.08)"
  tweaks-field-bg: "rgba(255, 255, 255, 0.04)"
  tweaks-field-border: "rgba(255, 255, 255, 0.1)"
  tweaks-field-border-focus: "rgba(255, 255, 255, 0.3)"
  tweaks-field-bg-focus: "rgba(255, 255, 255, 0.08)"
  tweaks-slider-track: "rgba(255, 255, 255, 0.12)"
  tweaks-slider-thumb: "#ffffff"
  tweaks-slider-thumb-border: "rgba(0, 0, 0, 0.12)"
  tweaks-seg-bg: "rgba(255, 255, 255, 0.06)"
  tweaks-seg-thumb-bg: "rgba(255, 255, 255, 0.14)"
  tweaks-seg-thumb-shadow: "rgba(0, 0, 0, 0.3)"
  tweaks-toggle-off: "rgba(255, 255, 255, 0.15)"
  tweaks-toggle-on: "#34c759"
  tweaks-toggle-thumb: "#ffffff"
  tweaks-chip-shadow: "rgba(0, 0, 0, 0.3)"
  tweaks-chip-shadow-hover: "rgba(0, 0, 0, 0.4)"
  tweaks-chip-border-selected: "rgba(255, 255, 255, 0.85)"
  panel-shadow: "rgba(0, 0, 0, 0.6)"
  brand-meta: "#10A37F"
typography:
  font-ui:
    fontFamily: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif
    variable: --next-font-inter
  font-mono:
    fontFamily: JetBrains Mono, ui-monospace, Menlo, Consolas, monospace
    variable: --next-font-jbm
  node:
    fontFamily: "{typography.font-mono.fontFamily}"
    fontSize: 12px
    letterSpacing: 0.02em
    textTransform: lowercase
  brand-name:
    fontFamily: "{typography.font-mono.fontFamily}"
    fontSize: 11.5px
    fontWeight: "600"
    letterSpacing: 0.12em
  brand-version:
    fontFamily: "{typography.font-mono.fontFamily}"
    fontSize: 10px
    letterSpacing: 0.08em
  tool-tip:
    fontSize: 10.5px
  tool-tip-kbd:
    fontSize: 9.5px
  status-chip:
    fontSize: 10.5px
  status-chip-k:
    fontSize: 9.5px
    letterSpacing: 0.08em
  empty-pre:
    fontSize: 10px
    letterSpacing: 0.16em
    textTransform: uppercase
  empty-title:
    fontSize: 14px
    letterSpacing: 0.02em
  empty-cta:
    fontSize: 11px
    letterSpacing: 0.06em
  empty-hint:
    fontSize: 10.5px
  docpanel-title:
    fontSize: 18px
    letterSpacing: 0.01em
  docpanel-body:
    fontSize: 12px
    lineHeight: 1.55
  docpanel-meta:
    fontSize: 10px
  iconbtn-pill:
    fontSize: 11px
  theme-section-label:
    fontSize: 9.5px
    letterSpacing: 0.08em
    textTransform: lowercase
  theme-preset:
    fontSize: 11px
  shape-flyout-label:
    fontSize: 9.5px
    letterSpacing: 0.06em
  shape-pill:
    fontSize: 11px
  minimap-label:
    fontSize: 9.5px
    letterSpacing: 0.06em
  connect-banner:
    fontSize: 11px
  connect-banner-esc:
    fontSize: 9.5px
  empty-frame:
    fontSize: 10px
  ghost:
    fontSize: 11px
    textTransform: lowercase
  tweaks-header:
    fontSize: 12px
    fontWeight: "600"
    letterSpacing: 0.01em
  tweaks-label:
    fontWeight: "500"
  tweaks-value:
    letterSpacing: 0
  tweaks-section:
    fontSize: 10px
    fontWeight: "600"
    letterSpacing: 0.06em
    textTransform: uppercase
  tweaks-field:
    fontSize: inherit
rounded:
  none: 0px
  node: 4px
  btn-sm: 5px
  chip: 6px
  tooltip: 6px
  tool-btn: 7px
  status-chip: 7px
  docpanel-btn: 5px
  theme-popover: 8px
  shape-flyout: 10px
  toolbar: 10px
  tweaks-panel: 14px
  pill: 999px
  full: 50%
spacing:
  base: 8px
  xs: 4px
  sm: 6px
  md: 10px
  lg: 12px
  xl: 14px
  gutter: 16px
  margin: 24px
  toolbar-x: 16px
  statusbar-x: 16px
  statusbar-y: 16px
  topbar-height: 48px
  topbar-padding-x: 24px
  empty-inset: 60px
  node-padding-x: 14px
  port-size: 10px
  port-offset: -5px
  tweaks-panel-right: 16px
  tweaks-panel-bottom: 16px
  tweaks-panel-width: 280px
  tweaks-body-padding-x: 14px
  tweaks-body-padding-bottom: 14px
  tweaks-header-padding-x: 8px
  tweaks-header-padding-right: 8px
  tweaks-header-padding-left: 14px
  docpanel-width: 360px
  docpanel-header-padding-x: 14px
  docpanel-body-padding: 14px
  minimap-width: 200px
  minimap-height: 140px
  minimap-padding: 8px
  minimap-right: 16px
  minimap-bottom: 16px
elevation:
  surface-default:
    background: "{colors.surface}"
    border: "{colors.line}"
    border-radius: "{rounded.toolbar}"
    shadow: 0 12px 40px rgba(0,0,0,0.6)
  surface-raised:
    background: "{colors.surface-2}"
    border: "{colors.line}"
    border-radius: "{rounded.chip}"
  glass-tweaks:
    background: "{colors.tweaks-panel-bg}"
    border: "{colors.tweaks-border}"
    border-radius: "{rounded.tweaks-panel}"
    backdrop-filter: blur(24px) saturate(160%)
    shadow: 0 12px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04) inset
  tooltip:
    background: "{colors.surface}"
    border: "{colors.line}"
    border-radius: "{rounded.tooltip}"
    padding: 4px 8px
  panel:
    background: "{colors.surface}"
    border: "{colors.line}"
    border-radius: "{rounded.theme-popover}"
    padding: 12px
    shadow: 0 12px 40px rgba(0,0,0,0.6)
  node-default:
    background: "{colors.surface}"
    border: 1px solid "{colors.accent}"
    border-radius: "{rounded.node}"
    shadow: |
      0 0 0 0 rgba(var(--accent-rgb), 0.0),
      0 0 calc(12px * var(--glow-strength)) rgba(var(--accent-rgb), calc(0.18 * var(--glow-strength)))
  node-hover:
    shadow: |
      0 0 0 1px rgba(var(--accent-rgb), 0.4),
      0 0 calc(20px * var(--glow-strength)) rgba(var(--accent-rgb), calc(0.32 * var(--glow-strength)))
  node-selected:
    border: 1.5px solid "{colors.accent}"
    shadow: |
      0 0 0 1.5px var(--accent),
      0 0 calc(28px * var(--glow-strength)) rgba(var(--accent-rgb), calc(0.5 * var(--glow-strength)))
  node-connect-source:
    shadow: |
      0 0 0 1.5px var(--accent),
      0 0 calc(36px * var(--glow-strength)) rgba(var(--accent-rgb), calc(0.7 * var(--glow-strength)))
  edge:
    stroke: "{colors.accent}"
    stroke-width: 1.4
    opacity: 0.85
    filter: drop-shadow(0 0 calc(6px * var(--glow-strength)) rgba(var(--accent-rgb), calc(0.4 * var(--glow-strength))))
  edge-temp:
    stroke-dasharray: 4 4
    opacity: 0.6
  connect-banner:
    background: "{colors.surface}"
    border: 1px solid "{colors.accent}"
    border-radius: "{rounded.pill}"
    shadow: 0 0 24px rgba(var(--accent-rgb), 0.25)
  iconbtn-pill:
    background: "{colors.surface}"
    border: 1px solid "{colors.line}"
    border-radius: "{rounded.pill}"
  shape-flyout:
    background: "{colors.surface}"
    border: 1px solid "{colors.line}"
    border-radius: "{rounded.shape-flyout}"
    shadow: 0 12px 40px rgba(0,0,0,0.6)
motion:
  duration-fast: 0.08s
  duration-default: 0.12s
  duration-slow: 0.16s
  duration-panel: 0.22s
  duration-segment: 0.15s
  easing-default: ease
  easing-panel: cubic-bezier(0.3, 0.7, 0.4, 1)
  easing-segment: cubic-bezier(0.3, 0.7, 0.4, 1)
  easing-bounce: cubic-bezier(0.3, 0.7, 0.4, 1)
  easing-spring: cubic-bezier(0.3, 0.7, 0.4, 1)
  node-enter:
    duration: 0.16s
    easing: cubic-bezier(0.3, 0.7, 0.4, 1)
    from:
      opacity: 0
      scale: 0.92
    to:
      opacity: 1
      scale: 1
  hover-transitions:
    background: 0.12s ease
    color: 0.12s ease
    border-color: 0.12s ease
    opacity: 0.12s ease
  node-transitions:
    box-shadow: 0.16s ease
    transform: 0.08s ease
  port-transition:
    opacity: 0.12s
  docpanel-transition:
    transform: 0.22s cubic-bezier(0.3, 0.7, 0.4, 1)
  edge-flow:
    duration: 2s
    iteration: infinite
    timing: linear
  edge-pulse:
    duration: 2s
    iteration: infinite
    timing: ease-in-out
  connect-pulse:
    duration: 1.2s
    iteration: infinite
    timing: ease-in-out
components:
  canvas:
    position: absolute
    inset: 0
    overflow: hidden
    cursor: default
    background-color: "{colors.bg}"
  canvas-bg-grid:
    background-image: |
      linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
  canvas-bg-paper:
    background-image: linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
  canvas-bg-collage:
    background-image: |
      linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px),
      radial-gradient(circle at 50% 50%, rgba(var(--accent-rgb), 0.04), transparent 60%)
  stage:
    position: absolute
    top: 0
    left: 0
    width: 1px
    height: 1px
    transform-origin: 0 0
  node-default:
    display: flex
    align-items: center
    justify-content: center
    padding: 0 14px
    border: 1px solid "{colors.accent}"
    border-radius: "{rounded.node}"
    background: "{colors.surface}"
    color: "{colors.text}"
    cursor: default
    user-select: none
  node-hexagon:
    background: transparent
    border-color: transparent
    clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)
  node-diamond:
    background: transparent
    border-color: transparent
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%)
  node-cloud:
    background: transparent
    border-color: transparent
    clip-path: custom bezier path
  node-document:
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)
  node-port:
    position: absolute
    top: 50%
    width: 10px
    height: 10px
    margin-top: -5px
    border-radius: 50%
    background: "{colors.bg}"
    border: 1.5px solid "{colors.accent}"
    cursor: crosshair
    opacity: 0
    transition: opacity 0.12s
  node-port-visible:
    opacity: 1
  edge-bezier:
    fill: none
    stroke: "{colors.accent}"
    stroke-width: 1.4
    opacity: 0.85
    cursor: pointer
  edge-flow:
    stroke-dasharray: 6 6
    animation: edge-flow 2s linear infinite
  edge-pulse:
    animation: edge-pulse 2s ease-in-out infinite
  edge-orbit-particle:
    fill: "{colors.accent}"
    r: 3.5px
  toolbar:
    position: fixed
    left: 16px
    top: 50%
    transform: translateY(-50%)
    display: flex
    flex-direction: column
    gap: 4px
    padding: 6px
    background: "{colors.surface}"
    border: 1px solid "{colors.line}"
    border-radius: "{rounded.toolbar}"
    z-index: 25
  tool-btn:
    width: 36px
    height: 36px
    border: 0
    border-radius: "{rounded.tool-btn}"
    background: transparent
    color: "{colors.text-dim}"
    cursor: pointer
    transition: background 0.12s, color 0.12s
  tool-btn-hover:
    background: "{colors.surface-2}"
    color: "{colors.text}"
  tool-btn-active:
    background: "{colors.tool-btn-active-bg}"
    color: "{colors.accent}"
  topbar:
    position: fixed
    top: 0
    left: 0
    right: 0
    height: 48px
    padding: 0 24px
    z-index: 30
    pointer-events: none
  statusbar:
    position: fixed
    bottom: 16px
    left: 16px
    display: flex
    gap: 6px
    z-index: 20
  status-chip:
    display: flex
    align-items: center
    gap: 6px
    height: 28px
    padding: 0 10px
    background: "{colors.surface}"
    border: 1px solid "{colors.line}"
    border-radius: "{rounded.status-chip}"
    font-size: 10.5px
    color: "{colors.text-dim}"
  iconbtn-pill:
    display: inline-flex
    align-items: center
    gap: 8px
    height: 28px
    padding: 0 10px
    border: 1px solid "{colors.line}"
    border-radius: "{rounded.pill}"
    background: "{colors.surface}"
    color: "{colors.text-dim}"
    font-size: 11px
    cursor: pointer
    transition: border-color 0.12s, color 0.12s
  iconbtn-pill-hover:
    border-color: "{colors.line-strong}"
    color: "{colors.text}"
  iconbtn-pill-active:
    border-color: "{colors.accent}"
    color: "{colors.text}"
  docpanel:
    position: fixed
    top: 0
    right: 0
    width: 360px
    height: 100vh
    background: "{colors.surface}"
    border-left: 1px solid "{colors.line}"
    z-index: 40
    display: flex
    flex-direction: column
    transform: translateX(100%)
    transition: transform 0.22s cubic-bezier(0.3, 0.7, 0.4, 1)
  docpanel-open:
    transform: translateX(0)
  minimap:
    position: fixed
    right: 16px
    bottom: 16px
    width: 200px
    height: 140px
    background: "{colors.surface}"
    border: 1px solid "{colors.line}"
    border-radius: "{rounded.theme-popover}"
    padding: 8px
    z-index: 20
  empty-state:
    border: 1px dashed "{colors.line}"
    border-radius: "{rounded.theme-popover}"
  connect-banner:
    position: fixed
    top: 64px
    left: 50%
    transform: translateX(-50%)
    display: inline-flex
    align-items: center
    gap: 10px
    padding: 8px 14px
    background: "{colors.surface}"
    border: 1px solid "{colors.accent}"
    border-radius: "{rounded.pill}"
    color: "{colors.text}"
    font-size: 11px
    z-index: 35
    shadow: 0 0 24px rgba(var(--accent-rgb), 0.25)
  ghost-spawn:
    position: fixed
    display: flex
    align-items: center
    justify-content: center
    border: 1px dashed "{colors.accent}"
    border-radius: "{rounded.node}"
    background: "{colors.ghost-bg}"
    color: "{colors.accent}"
    pointer-events: none
    z-index: 60
  tweaks-panel:
    position: fixed
    right: 16px
    bottom: 16px
    width: 280px
    max-height: calc(100vh - 32px)
    background: "{colors.tweaks-panel-bg}"
    color: "{colors.text}"
    border: 0.5px solid "{colors.tweaks-border}"
    border-radius: "{rounded.tweaks-panel}"
    backdrop-filter: blur(24px) saturate(160%)
    shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 40px rgba(0,0,0,0.6)
    display: flex
    flex-direction: column
    overflow: hidden
  tweaks-slider:
    width: 100%
    height: 4px
    margin: 6px 0
    border-radius: 999px
    background: "{colors.tweaks-slider-track}"
  tweaks-slider-thumb:
    width: 14px
    height: 14px
    border-radius: 50%
    background: "{colors.tweaks-slider-thumb}"
    border: 0.5px solid "{colors.tweaks-slider-thumb-border}"
    shadow: 0 1px 3px rgba(0,0,0,0.5)
  tweaks-toggle:
    width: 32px
    height: 18px
    border-radius: 999px
    border: 0
    background: "{colors.tweaks-toggle-off}"
    transition: background "0.15s"
    cursor: pointer
  tweaks-toggle-on:
    background: "{colors.tweaks-toggle-on}"
  tweaks-toggle-thumb:
    width: 14px
    height: 14px
    border-radius: 50%
    background: "{colors.tweaks-toggle-thumb}"
    shadow: 0 1px 2px rgba(0,0,0,0.5)
    transition: transform 0.15s
  tweaks-segmented-control:
    position: relative
    display: flex
    padding: 2px
    border-radius: 8px
    background: "{colors.tweaks-seg-bg}"
  tweaks-segmented-thumb:
    position: absolute
    top: 2px
    bottom: 2px
    border-radius: 6px
    background: "{colors.tweaks-seg-thumb-bg}"
    shadow: 0 1px 2px rgba(0,0,0,0.3)
    transition: left 0.15s cubic-bezier(0.3, 0.7, 0.4, 1), width 0.15s
  tweaks-color-chip:
    position: relative
    flex: 1
    height: 46px
    border: 0
    border-radius: 6px
    overflow: hidden
    cursor: pointer
    shadow: 0 0 0 0.5px rgba(255,255,255,0.12), 0 1px 2px rgba(0,0,0,0.3)
    transition: transform 0.12s cubic-bezier(0.3, 0.7, 0.4, 1), box-shadow 0.12s
  tweaks-color-chip-hover:
    transform: translateY(-1px)
    shadow: 0 0 0 0.5px rgba(255,255,255,0.25), 0 4px 10px rgba(0,0,0,0.4)
  tweaks-color-chip-selected:
    shadow: 0 0 0 1.5px rgba(255,255,255,0.85), 0 2px 6px rgba(0,0,0,0.5)
  icons-default:
    viewBox: 0 0 24 24
    fill: none
    stroke: currentColor
    stroke-width: 1.6
    stroke-linecap: round
    stroke-linejoin: round

---

## Brand & Style

Oricalcum is a visual systems canvas — a dark, minimalist environment for mapping nodes, edges, and themes. The brand personality is technical, precise, and cybernetic: the interface evokes a developer's IDE crossed with a modular synthesizer patch bay. Every pixel is engineered for clarity at small scales, with a monospace-first typography that signals structure and code-like rigor.

The aesthetic is **dark minimalist with accent-driven glow**. The interface recedes into the background, letting the node graph and its accent-colored connections command attention. The overall emotional response is one of focus, precision, and systematic clarity — a workspace that feels like an instrument rather than an application.

## Colors

The palette is aggressively dark with a single accent color that drives all visual energy. The accent is user-selectable, defaulting to an emerald/teal `#10A37F` (Mono theme), with alternatives for purple (Oracle), cyan (Cyber), amber (Solar), red, and white.

- **Background (`#0b0c0e`):** Near-black, almost indistinguishable from pure black. This is the canvas void.
- **Surfaces:** A two-step hierarchy — `surface` (`#111316`) for panels and toolbars, `surface-2` (`#16191d`) for hover states and secondary surfaces. The difference is barely perceptible, creating a subtle layer effect.
- **Lines:** Borders use extremely faint white — 8% opacity for standard (`line`), 16% for emphasized (`line-strong`). This keeps the UI visible without competing with nodes.
- **Text:** Three tiers of legibility — full-white `text` (`#e7e9ec`), dimmed at 60% opacity for secondary information, and faint at 35% for labels and hints. No pure white is used; even the brightest text retains a 6% gray cast for reduced eye strain.
- **Accent:** The single driving color. It tints node borders, edge strokes, glow effects, selection states, active tool buttons, the brand mark, and the CTA. The accent uses a CSS custom property `--accent-rgb` to enable `rgba()` alpha compositing for glow and hover effects.
- **Glow system:** A `--glow-strength` variable (default 1.2, range 0–120 in UI) scales the intensity of the neon-like halos around nodes, edges, and ports. At minimum, nodes appear flat and crisp; at maximum, they bloom with diffuse light.

## Typography

The default typeface is **JetBrains Mono**, a developer-oriented monospace font with ligatures and distinct glyph shapes. This is the voice of the product: technical, unambiguous, structured.

- **Brand name** uses monospace at 11.5px with 0.12em letter-spacing — tight but legible.
- **Node labels** are 12px monospace, lowercase, with subtle letter-spacing. The mono width ensures node dimensions are predictable.
- **Panels and overlays** use a mix: monospace for data readouts, UI system font (Inter) for navigation labels. Users can switch the entire interface to Inter via a tweak.
- **Font features** `ss01` and `cv11` are enabled globally for stylistic alternates and custom character variants.
- **Scale is deliberately small.** Most UI text sits between 9.5px and 12px. This is an information-dense workspace, not a reading app. Larger text is reserved for document panel titles (18px) and empty-state headings (14px).

## Layout & Spacing

The layout follows a **fixed-position chrome model** with an infinite canvas at its center.

- **Rhythm:** An 8px base grid governs all dimensions, gaps, and padding. Spacing values are consistently 2, 4, 6, 8, 10, 12, 14, 16, or 24 pixels.
- **Toolbar:** Vertically centered on the left edge, 16px from the viewport edge. A floating column of 36px × 36px icon buttons with 4px gaps and 6px internal padding.
- **Top bar:** Fixed to the top, 48px tall, pointer-events-none (with click-through children). Contains the brand mark, name, version, and action pills (theme, tweaks).
- **Status bar:** Bottom-left cluster of chips showing cursor coordinates, node/edge counts, and zoom controls. 28px tall, 16px from the bottom and left edges.
- **Tweaks panel:** Bottom-right floating glass panel, 280px wide. Draggable, clamped to viewport edges with 16px padding.
- **Document panel:** Right-side slide-in drawer, 360px wide, with a 0.22s slide transition.
- **Minimap:** Bottom-right, 200×140px, 16px from edges (behind the tweaks panel).

## Elevation & Depth

Depth is created through layered surfaces and glow rather than heavy shadows.

- **Layer 1 — Canvas:** Pure background (`#0b0c0e`), infinite, no elevation.
- **Layer 2 — Toolbar & status chips:** `surface` (`#111316`) with 1px 8%-opacity borders and no shadow. These sit flat against the canvas.
- **Layer 3 — Popovers & flyouts:** `surface` with stronger shadow (0 12px 40px rgba(0,0,0,0.6)) and `line` borders. These float above the chrome.
- **Layer 4 — Tweaks panel:** Glass-morphism surface at 78% opacity with `backdrop-filter: blur(24px) saturate(160%)`. A subtle inner highlight simulates light hitting the top edge.
- **Layer 5 — Document panel:** Full-height slide-in at `surface` with a left border separator.
- **Nodes** exist on their own depth plane, defined entirely by accent glow rather than shadow. A node at rest has a subtle 12px glow. Selected nodes bloom to 28px; connect-source nodes bloom to 36px.

## Shapes

The shape language is geometric and precise, reflecting the product's analytical nature.

- **Nodes:** Default 4px radius rectangles. Special shapes include hexagon (6-sided polygon), diamond (rotated square), cloud (organic bezier blob), circle, and document (dog-eared rectangle with 14px fold). Polygon shapes use SVG clip-paths with sharp corners — no rounding.
- **Ports:** Perfect 10px circles, centered on the node edge with 5px overhang. Hidden by default, revealed on node hover or when the connect tool is active.
- **Toolbar buttons:** 7px radius, 36×36px icons with 18px glyphs. Active state uses accent-tinted background.
- **Pills:** Infinite radius for icon buttons, status chips, and the connect banner. These are the only fully rounded elements.
- **Tweaks controls:** Sliders use flat 4px tracks with 14px circular thumbs. Segmented controls use 8px containers with 6px sliding thumbs. Toggles are 32×18px pill shapes with a 14px circular knob.

## Motion & Animation

Motion is minimal, fast, and functional. Durations range from 80ms to 220ms — never slow enough to feel sluggish, never instant enough to feel jarring.

- **Hover states** transition in 120ms with a simple `ease` timing. Background, color, border-color, and opacity all use this cadence.
- **Nodes** animate in with a 160ms scale-up (0.92→1) and fade-in (0→1) using Framer Motion. The easing curve `[0.3, 0.7, 0.4, 1]` gives a slight spring-like overshoot.
- **Node interactions** use split timing: box-shadow transitions in 160ms (slower, for the glow), transform in 80ms (instant, for drag feedback).
- **Panel slide** (doc panel) uses 220ms with the same spring-like cubic-bezier.
- **Port visibility** fades in 120ms — fast enough to feel responsive, slow enough to interpolate smoothly.
- **Edge animations** are optional, user-toggleable, and come in three styles:
  - **Flow:** Dashed line with a 2s linear stroke-dashoffset animation — like data packets traveling along a wire.
  - **Pulse:** Opacity oscillation (0.4→1→0.4) over 2s with ease-in-out — like a heartbeat.
  - **Orbit:** A small filled circle traversing the bezier path via SVG `<animateMotion>`, with a 2–3.5s duration based on user speed setting.
- **Connect banner pulse:** A small dot with 1.2s ease-in-out scale/shadow animation.

## Components

### Nodes
The atomic unit of the system. Each node has an optional shape background (SVG path), an inner text label, and two ports (left/right). Nodes display as accent-bordered rectangles by default; shape nodes use transparent backgrounds with SVG clip-paths. The glow system creates a neon halo using `--accent-rgb` and `--glow-strength`. Selection and connect-source states amplify the glow progressively.

### Edges
Quadratic bezier curves connecting node ports. 1.4px accent-colored strokes with 85% opacity and a subtle glow filter. Temporary (in-progress) edges use dashed strokes. Bezier control points are calculated dynamically from source/target positions.

### Toolbar
A vertical column of icon buttons for mode switching: select (default), add node, connect, delete. Each button shows a tooltip on hover with a keyboard shortcut badge (`kbd`). A flyout for shape selection appears below the add-node button. A divider separates primary tools from the tweaks toggle.

### Tweaks Panel
A draggable glass-morphism panel with user customization controls: accent color (chips + hex input + color picker), canvas background mode (plain/grid/paper/collage), font mode (mono/inter), minimap toggle, node size (70–140%), glow strength (0–120), connection animation toggle, animation style (flow/pulse/orbit), and animation speed (20–100). Uses injected `<style>` tag for scoped CSS.

### Document Panel
A slide-in editor for node-linked documents. Contains a title textarea, metadata section (creation/update timestamps with tabular-nums), a body textarea for markdown content, and a footer with shape tag. The panel slides from the right edge with a 220ms spring-like transition.

### Status Bar
Bottom-left cluster of read-only chips showing cursor canvas coordinates (formatted as `+xxx.x`), node/edge counts (`05n · 03e`), and zoom controls (zoom out / percentage display / zoom in / fit-to-view buttons). The zoom chip uses tabular-nums for stable width.

### Canvas Backgrounds
Four modes: **plain** (solid `#0b0c0e`), **grid** (crosshatch of 1px faint-white lines at 32px intervals, scaled with zoom), **paper** (horizontal rule lines only at 24px intervals), and **collage** (grid + radial gradient vignette centered on the accent color). Background position and size track the camera transform for parallax-corrected scrolling.

### Icon System
All icons share a unified 24×24 viewBox with 1.6px stroke width, round caps, and round joins. The set includes: cursor (select), hexagon (nodes), link (connect), trash (delete), palette (theme), close (X), expand (fullscreen), plus (add), zoom-in, zoom-out, sliders (tweaks), and fit-to-view.

### Empty State
Shown when no nodes exist. Features a dashed border frame, a system prompt (`SYS · AWAITING_NODE`), instructional text, a "Create First Node" pill CTA with accent styling, and keyboard shortcut hints.

### Connect Banner
A floating pill banner that appears during connection mode, showing a pulsing dot indicator, instructional text, and an ESC key badge to cancel. Positioned 64px from the top, centered horizontally.
