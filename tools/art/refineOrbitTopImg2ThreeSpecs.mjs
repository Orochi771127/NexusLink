#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const rootArgIndex = process.argv.indexOf("--root");
const root = path.resolve(
  rootArgIndex >= 0 && process.argv[rootArgIndex + 1]
    ? process.argv[rootArgIndex + 1]
    : "output/global-3d-gameplay-pilots-r1/img2threejs"
);

const TARGETS = [
  {
    file: "greyshade-sculpt-spec.json",
    id: "greyshade",
    name: "Greyshade Cat Orbit Top",
    palette: {
      clay: "#797D77",
      dark: "#353A38",
      resin: "#55DFF4",
      trim: "#D6BD77"
    },
    features: [
      ["grey-tabby-band", "ridge", "tabbyBands/grey-tabby-band"],
      ["heart-core", "gloss", "heartCore/heart-core"],
      ["paired-ear-fins", "contour", "earFins/paired-ear-fins"],
      ["cyan-channel-ring", "gloss", "resin/cyan-channel-ring"],
      ["ivory-cardinals", "fastener", "cardinalGuards/ivory-cardinals"],
      ["eye-inlays", "emissive", "eyeInlays/eye-inlays"],
      ["bottom-tip", "contour", "spinTip/bottom-tip"],
      ["resonance-fins", "contour", "resonanceFins/resonance-fins"],
      ["clay-soft-bevel", "bevel", "base/clay-soft-bevel"],
      ["gold-restraint", "linework", "trim/gold-restraint"]
    ]
  },
  {
    file: "rift-echo-sculpt-spec.json",
    id: "rift",
    name: "Rift Echo Orbit Top",
    palette: {
      clay: "#302B42",
      dark: "#0A0711",
      resin: "#A765D1",
      trim: "#ED719D"
    },
    features: [
      ["inverted-arch-crown", "contour", "outerShell/inverted-arch-crown"],
      ["true-central-void", "hole", "voidCore/true-central-void"],
      ["smoky-resin-channel", "gloss", "resin/smoky-resin-channel"],
      ["coral-fault-seam", "emissive", "faultSeam/coral-fault-seam"],
      ["ivory-locks", "fastener", "cardinalGuards/ivory-locks"],
      ["rift-glyph-inlays", "linework", "eyeInlays/rift-glyph-inlays"],
      ["bottom-tip", "contour", "spinTip/bottom-tip"],
      ["resonance-fins", "contour", "resonanceFins/resonance-fins"],
      ["clay-soft-bevel", "bevel", "base/clay-soft-bevel"],
      ["void-occlusion-ring", "groove", "voidCore/void-occlusion-ring"]
    ]
  }
];

function rgba(hex, alpha = 1) {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((offset) =>
    Number.parseInt(value.slice(offset, offset + 2), 16)
  );
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function recipe(primary, secondary, materialClass, confidence = 0.9) {
  return {
    dominantAlbedo: rgba(primary),
    secondaryAlbedo: rgba(secondary),
    materialClass,
    materialClassConfidence: confidence
  };
}

function component({
  id,
  name,
  level,
  parent = "root",
  primitive = "sphere",
  material = "base",
  topologyClass = "assembled-solid",
  featureIds = [],
  colors,
  materialClass = "ceramic"
}) {
  const result = {
    id,
    name,
    level,
    role: level === "macro" ? "body" : "identity-detail",
    importance: level === "macro" ? 0.95 : level === "meso" ? 0.82 : 0.65,
    confidence: 0.88,
    primitive,
    topologyClass,
    topologyRationale:
      "The multi-angle reference shows a volumetric, symmetric part with rounded clay-resin edges and stable depth outside the reference camera.",
    parent,
    material,
    materialLayers: [material],
    localFeatures: featureIds.map((featureId) => ({
      id: featureId,
      realization: level === "micro" ? "raised-or-inlaid-geometry" : "authored-geometry",
      evidenceRefs: ["full-object"]
    })),
    colorMaterialRecipe: recipe(
      colors[0],
      colors[1],
      materialClass
    ),
    evidenceRefs: ["full-object"],
    fidelityTier: level === "macro" ? "blockout" : "refinement"
  };
  if (parent) {
    result.attachment = {
      parentId: parent,
      parentSocket: `${parent}-surface`,
      localStart: [0, 0, 0],
      localEnd: [0, 0, 0.1],
      contactType: "embedded-rounded-joint",
      embedDepth: 0.04,
      overlap: 0.02,
      gapTolerance: 0.005,
      evidenceRefs: ["full-object"]
    };
  }
  return result;
}

function materialFromEvidence({
  id,
  name,
  baseColor,
  baseEvidence,
  roughness,
  metalness,
  localOverrides,
  transmission = 0,
  clearcoat = 0
}) {
  const maps = baseEvidence.referencePbr?.maps || {};
  return {
    id,
    name,
    type: "physical",
    shaderModel: "MeshPhysicalMaterial / PBR approximation",
    baseColor,
    albedo: {
      dominant: baseColor,
      samplingNotes: "Look-dev color is constrained by source-pixel PBR evidence and will be rechecked against neutral renders.",
      map: maps.albedo
    },
    textureResolution: 1024,
    textureProjection: {
      mode: "uv",
      repeat: [1, 1],
      anisotropy: 8,
      texelDensityIntent: "Keep clay grain and resin highlight breakup stable across base and resonance nodes."
    },
    surfaceFrequencyBands: [
      { id: "macro", frequency: 2, amplitude: 0.18, role: "broad hand-shaped value variation" },
      { id: "meso", frequency: 14, amplitude: 0.08, role: "soft resin-clay undulation" },
      { id: "micro", frequency: 72, amplitude: 0.025, role: "subtle grazing-light breakup" }
    ],
    roughness: {
      base: roughness,
      variation: 0.08,
      map: maps.roughness,
      localResponse: "Evidence-linked and independently sampled from albedo."
    },
    metalness: { base: metalness, variation: metalness > 0 ? 0.08 : 0 },
    normal: {
      pattern: "reference-derived height-gradient normal map",
      strength: 0.18,
      map: maps.normal,
      space: "tangent"
    },
    ambientOcclusion: {
      cavityStrength: 0.28,
      contactShadowBias: 0.3,
      map: maps.ao,
      notes: "Independent AO evidence; do not bake it into baseColor."
    },
    transmission: { base: transmission, variation: transmission > 0 ? 0.05 : 0 },
    clearcoat: { base: clearcoat, variation: clearcoat > 0 ? 0.06 : 0 },
    localOverrides,
    referencePbr: {
      ...baseEvidence.referencePbr,
      confidence: Math.min(0.86, Number(baseEvidence.referencePbr?.confidence) || 0.7),
      estimatedFidelity: Math.min(0.86, Number(baseEvidence.referencePbr?.estimatedFidelity) || 0.7),
      warnings: [
        "Shared object-zone evidence constrains this Pilot material; isolate a dedicated crop before final production promotion."
      ]
    }
  };
}

function buildComponents(target) {
  const { palette } = target;
  return [
    component({
      id: "root",
      name: target.name,
      level: "macro",
      parent: null,
      primitive: "cylinder",
      colors: [palette.clay, palette.dark]
    }),
    component({
      id: "baseForm",
      name: "Base form assembly",
      level: "macro",
      primitive: "lathe",
      colors: [palette.clay, palette.dark]
    }),
    component({
      id: "resonanceAssembly",
      name: "Resonance form assembly",
      level: "macro",
      primitive: "lathe",
      colors: [palette.resin, palette.clay],
      material: "resin",
      materialClass: "glass"
    }),
    component({
      id: "outerShell",
      name: "Rounded outer shell",
      level: "meso",
      primitive: "torus",
      colors: [palette.clay, palette.dark],
      featureIds: target.id === "rift" ? ["inverted-arch-crown"] : []
    }),
    component({
      id: target.id === "rift" ? "voidCore" : "heartCore",
      name: target.id === "rift" ? "True negative-space void core" : "Cyan resin heart core",
      level: "meso",
      primitive: target.id === "rift" ? "torus" : "ellipsoid",
      colors: [target.id === "rift" ? palette.dark : palette.resin, palette.clay],
      material: "resin",
      materialClass: "glass",
      featureIds:
        target.id === "rift"
          ? ["true-central-void", "void-occlusion-ring"]
          : ["heart-core"]
    }),
    component({
      id: "earFins",
      name: "Paired silhouette fins",
      level: "meso",
      primitive: "ellipsoid",
      colors: [palette.clay, palette.dark],
      featureIds: target.id === "greyshade" ? ["paired-ear-fins"] : []
    }),
    component({
      id: "channelRing",
      name: "Translucent resin channel",
      level: "meso",
      primitive: "torus",
      colors: [palette.resin, palette.clay],
      material: "resin",
      materialClass: "glass"
    }),
    component({
      id: "cardinalGuards",
      name: "Four radial guards",
      level: "meso",
      primitive: "instanced-cluster",
      colors: [palette.trim, palette.clay],
      material: "trim",
      materialClass: "metal",
      featureIds: [target.id === "rift" ? "ivory-locks" : "ivory-cardinals"]
    }),
    component({
      id: "spinTip",
      name: "Rounded physical contact tip",
      level: "meso",
      primitive: "cone",
      colors: [palette.trim, palette.dark],
      material: "trim",
      materialClass: "metal",
      featureIds: ["bottom-tip"]
    }),
    component({
      id: "resonanceFins",
      name: "Four rounded resonance fins",
      level: "meso",
      primitive: "instanced-cluster",
      colors: [palette.resin, palette.clay],
      material: "resin",
      materialClass: "glass",
      featureIds: ["resonance-fins"]
    }),
    component({
      id: "bezel",
      name: "Core protective bezel",
      level: "meso",
      primitive: "torus",
      colors: [palette.trim, palette.clay],
      material: "trim",
      materialClass: "metal"
    }),
    component({
      id: "tabbyBands",
      name: "Identity band inlays",
      level: "micro",
      primitive: "curve-sweep",
      colors: [palette.dark, palette.clay],
      featureIds: target.id === "greyshade" ? ["grey-tabby-band"] : []
    }),
    component({
      id: "eyeInlays",
      name: "Radial glyph inlays",
      level: "micro",
      primitive: "instanced-cluster",
      colors: [palette.trim, palette.resin],
      material: "trim",
      materialClass: "metal",
      featureIds: [target.id === "rift" ? "rift-glyph-inlays" : "eye-inlays"]
    }),
    component({
      id: "faultSeam",
      name: "Resonance seam line",
      level: "micro",
      primitive: "curve-sweep",
      colors: [palette.trim, palette.resin],
      material: "resin",
      materialClass: "glass",
      featureIds: target.id === "rift" ? ["coral-fault-seam"] : []
    }),
    component({
      id: "goldPins",
      name: "Restrained trim pins",
      level: "micro",
      primitive: "instanced-cluster",
      colors: [palette.trim, palette.clay],
      material: "trim",
      materialClass: "metal"
    }),
    component({
      id: "clayBevelDetail",
      name: "Soft handcrafted clay edge system",
      level: "micro",
      primitive: "torus",
      colors: [palette.clay, palette.dark],
      featureIds: ["clay-soft-bevel"]
    })
  ];
}

function refine(target) {
  const filePath = path.join(root, target.file);
  const spec = JSON.parse(fs.readFileSync(filePath, "utf8"));
  spec.preSpecAssessment.unknownsToResolveBeforeImplementation = [];
  spec.componentTree = buildComponents(target);

  const base = spec.materials[0];
  base.id = "base";
  base.name = `${target.name} matte clay`;
  base.localOverrides = [
    ...(base.localOverrides || []),
    {
      id: "clay-soft-bevel",
      type: "edge-response",
      roughness: 0.72,
      notes: "Soft hand-finished bevel with subtle resin-clay variation."
    }
  ];
  spec.materials = [
    base,
    materialFromEvidence({
      id: "resin",
      name: "Translucent resonance resin",
      baseColor: target.palette.resin,
      baseEvidence: base,
      roughness: 0.2,
      metalness: 0,
      transmission: 0.34,
      clearcoat: 0.7,
      localOverrides: [
        {
          id: target.id === "rift" ? "smoky-resin-channel" : "cyan-channel-ring",
          type: "resin-channel",
          roughness: 0.18,
          notes: "Identity-bearing translucent channel; never substitute baked black or cyan paint."
        }
      ]
    }),
    materialFromEvidence({
      id: "trim",
      name: "Restrained warm trim",
      baseColor: target.palette.trim,
      baseEvidence: base,
      roughness: 0.38,
      metalness: 0.5,
      localOverrides: [
        {
          id: "gold-restraint",
          type: "linework",
          notes: "Thin accent only on bezels and cardinal locks; never cover the clay mass."
        }
      ]
    })
  ];

  spec.preSpecAssessment.detailInventory.details =
    spec.preSpecAssessment.detailInventory.details.map((detail) => {
      const entry = target.features.find(([id]) => id === detail.id);
      return {
        ...detail,
        kind: entry?.[1] || "linework",
        mapsTo: { ref: entry?.[2] || "root" },
        realization: "component-or-material-linked"
      };
    });

  spec.featureReviewTargets = [
    {
      id: `${target.id}-base-identity`,
      name: `${target.name} base silhouette, centre identity and contact tip`,
      tier: "critical",
      passIds: ["blockout", "structural-pass"],
      minimumScore: 0.82,
      mustPass: true,
      componentRefs: ["outerShell", target.id === "rift" ? "voidCore" : "heartCore", "spinTip"],
      evidenceRefs: ["full-object"]
    },
    {
      id: `${target.id}-resonance-balance`,
      name: "Four rounded resonance fins preserve radial balance and shared mass",
      tier: "critical",
      passIds: ["structural-pass", "form-refinement"],
      minimumScore: 0.84,
      mustPass: true,
      componentRefs: ["resonanceAssembly", "resonanceFins"],
      evidenceRefs: ["full-object"]
    },
    {
      id: `${target.id}-clay-resin-response`,
      name: "Matte resin-clay miniature response with restrained glossy channels",
      tier: "important",
      passIds: ["material-pass", "surface-pass"],
      minimumScore: 0.78,
      mustPass: true,
      componentRefs: ["outerShell", "channelRing", "cardinalGuards"],
      evidenceRefs: ["full-object"]
    }
  ];
  spec.repetitionSystems = [
    {
      id: "fourfold-radial-balance",
      count: 4,
      buildsGeometry: true,
      geometry: "rounded cardinal guards and resonance fins instanced at 90-degree intervals",
      componentRefs: ["cardinalGuards", "resonanceFins", "eyeInlays"],
      evidenceRefs: ["full-object"]
    }
  ];
  spec.lightingFromPhoto = [
    {
      role: "key light",
      direction: "upper-left and forward",
      color: "warm neutral daylight",
      intensity: 1,
      exposure: "ACES Filmic neutral exposure; preserve resin highlights without clipping"
    },
    {
      role: "fill light",
      direction: "front-right",
      color: "cool cyan sky fill",
      intensity: 0.42,
      ambientOcclusion: "soft contact shadow under spin tip and between nested rings"
    },
    {
      role: "rim light",
      direction: "rear and slightly above",
      color: "cool white",
      intensity: 0.58,
      toneMapping: "ACES Filmic; no bloom wash over the clay-resin boundary"
    }
  ];
  fs.writeFileSync(filePath, `${JSON.stringify(spec, null, 2)}\n`, "utf8");
  console.log(`refined ${filePath}`);
}

for (const target of TARGETS) refine(target);
