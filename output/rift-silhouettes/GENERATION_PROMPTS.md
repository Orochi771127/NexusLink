# GAP-1 Generation Prompts

Every item used this shared production contract:

> One small static rift-enemy silhouette for a minor emotional standoff opponent; exactly one centered subject within the central 55–62%; Nexus Link Cyber-Taoism; illustrated painterly high-detail emotion-mist; soft outer halo, darker inner core, thin noise-vein filaments; flat solid `#FF00FF` chroma background; no anatomy, face, mascot, conventional RPG monster, scene, UI, text, border, shadow, or pedestal.

Item-specific prompt directives:

- `static_wisp`: sadness `#3C7FDD`; thin drifting glitch filaments and softly vibrating mist with delicate scattered edges.
- `tearveil_wisp`: sadness `#3C7FDD`; the lightest translucent hanging tear veil, narrow drooping folds and sparse suspended droplets.
- `crystal_golemite`: anger `#DF6B3A`; suspended crystal-like shards and compressed mist with heavy downward pressure, abstract and faceless.
- `spite_ember`: anger `#DF6B3A`; compressed ember knot with restrained sharp splinters pressing outward.
- `rift_shade`: anxiety `#873EDA`; shifting blurred shadow with an almost-familiar contour that never resolves into a being.
- `dread_coil`: anxiety `#873EDA`; tightening spiral of dark mist wound inward with jittering filaments.
- `weary_husk`: fatigue `#AC976C`; hollow sagging shell, visibly empty at the center with drooping edges.
- `sink_weight`: fatigue `#AC976C`; compact nearly motionless descending mass, broad below and dragged downward.
- `hollow_echo`: loneliness `#4D6BCB`; hollow central echo-ring with incomplete concentric ripples fading outward.
- `drift_murmur`: loneliness `#4D6BCB`; loose broken echo-rings drifting apart, sparse and airy.

Raw generation used built-in `image_gen`; transparent finals used border-sampled soft-matte chroma removal, despill, one-pixel matte contraction, and deterministic 512 x 512 normalization.
