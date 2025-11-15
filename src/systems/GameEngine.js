import * as THREE from 'three';
import { EnvironmentSystem } from './EnvironmentSystem.js';

export class GameEngine {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.environmentSystem = null;
    
    // Initialize vectors with safety checks
    try {
      this.cameraOffset = new THREE.Vector3(0, 2, 5);
      this.lookAtOffset = new THREE.Vector3(0, 0, -10);
    } catch (error) {
      console.error('Failed to create Three.js vectors in GameEngine constructor:', error);
      // Fallback to simple objects
      this.cameraOffset = { x: 0, y: 2, z: 5 };
      this.lookAtOffset = { x: 0, y: 0, z: -10 };
    }
    
    this.isMoving = false; // Start with movement disabled for room-based combat
    this.listeners = {};
    this.deltaTime = 0;
    this.totalTime = 0;
  }

  initialize(canvas) {
    try {
      // Create scene
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

      // Create camera
      this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      
      // Ensure camera has position object
      if (!this.camera.position) {
        console.error('Camera position object not created properly');
        throw new Error('Camera initialization failed');
      }

      // Create renderer with extensive debugging
      
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        premultipliedAlpha: false,
        stencil: false,
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false
      });
      
      // Check WebGL context
      const gl = this.renderer.getContext();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setClearColor(0x000000); // Pure black for testing
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      // Safer logging with individual checks
      try {
        const size = this.renderer.getSize(new THREE.Vector2());
      } catch (e) {
        console.warn('  Size check failed:', e.message);
      }
      
      try {
        const pixelRatio = this.renderer.getPixelRatio();
      } catch (e) {
        console.warn('  Pixel ratio check failed:', e.message);
      }
      
      try {
        const clearColor = this.renderer.getClearColor();
      } catch (e) {
        console.warn('  Clear color check failed:', e.message);
      }

      // Create lighting
      this.setupLighting();

      // Initialize environment system
      this.environmentSystem = new EnvironmentSystem(this);

      // Set up camera for room-based combat
      this.setupRoomCamera();

      // Add environment elements
      this.addEnvironmentElements();

      // Handle window resize
      window.addEventListener('resize', this.handleResize.bind(this));

      return true;
      
    } catch (error) {
      console.error('❌ GameEngine initialization failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        camera: !!this.camera,
        scene: !!this.scene,
        renderer: !!this.renderer,
        cameraOffset: !!this.cameraOffset
      });
      
      // Clean up partially initialized state
      this.cleanup();
      throw error; // Re-throw to let the caller handle it
    }
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);

    // Point light for dynamic lighting
    const pointLight = new THREE.PointLight(0xffffff, 0.8, 100);
    pointLight.position.set(0, 10, 0);
    pointLight.castShadow = true;
    this.scene.add(pointLight);
  }

  setupRoomCamera() {
    // Position camera for room-based combat
    // Enemies are positioned at z: -5 to -8, so camera should be further back to see them properly
    this.camera.position.set(0, 2, 3); // Move camera back to z: 3 instead of z: 0
    this.camera.lookAt(0, 0, -6); // Look at center of enemy area
    
    // Adjust field of view for better visibility
    this.camera.fov = 60; // Wider field of view to see more enemies
    this.camera.updateProjectionMatrix();
  }

  addEnvironmentElements() {
    // Add basic environment elements for ambiance (no debug objects)
    
    // Ground plane for visual reference
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x333333,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -2, -6);
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  pauseMovement() {
    this.isMoving = false;
  }

  resumeMovement() {
    this.isMoving = true;
  }

  update() {
    this.deltaTime = this.clock.getDelta();
    this.totalTime += this.deltaTime;

    // Emit update event
    this.emit('update', {
      deltaTime: this.deltaTime,
      totalTime: this.totalTime
    });
  }

  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    } else {
      console.error('❌ Render failed: Missing renderer, scene, or camera', {
        renderer: !!this.renderer,
        scene: !!this.scene,
        camera: !!this.camera
      });
    }
  }

  handleResize() {
    if (!this.camera || !this.renderer) return;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Event system with safety checks
  on(event, callback) {
    if (typeof event !== 'string' || typeof callback !== 'function') {
      console.warn('GameEngine.on: Invalid parameters', event, callback);
      return;
    }
    
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`GameEngine: Error in event listener for ${event}:`, error);
      }
    });
  }

  // Getters
  getCurrentPosition() {
    // Return camera position since we no longer use rails
    return this.camera ? this.camera.position.clone() : new THREE.Vector3();
  }

  getCamera() {
    return this.camera;
  }

  getScene() {
    return this.scene;
  }

  getRenderer() {
    return this.renderer;
  }

  getEnvironmentSystem() {
    return this.environmentSystem;
  }

  setEnvironment(theme, levelNumber) {
    if (this.environmentSystem) {
      this.environmentSystem.createEnvironment(theme, levelNumber);
    } else {
      console.warn('EnvironmentSystem not initialized');
    }
  }

  cleanup() {
    // Clean up environment system
    if (this.environmentSystem) {
      this.environmentSystem.clearEnvironment();
    }

    window.removeEventListener('resize', this.handleResize.bind(this));
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    this.listeners = {};
  }
}