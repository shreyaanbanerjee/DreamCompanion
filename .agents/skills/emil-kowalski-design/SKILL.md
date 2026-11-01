---
name: emil-kowalski-design
description: >-
  Guides frontend design engineering, fluid physical animations, responsive gestures, micro-interactions,
  and tactile UI craft. Use this skill whenever building frontend components, modals, dropdowns, navigation bars,
  drag-and-drop interactions, Framer Motion animations, or premium CSS styling.
---

# Emil Kowalski Design Engineering & Micro-Interactions

This skill guides the implementation of fluid, tactile, and production-grade web interfaces based on modern design engineering practices.

## 1. Dynamic Configuration

Configured in `.agents/skills.config.yaml` under `emil-kowalski-design`:
- `motion_library`: `framer-motion` (or `css-springs` / `vanilla-web-animations`).
- `default_spring`: Stiffness (400), damping (30), mass (0.8).
- `haptics_and_scale`: Tap scale (0.97), hover lift (-2px).
- `a11y`: Respect `prefers-reduced-motion` and minimum 44px touch targets.

## 2. Core Philosophy & Rules

1. **Physical Springs, Not Timers**: Never use generic `ease-in-out` or linear durations for UI interactions. Use spring physics so velocity and momentum feel natural.
   - Refer to [Animation Curves & Springs](./references/animation_curves.md).
2. **Tactile Feedback for Every State**: Buttons and controls must have distinct hover, focus-visible, active (press), and disabled states.
   - Refer to [Interaction Checklist](./references/interaction_checklist.md).
3. **60fps Performance**:
   - Only animate `transform` and `opacity`.
   - Never cause browser layout recalculations (`reflow`) during animations.
4. **Accessible by Default**:
   - Provide instant zero-duration fallbacks when `prefers-reduced-motion: reduce` is detected.
   - Ensure keyboard navigability with distinct offset focus rings.
