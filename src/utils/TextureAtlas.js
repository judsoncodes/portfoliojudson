import * as THREE from 'three';
import disposalManager from './DisposalManager';

/**
 * TextureAtlas Utility
 * Manages a single texture containing multiple sprites and provides UV offset logic.
 */
class TextureAtlas {
  constructor(texturePath, cols = 1, rows = 1) {
    const loader = new THREE.TextureLoader();
    this.texture = loader.load(texturePath);
    this.cols = cols;
    this.rows = rows;
    
    // Register the texture for disposal
    disposalManager.register(this.texture);
  }

  /**
   * Get UV offset and scale for a specific sprite index.
   * @param {number} index 
   * @returns {Object} { offset: THREE.Vector2, repeat: THREE.Vector2 }
   */
  getUV(index) {
    const x = index % this.cols;
    const y = Math.floor(index / this.cols);
    
    return {
      offset: new THREE.Vector2(x / this.cols, 1 - (y + 1) / this.rows),
      repeat: new THREE.Vector2(1 / this.cols, 1 / this.rows)
    };
  }

  /**
   * Apply UV mapping to a geometry or material uniform.
   */
  applyToMaterial(material, index) {
    const { offset, repeat } = this.getUV(index);
    material.map = this.texture;
    material.map.offset.copy(offset);
    material.map.repeat.copy(repeat);
    material.map.needsUpdate = true;
  }
}

export default TextureAtlas;
