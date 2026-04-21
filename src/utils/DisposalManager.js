import * as THREE from 'three';

class DisposalManager {
  constructor() {
    this.resources = new Set();
  }

  /**
   * Register a Three.js resource for tracking.
   * @param {THREE.Object3D|THREE.BufferGeometry|THREE.Material|THREE.Texture} obj 
   * @returns The object itself for chaining
   */
  register(obj) {
    if (!obj) return obj;

    // If it's an object with children, we might want to register them too, 
    // but usually we register geometries and materials specifically.
    if (obj.isBufferGeometry || obj.isMaterial || obj.isTexture) {
      this.resources.add(obj);
    } else if (obj.isObject3D) {
      // For Object3D, we don't necessarily add the object itself to the set 
      // unless we want to remove it from scene, but usually disposal refers to GPU resources.
      if (obj.geometry) this.register(obj.geometry);
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => this.register(m));
        } else {
          this.register(obj.material);
        }
      }
    }
    return obj;
  }

  disposeAll() {
    console.log(`[DisposalManager] Disposing ${this.resources.size} resources...`);
    this.resources.forEach((obj) => {
      if (obj.dispose) {
        obj.dispose();
      }
    });
    this.resources.clear();
  }

  // Helper for tracking newly created objects inline
  track(obj) {
    return this.register(obj);
  }
}

const disposalManager = new DisposalManager();
export default disposalManager;
