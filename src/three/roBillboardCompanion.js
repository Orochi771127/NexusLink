/**
 * roBillboardCompanion.js
 *
 * 2.5D RO-Style Billboard Companion Renderer for Nexus Link.
 * Combines 3D Habitat space positioning with 2D Billboard facing (Ragnarok Online style).
 */

import { MOONLAKE_2D5_RO_CONFIG } from './moonlakeLive3dConfig.js';

export class ROBillboardCompanion {
  /**
   * @param {Object} options
   * @param {Object} options.THREE - Three.js namespace
   * @param {Object} options.scene - Three.js Scene
   * @param {string} [options.texturePath] - Path to 2D companion sprite texture
   */
  constructor({ THREE, scene, texturePath } = {}) {
    this.THREE = THREE;
    this.scene = scene;
    this.config = MOONLAKE_2D5_RO_CONFIG || {};

    this.group = new THREE.Group();
    this.group.name = "ro_billboard_companion";

    // 1. 2D Billboard Sprite
    this.spriteMaterial = new THREE.SpriteMaterial({
      transparent: true,
      depthTest: true,
      depthWrite: false
    });

    if (texturePath) {
      this.loadTexture(texturePath);
    }

    this.sprite = new THREE.Sprite(this.spriteMaterial);
    this.sprite.scale.set(
      this.config.billboardScale?.width || 2.2,
      this.config.billboardScale?.height || 2.2,
      1.0
    );
    // Ground anchor at feet
    this.sprite.center.set(
      this.config.billboardScale?.anchorX || 0.5,
      this.config.billboardScale?.anchorY || 0.0
    );
    this.group.add(this.sprite);

    // 2. Ground Shadow Blob (2.5D RO Style)
    const shadowGeo = new THREE.PlaneGeometry(1.2, 0.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x030814,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02; // Slightly above ground to prevent z-fighting
    this.group.add(this.shadowMesh);

    // State tracking
    this.facingAngle = 0; // Companion world Y angle in radians
    this.currentDirectionIndex = 0; // 0..7 (Front, Front-Right, Right...)

    if (this.scene) {
      this.scene.add(this.group);
    }
  }

  /**
   * Load or update sprite texture
   * @param {string} texturePath
   */
  loadTexture(texturePath) {
    if (!this.THREE || !texturePath) return;
    const loader = new this.THREE.TextureLoader();
    loader.load(texturePath, (tex) => {
      tex.colorSpace = this.THREE.SRGBColorSpace;
      this.spriteMaterial.map = tex;
      this.spriteMaterial.needsUpdate = true;
    });
  }

  /**
   * Set 3D World Position of the companion
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  /**
   * Get 3D World Position
   */
  getPosition() {
    return this.group.position;
  }

  /**
   * Update Billboard facing based on 3D Camera angle (RO 8-Direction system)
   * @param {Object} camera - Three.js Camera
   */
  updateFacing(camera) {
    if (!camera) return;

    // Calculate relative camera yaw
    const cameraDirection = new this.THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const cameraYaw = Math.atan2(cameraDirection.x, cameraDirection.z);

    // RO 8-direction index calculation
    const relAngle = (this.facingAngle - cameraYaw + Math.PI * 2) % (Math.PI * 2);
    const octant = Math.round((relAngle / (Math.PI * 2)) * 8) % 8;

    this.currentDirectionIndex = octant;
  }

  /**
   * Project 3D Billboard position to 2D Screen pixel coordinates for UI overlay
   * @param {Object} camera
   * @param {number} screenWidth
   * @param {number} screenHeight
   */
  getScreenCoordinates(camera, screenWidth, screenHeight) {
    if (!camera || !screenWidth || !screenHeight) return { x: 0, y: 0, visible: false };

    const pos = this.group.position.clone();
    pos.y += (this.config.billboardScale?.height || 2.2) * 0.5; // Focal center
    pos.project(camera);

    const x = (pos.x * 0.5 + 0.5) * screenWidth;
    const y = (-pos.y * 0.5 + 0.5) * screenHeight;
    const visible = pos.z < 1.0;

    return { x, y, visible };
  }

  /**
   * Clean up 3D meshes & materials
   */
  destroy() {
    if (this.spriteMaterial) this.spriteMaterial.destroy();
    if (this.shadowMesh) {
      this.shadowMesh.geometry.dispose();
      this.shadowMesh.material.dispose();
    }
    if (this.scene) {
      this.scene.remove(this.group);
    }
  }
}

export function createROBillboardCompanion(options) {
  return new ROBillboardCompanion(options);
}
