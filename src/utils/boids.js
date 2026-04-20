import * as THREE from 'three';

// Pre-allocate scratch vectors for high performance (Object Pooling)
const _scratch1 = new THREE.Vector3();
const _scratch2 = new THREE.Vector3();
const _scratch3 = new THREE.Vector3();
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();

export class Boid {
  constructor(x = 0, y = 0, z = 0) {
    this.position = new THREE.Vector3(x, y, z);
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.2
    );
    this.acceleration = new THREE.Vector3();
    
    this.maxSpeed = 0.15;
    this.maxForce = 0.005;
    
    // Rule Radii
    this.perceptionRadius = 5.0;
    this.separationRadius = 2.0;
  }

  update(boids, bounds) {
    this.acceleration.set(0, 0, 0);
    
    const forces = this.flock(boids);
    this.acceleration.add(forces);
    
    this.velocity.add(this.acceleration);
    this.velocity.clampLength(0, this.maxSpeed);
    
    this.position.add(this.velocity);
    
    this.edges(bounds);
  }

  flock(boids) {
    const sep = this.separation(boids).multiplyScalar(1.5);
    const ali = this.alignment(boids).multiplyScalar(1.0);
    const coh = this.cohesion(boids).multiplyScalar(1.0);
    
    return _scratch1.copy(sep).add(ali).add(coh);
  }

  separation(boids) {
    let steering = _v1.set(0, 0, 0);
    let total = 0;
    
    for (const other of boids) {
      const d = this.position.distanceTo(other.position);
      if (other !== this && d < this.separationRadius) {
        const diff = _scratch2.copy(this.position).sub(other.position);
        diff.divideScalar(d * d); // Weight by distance
        steering.add(diff);
        total++;
      }
    }
    
    if (total > 0) {
      steering.divideScalar(total);
      steering.setLength(this.maxSpeed);
      steering.sub(this.velocity);
      steering.clampLength(0, this.maxForce);
    }
    
    return steering;
  }

  alignment(boids) {
    let steering = _v2.set(0, 0, 0);
    let total = 0;
    
    for (const other of boids) {
      const d = this.position.distanceTo(other.position);
      if (other !== this && d < this.perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }
    
    if (total > 0) {
      steering.divideScalar(total);
      steering.setLength(this.maxSpeed);
      steering.sub(this.velocity);
      steering.clampLength(0, this.maxForce);
    }
    
    return steering;
  }

  cohesion(boids) {
    let steering = _v3.set(0, 0, 0);
    let total = 0;
    
    for (const other of boids) {
      const d = this.position.distanceTo(other.position);
      if (other !== this && d < this.perceptionRadius) {
        steering.add(other.position);
        total++;
      }
    }
    
    if (total > 0) {
      steering.divideScalar(total);
      steering.sub(this.position);
      steering.setLength(this.maxSpeed);
      steering.sub(this.velocity);
      steering.clampLength(0, this.maxForce);
    }
    
    return steering;
  }

  edges(bounds) {
    const { x, y, z } = bounds;
    if (this.position.x > x) this.position.x = -x;
    if (this.position.x < -x) this.position.x = x;
    if (this.position.y > y) this.position.y = -y;
    if (this.position.y < -y) this.position.y = y;
    if (this.position.z > z) this.position.z = -z;
    if (this.position.z < -z) this.position.z = z;
  }
}

export const createFlock = (n, bounds) => {
  const boids = [];
  const { x, y, z } = bounds;
  for (let i = 0; i < n; i++) {
    boids.push(new Boid(
      (Math.random() - 0.5) * x * 2,
      (Math.random() - 0.5) * y * 2,
      (Math.random() - 0.5) * z * 2
    ));
  }
  return boids;
};
