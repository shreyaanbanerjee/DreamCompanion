# Animation Curves, Springs, and Physics Presets

Design engineering principles inspired by Emil Kowalski: animations must feel physical, responsive, and tactile rather than mechanical.

## 1. Spring Physics vs Easing Curves
Linear and generic cubic-bezier curves feel robotic. Physical springs simulate mass, tension, and friction.

### Framer Motion Presets
```javascript
// Snappy Micro-interaction (buttons, switches, toggles)
export const snappySpring = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.8
};

// Fluid Layout Transition (modals, sheet drawers, expanded cards)
export const fluidSpring = {
  type: "spring",
  stiffness: 300,
  damping: 28,
  mass: 1
};

// Gentle Enter / Exit (tooltips, dropdowns)
export const gentleSpring = {
  type: "spring",
  stiffness: 260,
  damping: 20
};
```

## 2. CSS-Only Spring Easing (Linear Timing Function)
For projects without JavaScript animation runtimes, use modern CSS spring easing:
```css
:root {
  /* Snappy spring curve */
  --ease-spring-snappy: linear(
    0, 0.009, 0.035 2.1%, 0.141 4.4%, 0.723 12.9%, 0.938 16.7%,
    1.017 20.2%, 1.049 23.6%, 1.054 27.2%, 1.038 31.1%,
    1.018 35.3%, 1.004 40%, 0.997 45.4%, 0.998 52.3%, 1
  );
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## 3. GPU Acceleration Discipline
- **Only animate transforms and opacity**: `transform: translate3d(...) scale(...)` and `opacity`.
- **Never animate layout properties**: Never animate `top`, `left`, `width`, `height`, `margin`, or `padding` directly. Use CSS FLIP or transform scaling.
- Use `will-change: transform` conservatively (only on active hover/interaction, remove after animation completes).
