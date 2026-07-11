# Blazetail Kit full animation catalog — autonomous QC

- Result: **29 / 29 actions are review candidates**. None are runtime-approved.
- Delivery: every selected sheet decodes as RGBA, uses exact `512×512` cells, and matches the catalog row/column count.
- Internal-boundary audit: every selected raw sheet has positive padding on all four sides of every cell; minimum observed clearance is 12 source pixels (`attack_basic`). No selected tail or limb touches/crosses an internal boundary.
- Identity lock: selected sheets preserve the approved Blazetail Kit face/body family, large diamond chest crystal, angular gold setting, spiral markings, painterly fire-fur, and complete tail silhouette.
- Species/motion review: locomotion is juvenile vulpine; emotion states use ears, gaze, shoulders and tail pressure; grooming, sit, sleep, boundary, touch and combat-body actions remain species-specific and body-language-led.
- FX policy: body sheets contain no selected projectiles, impact flashes, scenery, text or UI. The first `special_angry` generation was rejected for detached embers and replaced by clean body-only v2.
- Rejected/replaced during production: `idle_happy` v1-v4, `touch_accept` v1, `idle_calm` v1, `skill_cast` v1, and `special_angry` v1.
- Selected paths are authoritative in `catalog-selected-outputs.json`.
- Promotion gate: human visual approval plus a separate GROUNDWORK task are required before copying anything into `assets/**` or wiring runtime.
