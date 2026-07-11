# Sprigfawn full animation catalog — autonomous QC

- Result: **29 / 29 actions are review candidates**. None are runtime-approved.
- Delivery: every selected sheet decodes as RGBA, uses exact `512×512` cells, and matches its catalog grid.
- Internal-boundary audit: minimum observed clearance is 32 pixels. No selected antler branch, leaf, ear, hoof or short tail touches or crosses a cell boundary.
- Identity lock: selected sheets preserve juvenile fawn proportions, green eyes, cream muzzle/chest, white spots, wooden leafy antlers, vine markings, green chest crystal, four dark cloven hooves and leaf-tuft tail.
- Species translation: locomotion uses alternating cloven-hoof steps; emotion uses ears, neck height, gaze and forehoof weight. Grooming uses the muzzle; rest and sleep use anatomically plausible folded-leg sternal recumbency. No pawed quadruped or avian motion was selected.
- Sleep-loop lock: all eight `sleep` frames are already curled and deeply asleep with closed eyes. No kneeling-down, standing, waking, eye-opening or return-to-idle transition is present. Waking is isolated to `idle_wake`.
- FX policy: selected body sheets contain no falling leaves, vines, projectiles, impact flashes, scenery, text or UI.
- Version note: the new eight-frame `idle_calm` is selected as v2 to avoid ambiguity with the older six-frame pilot.
- Selected paths are authoritative in `catalog-selected-outputs.json`.
- Promotion gate: human approval and a separate GROUNDWORK task are required before anything enters `assets/**` or runtime.
