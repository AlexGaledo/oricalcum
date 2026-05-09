# `migration-agent.md`

## Oricalcum — Design Module Migration & Architecture Refactor

You are a senior frontend architect and product engineer.

Your task is to transform an existing prototype into a production-ready **Next.js + TypeScript** application while preserving all existing design language, interaction patterns, and business logic.

---

# Objective

Migrate the current prototype located in:

```txt
/design_modules
```

Containing:

```txt
canvas.jsx
chrome.jsx
index.html
nodes.jsx
tweaks-panel.jsx
```

Into a clean, scalable, production-ready architecture.

The current files inside `design_modules` are the **single source of truth** for:

* UI design
* interaction behavior
* animation logic
* layout
* styling intent
* node interactions
* canvas behavior
* toolbar behavior
* tweak/theme controls

Nothing should be redesigned from scratch unless necessary for TypeScript conversion, architecture consistency, accessibility, or performance.

---

# Core Migration Rule

## STRICT RULE

Before writing any new implementation:

1. Analyze every file in `/design_modules`
2. Extract:

   * components
   * hooks
   * state logic
   * visual primitives
   * interaction patterns
   * reusable utilities
3. Preserve:

   * visual fidelity
   * UX behavior
   * animations
   * spacing
   * motion timing
   * interaction flow

The prototype is the design source.

The new architecture is only an implementation upgrade.

---

# Migration Goals

Convert:

* JavaScript → TypeScript
* static HTML → Next.js App Router
* local component state → modular stores
* loose component structure → feature-first architecture

---

# Required Stack

Use:

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* React Flow
* Zustand
* Framer Motion

Do not introduce alternative frameworks.

Do not use Redux.

Do not use Context API for feature state.

---

# Required Target Architecture

Implement exactly:

```txt
src/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   │
│   └── workspace/
│       └── page.tsx
│
├── features/
│   │
│   ├── canvas/
│   │   ├── components/
│   │   │   ├── canvas.tsx
│   │   │   ├── minimap.tsx
│   │   │   └── background.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-canvas.ts
│   │   │   └── use-zoom.ts
│   │   │
│   │   ├── store/
│   │   │   └── canvas.store.ts
│   │   │
│   │   ├── types/
│   │   │   └── canvas.types.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── nodes/
│   │   ├── components/
│   │   │   ├── node-card.tsx
│   │   │   ├── node-shapes.tsx
│   │   │   └── node-toolbar.tsx
│   │   │
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── edges/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── index.ts
│   │
│   ├── documents/
│   │   ├── components/
│   │   │   ├── editor-panel.tsx
│   │   │   └── markdown-editor.tsx
│   │   │
│   │   ├── store/
│   │   └── index.ts
│   │
│   ├── themes/
│   │   ├── components/
│   │   │   ├── theme-picker.tsx
│   │   │   └── color-presets.tsx
│   │   │
│   │   ├── store/
│   │   ├── constants/
│   │   └── index.ts
│   │
│   └── toolbar/
│       ├── components/
│       ├── constants/
│       └── index.ts
│
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   ├── icons/
│   │   └── layout/
│   │
│   ├── hooks/
│   ├── constants/
│   ├── utils/
│   ├── types/
│   └── lib/
│
├── providers/
│   ├── theme-provider.tsx
│   ├── reactflow-provider.tsx
│   └── index.tsx
│
└── config/
    ├── app.config.ts
    ├── theme.config.ts
    └── shortcuts.config.ts
```

This structure is mandatory.

No deviations.

---

# File Mapping Requirements

Map source files into features.

## canvas.jsx

Must be decomposed into:

* canvas feature
* zoom hooks
* background components
* viewport state

---

## nodes.jsx

Must be decomposed into:

* node-card
* node shapes
* node interactions
* node state

---

## chrome.jsx

Must be decomposed into:

* shared layout
* shell UI
* app chrome
* navigation wrappers

---

## tweaks-panel.jsx

Must be decomposed into:

* theme feature
* toolbar controls
* tweak constants
* user customization state

---

## index.html

Must be decomposed into:

* layout.tsx
* page.tsx
* metadata
* global styles

---

# Refactoring Rules

## Type Safety

Every component must be strongly typed.

No `any`.

No implicit types.

All feature domains must have explicit types.

---

## Imports

Use absolute imports:

```ts
@/features/...
@/shared/...
@/providers/...
```

Never use deep relative imports.

---

## Barrel Exports

Every feature must expose:

```ts
index.ts
```

Use barrel exports.

---

## State

Use modular Zustand stores:

Examples:

```txt
canvas.store.ts
node.store.ts
theme.store.ts
document.store.ts
```

Do not create one giant store.

---

## Styling

Convert all styles into:

* Tailwind utilities
  or
* CSS variables

Preserve original design exactly.

No arbitrary redesigns.

---

## Animation

If prototype uses animation:

Migrate into Framer Motion.

Preserve timing and interaction feel.

---

# Preservation Rules

Must preserve:

* node positioning behavior
* drag behavior
* zoom behavior
* toolbar interactions
* theme controls
* visual hierarchy
* spacing
* hover states
* motion timing
* keyboard interactions

---

# Forbidden Actions

Do NOT:

* redesign UI
* rename product
* remove interactions
* simplify functionality
* replace behaviors
* introduce new UX
* remove polish

This is a migration.

Not a redesign.

---

# Success Criteria

Migration is complete only when:

✅ Design matches prototype
✅ All source logic is preserved
✅ All JSX is converted to TSX
✅ App runs successfully
✅ Feature folders are isolated
✅ No duplicated logic
✅ No dead code
✅ Architecture is scalable for multiplayer, AI, export, and persistence

---

# Final Principle

> Prototype defines behavior.
> Architecture defines longevity.
> Preserve the first. Upgrade the second.
