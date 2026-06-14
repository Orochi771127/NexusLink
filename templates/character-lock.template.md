# Character Lock Spec Template

> Purpose: lock identity before prompt generation. Codex may organize this spec, but human approval is required before any runtime asset work.

## Identity

- character_id:
- display_name:
- faction:
- role:
- element:
- species:
- age_feel:

## Core Silhouette

- Primary body shape:
- Head / body ratio:
- Ear / horn / tail / wing / limb language:
- Readable shape at small on-screen size:
- Must-preserve silhouette notes:

## Face / Eye Identity

- Eye shape:
- Eye color:
- Brow / eyelid attitude:
- Muzzle / nose / mouth:
- Expression baseline:
- Must-preserve face notes:

## Color System

- Primary palette:
- Secondary palette:
- Accent colors:
- Glow / cyber-taoism accents:
- Forbidden palette shifts:

## Signature Markings

- Marking locations:
- Marking shapes:
- Marking colors:
- Symmetry / asymmetry:
- Must-preserve marking notes:

## Material Language

- Fur / skin / feather / scale handling:
- Cloth / charm / accessory handling:
- Glow / glass / metal / spiritual texture:
- Brush / detail density:
- Must-preserve material notes:

## Personality Impression

- First-read personality:
- Motion temperament:
- Boundary language:
- Emotional range:
- What this companion should never feel like:

## Forbidden Drift

- do not change species
- do not change silhouette family
- do not change palette family
- do not change face / eyes / markings
- do not add armor unless specified
- do not add UI
- do not add text
- do not add scene
- do not add pedestal
- do not add white background
- do not convert into chunky pixel art
- do not reinterpret the character as a different faction

## Runtime Art Policy

- art_style: illustrated / painterly / high-detail
- master_frame: 512x512
- background: transparent PNG
- anchor: bottom-center
- sampling: linear + mipmaps
- position_snap: true
- max_sheet_edge: 4096
- sheet_grid: exactly divisible
- scale_basis: frameHeight
- greyshade-cat legacy exception: 443/444 accepted, never upscale
- baked-in elements forbidden: white background, UI, text, scene, pedestal, codex frame
- concept sheets / old codex art / 64 PPU / 96px markers: reference / art canon only, not runtime companion sprites

## Reference Image List

| Reference | Path or link | Use | Runtime allowed? |
|-----------|--------------|-----|------------------|
| Primary design reference | | identity / silhouette / palette | no |
| Marking reference | | markings | no |
| Material reference | | material language | no |

## Approval Status

- lock_spec_status: draft
- human_approved_by:
- approval_date:
- approved_for_actions:

## Human Notes

-
