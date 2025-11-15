import * as THREE from 'three';

/**
 * Environment System - Creates themed 3D environments for each level
 * Themes: Urban, Industrial, Underground, Jungle, Space, Haunted, Western
 */

export class EnvironmentSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.currentEnvironment = [];
    this.theme = 'urban';
  }

  /**
   * Create environment for a level based on theme
   */
  createEnvironment(theme, levelNumber) {
    this.clearEnvironment();
    this.theme = theme;

    const scene = this.gameEngine.getScene();

    switch (theme) {
      case 'urban':
        this.createUrbanEnvironment(scene, levelNumber);
        break;
      case 'industrial':
        this.createIndustrialEnvironment(scene, levelNumber);
        break;
      case 'underground':
        this.createUndergroundEnvironment(scene, levelNumber);
        break;
      case 'jungle':
        this.createJungleEnvironment(scene, levelNumber);
        break;
      case 'space':
        this.createSpaceEnvironment(scene, levelNumber);
        break;
      case 'haunted':
        this.createHauntedEnvironment(scene, levelNumber);
        break;
      case 'western':
        this.createWesternEnvironment(scene, levelNumber);
        break;
      default:
        this.createUrbanEnvironment(scene, levelNumber);
    }
  }

  /**
   * Urban City Environment
   */
  createUrbanEnvironment(scene, levelNumber) {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);
    this.currentEnvironment.push(ground);

    // Buildings on sides
    for (let i = 0; i < 10; i++) {
      const building = this.createBuilding();
      const side = i % 2 === 0 ? -1 : 1;
      building.position.set(
        side * (15 + Math.random() * 5),
        Math.random() * 5 + 5,
        -i * 20 - 10
      );
      scene.add(building);
      this.currentEnvironment.push(building);
    }

    // Street lights
    for (let i = 0; i < 15; i++) {
      const light = this.createStreetLight();
      light.position.set(
        (i % 2 === 0 ? -1 : 1) * 12,
        0,
        -i * 15
      );
      scene.add(light);
      this.currentEnvironment.push(light);
    }

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    this.currentEnvironment.push(ambientLight);
  }

  /**
   * Industrial Factory Environment
   */
  createIndustrialEnvironment(scene, levelNumber) {
    // Metal floor
    const floorGeometry = new THREE.PlaneGeometry(100, 200);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.4
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    scene.add(floor);
    this.currentEnvironment.push(floor);

    // Pipes and machinery
    for (let i = 0; i < 20; i++) {
      const pipe = this.createPipe();
      pipe.position.set(
        (Math.random() - 0.5) * 30,
        Math.random() * 8 + 2,
        -Math.random() * 150
      );
      scene.add(pipe);
      this.currentEnvironment.push(pipe);
    }

    // Orange warning lights
    const warningLight = new THREE.PointLight(0xff8800, 2, 30);
    warningLight.position.set(0, 8, -50);
    scene.add(warningLight);
    this.currentEnvironment.push(warningLight);
  }

  /**
   * Underground Fortress Environment
   */
  createUndergroundEnvironment(scene, levelNumber) {
    // Stone floor
    const floorGeometry = new THREE.PlaneGeometry(80, 200);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    scene.add(floor);
    this.currentEnvironment.push(floor);

    // Walls on sides
    for (let i = 0; i < 2; i++) {
      const wallGeometry = new THREE.BoxGeometry(2, 15, 200);
      const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set((i === 0 ? -1 : 1) * 40, 7, -100);
      scene.add(wall);
      this.currentEnvironment.push(wall);
    }

    // Dim blue lights
    const caveLight = new THREE.PointLight(0x4444ff, 1, 40);
    caveLight.position.set(0, 10, -50);
    scene.add(caveLight);
    this.currentEnvironment.push(caveLight);
  }

  /**
   * Jungle Environment
   */
  createJungleEnvironment(scene, levelNumber) {
    // Grass ground
    const groundGeometry = new THREE.PlaneGeometry(100, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x2a5a1a });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);
    this.currentEnvironment.push(ground);

    // Trees
    for (let i = 0; i < 30; i++) {
      const tree = this.createTree();
      tree.position.set(
        (Math.random() - 0.5) * 80,
        0,
        -Math.random() * 180
      );
      scene.add(tree);
      this.currentEnvironment.push(tree);
    }

    // Green ambient light
    const jungleLight = new THREE.AmbientLight(0x60a060, 1.2);
    scene.add(jungleLight);
    this.currentEnvironment.push(jungleLight);
  }

  /**
   * Space Station Environment
   */
  createSpaceEnvironment(scene, levelNumber) {
    // Metal grid floor
    const floorGeometry = new THREE.PlaneGeometry(60, 200);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.9,
      roughness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    scene.add(floor);
    this.currentEnvironment.push(floor);

    // Corridor walls with windows showing stars
    const wallGeometry = new THREE.BoxGeometry(1, 10, 200);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.7 });

    for (let i = 0; i < 2; i++) {
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set((i === 0 ? -1 : 1) * 30, 5, -100);
      scene.add(wall);
      this.currentEnvironment.push(wall);
    }

    // Blue space lights
    for (let i = 0; i < 10; i++) {
      const light = new THREE.PointLight(0x00ffff, 1.5, 25);
      light.position.set(0, 8, -i * 20);
      scene.add(light);
      this.currentEnvironment.push(light);
    }
  }

  /**
   * Haunted Mansion Environment
   */
  createHauntedEnvironment(scene, levelNumber) {
    // Dark wood floor
    const floorGeometry = new THREE.PlaneGeometry(80, 200);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x2a1a1a });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    scene.add(floor);
    this.currentEnvironment.push(floor);

    // Gothic pillars
    for (let i = 0; i < 12; i++) {
      const pillar = this.createPillar();
      const side = i % 2 === 0 ? -1 : 1;
      pillar.position.set(side * 20, 0, -i * 15 - 5);
      scene.add(pillar);
      this.currentEnvironment.push(pillar);
    }

    // Eerie purple/green lights
    const eerieLight = new THREE.PointLight(0x8844ff, 1, 35);
    eerieLight.position.set(0, 8, -50);
    scene.add(eerieLight);
    this.currentEnvironment.push(eerieLight);

    // Fog
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 80);
  }

  /**
   * Western Town Environment
   */
  createWesternEnvironment(scene, levelNumber) {
    // Sandy ground
    const groundGeometry = new THREE.PlaneGeometry(100, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xc2b280 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);
    this.currentEnvironment.push(ground);

    // Western buildings
    for (let i = 0; i < 8; i++) {
      const building = this.createWesternBuilding();
      const side = i % 2 === 0 ? -1 : 1;
      building.position.set(side * (15 + Math.random() * 3), 0, -i * 25 - 10);
      scene.add(building);
      this.currentEnvironment.push(building);
    }

    // Bright sun-like ambient light
    const sunLight = new THREE.AmbientLight(0xffeeaa, 1.5);
    scene.add(sunLight);
    this.currentEnvironment.push(sunLight);

    // Directional sunlight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 0);
    scene.add(directionalLight);
    this.currentEnvironment.push(directionalLight);
  }

  // Helper methods to create environment objects

  createBuilding() {
    const building = new THREE.Group();
    const height = 15 + Math.random() * 20;
    const geometry = new THREE.BoxGeometry(8, height, 10);
    const material = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = height / 2;
    building.add(mesh);
    return building;
  }

  createStreetLight() {
    const group = new THREE.Group();
    const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 5, 8);
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 2.5;
    group.add(pole);

    const lightGeometry = new THREE.SphereGeometry(0.5);
    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa });
    const light = new THREE.Mesh(lightGeometry, lightMaterial);
    light.position.y = 5;
    group.add(light);

    return group;
  }

  createPipe() {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 15, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.3
    });
    const pipe = new THREE.Mesh(geometry, material);
    pipe.rotation.z = Math.PI / 2;
    return pipe;
  }

  createTree() {
    const group = new THREE.Group();
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.6, 6, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 3;
    group.add(trunk);

    // Foliage
    const foliageGeometry = new THREE.SphereGeometry(3, 8, 8);
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x2a6a2a });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 7;
    group.add(foliage);

    return group;
  }

  createPillar() {
    const geometry = new THREE.CylinderGeometry(1, 1.2, 12, 8);
    const material = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
    const pillar = new THREE.Mesh(geometry, material);
    pillar.position.y = 6;
    return pillar;
  }

  createWesternBuilding() {
    const group = new THREE.Group();
    const geometry = new THREE.BoxGeometry(10, 8, 8);
    const material = new THREE.MeshLambertMaterial({ color: 0x8b7355 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 4;
    group.add(mesh);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(7, 3, 4);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x5a4a3a });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 9.5;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    return group;
  }

  /**
   * Clear current environment
   */
  clearEnvironment() {
    const scene = this.gameEngine.getScene();
    this.currentEnvironment.forEach(obj => {
      scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    this.currentEnvironment = [];

    // Clear fog
    scene.fog = null;
  }

  /**
   * Get theme for level number
   */
  static getThemeForLevel(levelNumber) {
    const themes = {
      1: 'urban',
      2: 'industrial',
      3: 'underground',
      4: 'jungle',
      5: 'space',
      6: 'haunted',
      7: 'western',
      8: 'urban',
      9: 'jungle',
      10: 'space',
      11: 'haunted',
      12: 'underground' // Final boss
    };

    return themes[levelNumber] || 'urban';
  }
}

export default EnvironmentSystem;
