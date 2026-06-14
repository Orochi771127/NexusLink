# Character Lock Spec — ThunderPup

> Status: identity scaffold for pilot prompt generation. This file does not connect ThunderPup to runtime.

## Identity

- character_id: thunder-pup
- display_name: ThunderPup
- faction: black_iron_hackers
- role: thunder guardian companion
- element: thunder / lightning
- species: wolf pup
- age_feel: young companion
- current_runtime_status: roadmap candidate, not active runtime companion

## Art Direction

- art_style: illustrated / painterly / high-detail
- not chunky pixel art
- not 64x64 pixel sprite
- master_frame: 512x512
- background: transparent PNG
- anchor: bottom-center
- position_snap: true
- sampling: linear + mipmaps
- no nearest-neighbor for illustrated companion

## Core Silhouette

- compact young wolf pup
- large alert ears
- compact seated or stable four-leg body
- fluffy tail with compact crystal-like electric tail tip
- readable small companion silhouette
- loyal but alert posture

## Face / Eye Identity

- wolf pup face
- bright electric blue eyes
- small muzzle
- calm but alive expression
- not fox-like
- not rabbit-like
- not cat-like

## Color System

- charcoal black
- cool gray
- electric blue
- blue-violet glow

## Signature Markings

- glowing blue-purple lightning markings
- compact crystal-like electric tail tip
- dark fur palette
- bright blue eyes
- black-iron / cyber thunder faction language
- alert but companion-like personality

## Material Language

- soft dark young-wolf fur with painterly detail
- cool gray secondary fur shapes
- blue-violet lightning glow integrated into markings, not floating UI
- compact crystal-like electric tail tip, readable but not oversized
- cyber thunder faction accents should feel black-iron and restrained

## Personality Impression

- loyal
- alert
- emotionally sensitive
- protective but not aggressive
- calm when trusted
- defensive when boundary pressure rises

## Forbidden Drift

- do not change species
- do not turn into fox / rabbit / cat / generic dog
- do not change blue eyes
- do not remove blue-purple lightning markings
- do not remove crystal tail tip
- do not add armor unless explicitly requested
- do not add wings
- do not make it a giant adult wolf
- do not change faction language into heart-council fantasy style
- do not add UI
- do not add text
- do not add scene
- do not add pedestal
- do not add white background
- do not convert into chunky pixel art
- do not reinterpret as a different faction

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
- no nearest-neighbor for illustrated companion
- concept sheets are reference / art canon only, not runtime sprites

## Reference Policy

- Use approved ThunderPup reference images when human provides them.
- Current lock spec is identity scaffold only.
- Do not infer missing visual traits freely.
- Preserve character identity over novelty.
- Concept sheets are reference / art canon only, not runtime sprites.

## Reference Image List

| Reference | Path or link | Use | Runtime allowed? |
|-----------|--------------|-----|------------------|
| Human-approved ThunderPup reference | pending | identity / silhouette / markings | no |

## Approval Status

- lock_spec_status: pilot draft
- human_approved_by:
- approval_date:
- approved_for_actions: idle_calm prompt pilot only

## Human Notes

-
