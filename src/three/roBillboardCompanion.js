/**
 * roBillboardCompanion.js
 *
 * 2.5D RO-Style Billboard Companion Renderer for Nexus Link.
 * Combines 3D Habitat space positioning with 2D Billboard facing (Ragnarok Online style).
 *
 * PRESENTATION ONLY. This renderer holds no relationship, evolution,
 * progression, Raphael or save state. World position is pushed in by the
 * existing navigation owner; the renderer never derives or stores it.
 */

import {
  MOONLAKE_2D5_RO_CONFIG,
  MOONLAKE_COMPANION_DIRECTION_SHEETS
} from './moonlakeLive3dConfig.js';

const DIRECTION_ORDER = Object.freeze(['front', 'right', 'back', 'left']);

export class ROBillboardCompanion {
  /**
   * @param {Object} options
   * @param {Object} options.THREE - Three.js namespace
   * @param {Object} options.scene - Three.js Scene or Group
   * @param {string} [options.texturePath] - Single-sprite fallback texture
   * @param {Object} [options.directionSheets] - Approved 4-direction sheet set;
   *   pass null to force the single-sprite path.
   * @param {number} [options.footAnchor] - Fraction of sprite height where the
   *   feet sit (matches the authored 0.102 alpha-derived pivot).
   */
  constructor({ THREE, scene, texturePath, directionSheets, footAnchor } = {}) {
    this.THREE = THREE;
    this.scene = scene;
    this.config = MOONLAKE_2D5_RO_CONFIG || {};
    this.disposed = false;

    // Monotonic token: any texture callback from a previous generation is
    // discarded, so a habitat/companion switch mid-load cannot resurrect a
    // stale texture onto a live (or disposed) material.
    this._loadToken = 0;
    this._sheets = null;
    this._sheetTextures = Object.create(null);
    this._frame = 0;
    this._frameTimer = 0;
    this._direction = 'front';

    this.group = new THREE.Group();
    this.group.name = 'ro_billboard_companion';

    this.spriteMaterial = new THREE.SpriteMaterial({
      transparent: true,
      depthTest: true,
      depthWrite: false
    });

    this.sprite = new THREE.Sprite(this.spriteMaterial);
    this.sprite.scale.set(
      this.config.billboardScale?.width || 2.2,
      this.config.billboardScale?.height || 2.2,
      1.0
    );
    // Feet, not the sprite's bottom edge, align to the world position.
    this.footAnchor = typeof footAnchor === 'number' ? footAnchor : 0.102;
    this.sprite.center.set(
      this.config.billboardScale?.anchorX ?? 0.5,
      this.footAnchor
    );
    this.group.add(this.sprite);

    const shadowGeo = new THREE.PlaneGeometry(1.2, 0.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x030814,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;
    this.group.add(this.shadowMesh);

    this.facingAngle = 0;
    this.currentDirectionIndex = 0;

    if (directionSheets !== null) {
      this.setDirectionSheets(directionSheets || MOONLAKE_COMPANION_DIRECTION_SHEETS);
    }
    if (texturePath && !this._sheets) {
      this.loadTexture(texturePath);
    }

    if (this.scene) this.scene.add(this.group);
  }

  /**
   * Show/hide without tearing down -- used to guarantee exactly one visible
   * companion presentation across the Pixi and Three.js render modes.
   */
  setVisible(visible) {
    this.group.visible = Boolean(visible);
  }

  get visible() {
    return this.group.visible;
  }

  _isRetained(texture) {
    for (const key of Object.keys(this._sheetTextures)) {
      if (this._sheetTextures[key] === texture) return true;
    }
    return false;
  }

  _adoptTexture(texture) {
    if (!texture) return;
    texture.colorSpace = this.THREE.SRGBColorSpace;
    const previous = this.spriteMaterial.map;
    this.spriteMaterial.map = texture;
    this.spriteMaterial.needsUpdate = true;
    // Release the texture we just displaced (unless it is a retained sheet).
    if (previous && previous !== texture && !this._isRetained(previous)) {
      previous.dispose();
    }
  }

  /**
   * Single-sprite path. Safe against disposal and against load failure.
   * @param {string} texturePath
   */
  loadTexture(texturePath) {
    if (!this.THREE || !texturePath || this.disposed) return;
    const token = ++this._loadToken;
    const loader = new this.THREE.TextureLoader();
    loader.load(
      texturePath,
      (tex) => {
        if (this.disposed || token !== this._loadToken) {
          tex.dispose();          // stale or post-disposal: never leak it
          return;
        }
        this._adoptTexture(tex);
      },
      undefined,
      (error) => {
        if (this.disposed || token !== this._loadToken) return;
        console.warn('[ROBillboardCompanion] texture load failed:', texturePath, error);
        // Keep whatever is already displayed; never blank the companion.
      }
    );
  }

  /**
   * Load the approved 4-direction sheets. Any direction that fails to load is
   * simply absent and the renderer keeps the single-sprite presentation for
   * that direction -- no frame is ever synthesised.
   */
  setDirectionSheets(sheets) {
    if (!this.THREE || this.disposed) return;
    if (!sheets || !sheets.directions) return;
    const token = ++this._loadToken;
    this._sheets = sheets;
    const loader = new this.THREE.TextureLoader();

    for (const dir of DIRECTION_ORDER) {
      const url = sheets.directions[dir];
      if (!url) continue;
      loader.load(
        url,
        (tex) => {
          if (this.disposed || token !== this._loadToken) {
            tex.dispose();
            return;
          }
          tex.colorSpace = this.THREE.SRGBColorSpace;
          tex.wrapS = this.THREE.ClampToEdgeWrapping;
          tex.wrapT = this.THREE.ClampToEdgeWrapping;
          tex.repeat.set(1 / sheets.columns, 1 / sheets.rows);
          const old = this._sheetTextures[dir];
          this._sheetTextures[dir] = tex;
          if (old && old !== tex) old.dispose();
          if (dir === this._direction) this._applyFrame();
        },
        undefined,
        (error) => {
          if (this.disposed || token !== this._loadToken) return;
          console.warn('[ROBillboardCompanion] direction sheet failed:', dir, error);
        }
      );
    }
  }

  _applyFrame() {
    const sheets = this._sheets;
    const tex = sheets ? this._sheetTextures[this._direction] : null;
    if (!sheets || !tex) return;
    const cols = sheets.columns || 1;
    const rows = sheets.rows || 1;
    const total = sheets.frames || cols * rows;
    const idx = ((this._frame % total) + total) % total;
    const cx = idx % cols;
    const cy = Math.floor(idx / cols);
    tex.offset.set(cx / cols, 1 - (cy + 1) / rows);
    if (this.spriteMaterial.map !== tex) {
      this.spriteMaterial.map = tex;
      this.spriteMaterial.needsUpdate = true;
    }
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  getPosition() {
    return this.group.position;
  }

  /** World heading the companion body faces, in radians. */
  setFacingAngle(radians) {
    if (Number.isFinite(radians)) this.facingAngle = radians;
  }

  /**
   * Advance the walk cycle. Safe to call with no sheets loaded.
   * @param {number} deltaSeconds
   */
  advance(deltaSeconds) {
    if (this.disposed || !this._sheets) return;
    const fps = this._sheets.fps || 8;
    const dt = Number.isFinite(deltaSeconds) ? Math.max(0, Math.min(0.1, deltaSeconds)) : 0;
    this._frameTimer += dt;
    const step = 1 / fps;
    let changed = false;
    while (this._frameTimer >= step) {
      this._frameTimer -= step;
      this._frame += 1;
      changed = true;
    }
    if (changed) this._applyFrame();
  }

  /**
   * Update billboard facing from the camera (RO direction convention).
   * The eight octants collapse onto the four approved sheets.
   */
  updateFacing(camera) {
    if (!camera || this.disposed) return;

    const cameraDirection = new this.THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const cameraYaw = Math.atan2(cameraDirection.x, cameraDirection.z);

    const relAngle = (this.facingAngle - cameraYaw + Math.PI * 2) % (Math.PI * 2);
    const octant = Math.round((relAngle / (Math.PI * 2)) * 8) % 8;
    this.currentDirectionIndex = octant;

    const quadrant = Math.round((relAngle / (Math.PI * 2)) * 4) % 4;
    const next = DIRECTION_ORDER[quadrant] || 'front';
    if (next !== this._direction) {
      this._direction = next;
      this._frame = 0;
      this._frameTimer = 0;
      this._applyFrame();
    }
  }

  get currentDirection() {
    return this._direction;
  }

  get loadedDirectionCount() {
    return Object.keys(this._sheetTextures).length;
  }

  getScreenCoordinates(camera, screenWidth, screenHeight) {
    if (!camera || !screenWidth || !screenHeight) return { x: 0, y: 0, visible: false };

    const pos = this.group.position.clone();
    pos.y += (this.config.billboardScale?.height || 2.2) * 0.5;
    pos.project(camera);

    const x = (pos.x * 0.5 + 0.5) * screenWidth;
    const y = (-pos.y * 0.5 + 0.5) * screenHeight;
    const visible = pos.z < 1.0;

    return { x, y, visible };
  }

  /**
   * Release every GPU resource this renderer owns.
   *
   * Three.js materials expose dispose(), not destroy(). The previous
   * destroy() called a non-existent API, which threw and left the sprite
   * material and its texture leaked on every teardown.
   */
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this._loadToken += 1;      // invalidate any in-flight TextureLoader callback

    for (const key of Object.keys(this._sheetTextures)) {
      const t = this._sheetTextures[key];
      if (t && typeof t.dispose === 'function') t.dispose();
    }
    this._sheetTextures = Object.create(null);

    if (this.spriteMaterial) {
      if (this.spriteMaterial.map) this.spriteMaterial.map.dispose();
      this.spriteMaterial.map = null;
      this.spriteMaterial.dispose();
    }
    if (this.shadowMesh) {
      this.shadowMesh.geometry.dispose();
      this.shadowMesh.material.dispose();
    }
    this.group.remove(this.sprite);
    this.group.remove(this.shadowMesh);
    if (this.scene) this.scene.remove(this.group);
  }

  /** @deprecated retained for call-site compatibility; forwards to dispose(). */
  destroy() {
    this.dispose();
  }
}

export function createROBillboardCompanion(options) {
  return new ROBillboardCompanion(options);
}
