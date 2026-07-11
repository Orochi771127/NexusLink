# Auriowl full animation catalog — autonomous QC

- Result: **29 / 29 actions are review candidates**. None are runtime-approved.
- Delivery: every selected sheet decodes as RGBA, uses exact `512×512` cells, and matches the catalog row/column count.
- Internal-boundary audit: every selected sheet has positive padding on all four sides of every cell; minimum observed clearance is 26 pixels (`skill_cast`). No selected wingtip, talon, crown feather or tail feather touches or crosses an internal boundary.
- Identity lock: selected sheets preserve the approved Auriowl golden layered plumage, cream face/chest, amber eyes, black hooked beak, diamond chest crystal, sun shoulder medallion and golden talons.
- Species/motion review: movement remains avian and grounded. Walking uses short talon steps; grooming uses beak preening; defense uses a wing mantle; emotional states use crown feathers, gaze, wing pressure and perch height. No quadruped motion template was used.
- Sleep-loop lock: all eight `sleep` frames are already deeply asleep with eyes closed and a compact resting posture. The loop contains no standing, lying-down, eye-opening, waking or return-to-idle transition. Waking is isolated to `idle_wake`.
- FX policy: body sheets contain no selected projectiles, impact flashes, runes, scenery, text or UI.
- Selected paths are authoritative in `catalog-selected-outputs.json`.
- Promotion gate: human visual approval plus a separate GROUNDWORK task are required before copying anything into `assets/**` or wiring runtime.
