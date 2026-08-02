# Three.js 2.5D RO-Style Habitat & Billboard Skill

This skill defines the technical standard for creating Ragnarok Online (RO) style 2.5D habitats in Nexus Link:
- 3D Low-Poly Environment / Buildings / Terrain (Three.js WebGL)
- Fixed Perspective or Orthographic Isometric Camera (Tilt ~35°, FOV 45°)
- 2D Sprites facing Camera (Billboard Technique) or 4/8-direction Facing System

## Key Architecture

### 1. 2D Sprite Billboarding in 3D Space
To make 2D companion sprites stand in a 3D habitat while facing the camera:

```javascript
import * as THREE from 'three';

export function create2DBillboardCompanion(texture) {
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false
  });
  
  const sprite = new THREE.Sprite(spriteMaterial);
  // Scale based on aspect ratio
  sprite.scale.set(2.0, 2.0, 1.0);
  sprite.center.set(0.5, 0.0); // Ground at feet
  return sprite;
}

// In tick loop: Billboard facing camera
export function updateBillboardFacing(companionSprite, camera) {
  // THREE.Sprite automatically faces the camera by default!
  // If using PlaneGeometry instead of THREE.Sprite:
  // planeMesh.quaternion.copy(camera.quaternion);
}
```

### 2. RO-Style 8-Direction Sprite Selection
To change sprite direction based on camera angle:
```javascript
export function get8DirectionIndex(companionRotationY, cameraRotationY) {
  let angle = companionRotationY - cameraRotationY;
  angle = (angle + Math.PI * 2) % (Math.PI * 2);
  const octant = Math.round((angle / (Math.PI * 2)) * 8) % 8;
  // Returns 0: Front, 1: Front-Right, 2: Right, 3: Back-Right, 4: Back, etc.
  return octant;
}
```

### 3. Recommended GitHub Plugins & Libraries for RO 2.5D
1. **`@pixi3d/pixi3d`**: Native 3D engine extension for PixiJS (mixes 3D GLTF models & 2D Pixi Sprites).
2. **`three-pathfinding`**: NavMesh A* pathfinding for 3D terrain & buildings.
3. **`Yuka`**: 3D Game AI, Steering Behaviors & NavMesh movement for companion roaming in habitat.
