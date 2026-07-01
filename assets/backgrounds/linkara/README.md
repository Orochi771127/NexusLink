# Linkara Background And BGM Staging

This folder stores the approved local staging copy of the Linkara world map and
seven region background images.

Current status:

- staged for future use
- not wired into `src/data/assetManifest.js`
- not wired into `src/ui/atlasController.js`
- not covered by a scene profile yet
- no runtime state, unlock, chapter, or audio-routing changes are implied

Use `manifest.json` as the source of truth for source attachment pairing.
Use `linkara-map-data.json` as the staging data source for atlas coordinates,
scene-switching keys, UI-fit notes, and redraw decisions.

## Files

```text
assets/backgrounds/linkara/world_map_linkara_region.jpg
assets/backgrounds/linkara/regions/southeast_forge_hills.jpg
assets/backgrounds/linkara/regions/central_radiant_core.jpg
assets/backgrounds/linkara/regions/northern_verdant_plains.jpg
assets/backgrounds/linkara/regions/southern_harbor_nexus.jpg
assets/backgrounds/linkara/regions/ethereal_moon_lakefront.jpg
assets/backgrounds/linkara/regions/eastern_mystic_mountains.jpg
assets/backgrounds/linkara/regions/southwest_tidal_frontier.jpg
```

Related BGM files live under:

```text
assets/audio/linkara/
```

## Runtime Notes

Before these assets become active runtime assets, a separate GROUNDWORK task
should decide:

- whether the atlas uses the full world map image or keeps the current SVG
- whether each region background needs a scene profile
- how BGM is selected, faded, and volume-capped per region
- whether the Southern Harbor and Central Core BGM pairings remain as staged
