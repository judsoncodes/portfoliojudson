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
    this.seekRadiusSq = 144.0; // 12 * 12
    
    this.burstTimer = Math.random() * 5;
    this.isBursting = false;
  }

  update(boids, bounds, cursorPosition = null, foodParticles = []) {
    this.acceleration.set(0, 0, 0);
    
    // Burst and Glide
    this.burstTimer -= 0.016;
    if (this.burstTimer <= 0) {
      this.isBursting = !this.isBursting;
      this.burstTimer = this.isBursting ? 0.3 + Math.random() * 0.5 : 3 + Math.random() * 3;
      this.maxSpeed = this.isBursting ? this.baseSpeed * 2.8 : this.baseSpeed * 0.6;
    }
    
    const forces = this.flock(boids);
    this.acceleration.add(forces);
    
    // Evasion
    if (cursorPosition) {
      const evasion = this.flee(cursorPosition);
      this.acceleration.add(evasion.multiplyScalar(5.0));
    }
    
    // Intense Food Seeking
    if (foodParticles.length > 0) {
      const { force, consumedIndex } = this.seekFood(foodParticles);
      // Much stronger force for the feeding frenzy
      this.acceleration.add(force.multiplyScalar(10.0));
      if (consumedIndex !== -1) {
        foodParticles[consumedIndex].expired = true;
      }
    }
    
    this.velocity.add(this.acceleration);
    this.velocity.clampLength(0, this.maxSpeed);
    this.position.add(this.velocity);
    
    this.edges(bounds);
  }

  seekFood(particles) {
    let steering = _v5.set(0, 0, 0);
    let consumedIndex = -1;
    let closestDistSq = Infinity;
    let target = null;

    // Check all particles for the closest one
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.expired) continue;
      
      const dSq = this.position.distanceToSquared(p.position);
      
      // Increased consumption radius slightly for better feel
      if (dSq < 0.3) {
        consumedIndex = i;
        break;
      }

      if (dSq < this.seekRadiusSq && dSq < closestDistSq) {
        closestDistSq = dSq;
        target = p.position;
      }
    }

    if (target) {
      steering.copy(target).sub(this.position);
      steering.setLength(this.maxSpeed * 3.0); // Sprint to food
      steering.sub(this.velocity);
      // Intense attraction
      const falloff = Math.max(closestDistSq * 0.05, 0.05);
      steering.divideScalar(falloff); 
      steering.clampLength(0, this.maxForce * 25.0);
    }

    return { force: steering, consumedIndex };
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
    // During feeding, separation is slightly less important than getting the food
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
      if (other !== this && dSq < 25.0) { // 5 * 5
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
      if (other !== this && dSq < 100.0) { // 10 * 10
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
      if (other !== this && dSq < 100.0) { // 10 * 10
        steering.add(other.position);
        total++;
      }
    }
    if (total > 0) steering.divideScalar(total).sub(this.position).setLength(this.maxSpeed).sub(this.velocity).clampLength(0, this.maxForce);
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

export const createFlock = (n, bounds, speedMultiplier = 1.0) => {
  const boids = [];
  for (let i = 0; i < n; i++) {
    boids.push(new Boid(
      (Math.random() - 0.5) * bounds.x * 2,
      (Math.random() - 0.5) * bounds.y * 2,
      (Math.random() - 0.5) * bounds.z * 2,
      speedMultiplier
    ));
  }
  return boids;
};
