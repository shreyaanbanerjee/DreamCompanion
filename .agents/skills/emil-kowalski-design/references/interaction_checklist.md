# Design Engineering Interaction Checklist

Follow these tactile standards for all interactive UI elements:

## 1. Tactile Button & Press States
- **Hover**: Subtle lift (`transform: translateY(-1px)` or `-2px`) and gentle illumination or border brightening.
- **Active / Press**: Scale down to `0.97` with high-damping spring. Never leave buttons without an active state.
- **Cursor**: Always specify `cursor: pointer` on custom clickable elements; disabled buttons must have `cursor: not-allowed` and reduced opacity (0.5).

## 2. Shared Layout & Morphing
- When expanding an item into a detail view, use shared layout identifiers (e.g. `layoutId` in Framer Motion).
- Keep text transitions clean: animate parent container bounding box rather than stretching typography fonts.

## 3. Gestures & Dragging
- Drag-to-dismiss sheets/drawers must track the user's cursor/touch with 1:1 displacement.
- Release threshold: if dragged past 30% of height OR velocity > 500px/s, trigger dismissal; otherwise snap back with a fluid spring.

## 4. Accessibility (a11y)
- **Reduced Motion**: Always wrap motion in `@media (prefers-reduced-motion: reduce)`. Zero duration, instant opacity cut.
- **Touch Target**: Minimum target area of `44px x 44px` even if the visible icon is 16px.
- **Focus Rings**: Offset outline (`outline: 2px solid var(--accent); outline-offset: 2px;`) that triggers on `:focus-visible` without showing on mouse clicks.
