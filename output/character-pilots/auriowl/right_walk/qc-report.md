# Auriowl Right-Walk Pilot QC

- Status: review candidate only; not runtime-approved.
- Sheet: exact 2048 x 1024 RGBA after deterministic normalization; eight 512 x 512 cells.
- Alpha containment: all frames have transparent corners and no edge-touch rejection.
- Shared scale: enabled for all eight frames.
- Talon datum: grounded frames end at y=479-481; hop/transition frames remain within y=481 after alignment.
- Species read: eight frames preserve a two-talon avian step, tiny hop, landing, recovery, and settle sequence; no quadruped gait and no open-wing flight.
- Identity read: golden-yellow eyes, cream facial disk, black/gold beak, gold crown and folded wings, shoulder medallion, and chest gem remain present.
- Known review point: frame 1 is visually matched but not pixel-identical to the approved seed; minor feather and engraving detail varies between frames.
- Runtime policy: keep outside `assets/**` until Owner visual approval and a later asset-readiness GROUNDWORK gate.
