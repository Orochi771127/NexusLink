# Crystalfin Seahorse full animation catalog — autonomous QC

- Result: **29 / 29 actions are review candidates**. None are runtime-approved.
- Delivery: every selected sheet decodes as RGBA, uses exact `512×512` cells, and matches its catalog grid.
- Internal-boundary audit: minimum observed clearance is 33 pixels. No selected crystal crown, dorsal fin, snout or spiral tail touches or crosses a cell boundary.
- Identity lock: selected sheets preserve turquoise-blue scales, pale segmented belly, deep-blue eyes, rounded snout, faceted blue crystal crown and fins, chest crystal, limbless upright body and complete spiral tail.
- Species translation: terrestrial walking is translated into horizontal hover-swim; motion uses buoyancy, torso curves, fin paddling and tail-coil thrust. Grooming, rest, dance, defense and combat remain aquatic and contain no quadruped or avian anatomy.
- Sleep-loop lock: all eight `sleep` frames are already deeply asleep with closed eyes and compact floating posture. No falling-asleep, lying-down, waking, eye-opening or return-to-idle transition is present. Waking is isolated to `idle_wake`.
- FX policy: selected body sheets contain no projectiles, bubbles, impact flashes, water scenery, runes, text or UI.
- Rejected/replaced during production: first `left_walk` for back-view orientation drift and first `touch_reject` for detached motion lines.
- Selected paths are authoritative in `catalog-selected-outputs.json`.
- Promotion gate: human approval and a separate GROUNDWORK task are required before anything enters `assets/**` or runtime.
