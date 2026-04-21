import * as THREE from 'three';

const _scratch1 = new THREE.Vector3();
const _scratch2 = new THREE.Vector3();
const _scratch3 = new THREE.Vector3();
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _v4 = new THREE.Vector3();
const _v5 = new THREE.Vector3();

export class Boid {
  constructor(x = 0, y = 0, z = 0, speedMultiplier = 1.0) {
    this.position = new THREE.Vector3(x, y, z);
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.2
    );
    this.acceleration = new THREE.Vector3();
    
    this.baseSpeed = (0.12 + Math.random() * 0.08) * speedMultiplier;
    this.maxSpeed = this.baseSpeed;
    this.maxForce = 0.006;
    
    this.perceptionRadius = 10.0;
    this.separationRadius = 4.0;
    this.evadeRadius = 6.0;
    this.seekRadiusSq = 144.0; 
    
    this.burstTimer = Math.random() * 5;
    this.isBursting = false;
  }

  update(boids, bounds, cursorPosition = null, foodParticles = []) {
    this.acceleration.set(0, 0, 0);
    
    this.burstTimer -= 0.016;
    if (this.burstTimer <= 0) {
      this.isBursting = !this.isBursting;
      this.burstTimer = this.isBursting ? 0.3 + Math.random() * 0.5 : 3 + Math.random() * 3;
      this.maxSpeed = this.isBursting ? this.baseSpeed * 2.8 : this.baseSpeed * 0.6;
    }
    
    const forces = this.flock(boids);
    this.acceleration.add(forces);
    
    if (cursorPosition) {
      const evasion = this.flee(cursorPosition);
      this.acceleration.add(evasion.multiplyScalar(5.0));
    }
    
    this.velocity.add(this.acceleration);
    this.velocity.clampLength(0, this.maxSpeed);
    this.position.add(this.velocity);
    
    this.edges(bounds);
  }

  flee(target) {
    const d = this.position.distanceTo(target);
    const steering = _v4.set(0, 0, 0);
    if (d < this.evadeRadius) {
      steering.copy(this.position).sub(target);
      const forceScale = 1.0 - (d / this.evadeRadius);
      steering.setLength(this.maxSpeed * 2.5);
      steering.sub(this.velocity);
      steering.multiplyScalar(forceScale);
      steering.clampLength(0, this.maxForce * 15.0);
    }
    return steering;
  }

  flock(boids) {
    const sep = this.separation(boids).multiplyScalar(2.5); 
    const ali = this.alignment(boids).multiplyScalar(0.8);
    const coh = this.cohesion(boids).multiplyScalar(0.4);
    return _scratch1.copy(sep).add(ali).add(coh);
  }

  separation(boids) {
    let steering = _v1.set(0, 0, 0);
    let total = 0;
    for (const other of boids) {
      const dSq = this.position.distanceToSquared(other.position);
      if (other !== this && dSq < 25.0) { 
        const diff = _scratch3.copy(this.position).sub(other.position);
        diff.divideScalar(Math.max(dSq, 0.1));
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) steering.divideScalar(total).setLength(this.maxSpeed).sub(this.velocity).clampLength(0, this.maxForce);
    return steering;
  }

  alignment(boids) {
    let steering = _v2.set(0, 0, 0);
    let total = 0;
    for (const other of boids) {
      const dSq = this.position.distanceToSquared(other.position);
      if (other !== this && dSq < 100.0) { 
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) steering.divideScalar(total).setLength(this.maxSpeed).sub(this.velocity).clampLength(0, this.maxForce);
    return steering;
  }

  cohesion(boids) {
    let steering = _v3.set(0, 0, 0);
    let total = 0;
    for (const other of boids) {
      const dSq = this.position.distanceToSquared(other.position);
      if (other !== this && dSq < 100.0) { 
        steering.add(other.position);
        total++;
      }
    }
    if (total > 0) steering.divideScalar(total).sub(this.position).setLength(this.maxSpeed).sub(this.velocity).clampLength(0, this.maxForce);
    return steering;
  }

  // STABLE EDGES: Steer back instead of teleporting to prevent "vanishing"
  edges(bounds) {
    const xMin = bounds.xMin !== undefined ? bounds.xMin : -(bounds.x || 10);
    const xMax = bounds.xMax !== undefined ? bounds.xMax : (bounds.x || 10);
    const yMin = bounds.yMin !== undefined ? bounds.yMin : -(bounds.y || 10);
    const yMax = bounds.yMax !== undefined ? bounds.yMax : (bounds.y || 10);
    const zMin = bounds.zMin !== undefined ? bounds.zMin : -(bounds.z || 10);
    const zMax = bounds.zMax !== undefined ? bounds.zMax : (bounds.z || 10);

    const margin = 5.0; // Distance from edge to start steering back
    const turnForce = 0.015;

    if (this.position.x > xMax - margin) this.velocity.x -= turnForce;
    if (this.position.x < xMin + margin) this.velocity.x += turnForce;
    if (this.position.y > yMax - margin) this.velocity.y -= turnForce;
    if (this.position.y < yMin + margin) this.velocity.y += turnForce;
    if (this.position.z > zMax - margin) this.velocity.z -= turnForce;
    if (this.position.z < zMin + margin) this.velocity.z += turnForce;

    // Hard limit fail-safe (clamp instead of teleport)
    this.position.x = Math.max(xMin, Math.min(xMax, this.position.x));
    this.position.y = Math.max(yMin, Math.min(yMax, this.position.y));
    this.position.z = Math.max(zMin, Math.min(zMax, this.position.z));
  }
}

export const createFlock = (n, bounds, speedMultiplier = 1.0) => {
  const boids = [];
  const xMin = bounds.xMin !== undefined ? bounds.xMin : -(bounds.x || 10);
  const xMax = bounds.xMax !== undefined ? bounds.xMax : (bounds.x || 10);
  const yMin = bounds.yMin !== undefined ? bounds.yMin : -(bounds.y || 10);
  const yMax = bounds.yMax !== undefined ? bounds.yMax : (bounds.y || 10);
  const zMin = bounds.zMin !== undefined ? bounds.zMin : -(bounds.z || 10);
  const zMax = bounds.zMax !== undefined ? bounds.zMax : (bounds.z || 10);

  for (let i = 0; i < n; i++) {
    boids.push(new Boid(
      xMin + Math.random() * (xMax - xMin),
      yMin + Math.random() * (yMax - yMin),
      zMin + Math.random() * (zMax - zMin),
      speedMultiplier
    ));
  }
  return boids;
};
