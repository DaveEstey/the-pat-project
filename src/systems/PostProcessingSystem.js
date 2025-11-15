/**
 * Post-Processing System
 * Manages visual post-processing effects like bloom, motion blur, and vignette
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

let postProcessingSystemInstance = null;

export function initializePostProcessingSystem(renderer, scene, camera) {
  if (postProcessingSystemInstance) {
    return postProcessingSystemInstance;
  }
  postProcessingSystemInstance = new PostProcessingSystem(renderer, scene, camera);
  return postProcessingSystemInstance;
}

export function getPostProcessingSystem() {
  if (!postProcessingSystemInstance) {
    console.warn('[PostProcessingSystem] Not initialized');
    return null;
  }
  return postProcessingSystemInstance;
}

// Custom Vignette Shader
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.0 },
    darkness: { value: 1.0 }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      float vignette = 1.0 - dot(uv, uv);
      vignette = clamp(pow(vignette, darkness), 0.0, 1.0);
      gl_FragColor = vec4(texel.rgb * vignette, texel.a);
    }
  `
};

// Custom Motion Blur Shader
const MotionBlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    tPrevious: { value: null },
    blurAmount: { value: 0.5 }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tPrevious;
    uniform float blurAmount;
    varying vec2 vUv;

    void main() {
      vec4 current = texture2D(tDiffuse, vUv);
      vec4 previous = texture2D(tPrevious, vUv);
      gl_FragColor = mix(current, previous, blurAmount);
    }
  `
};

// Custom Chromatic Aberration Shader
const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.005 }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    varying vec2 vUv;

    void main() {
      vec2 offset = (vUv - 0.5) * amount;
      float r = texture2D(tDiffuse, vUv + offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - offset).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `
};

export class PostProcessingSystem {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.composer = null;
    this.passes = {};

    // Effect settings
    this.settings = {
      bloom: {
        enabled: true,
        strength: 0.5,
        radius: 0.4,
        threshold: 0.85
      },
      vignette: {
        enabled: true,
        offset: 1.0,
        darkness: 1.5
      },
      motionBlur: {
        enabled: false,
        amount: 0.3
      },
      chromaticAberration: {
        enabled: false,
        amount: 0.003
      }
    };

    // Previous frame texture for motion blur
    this.previousFrameTexture = null;

    this.initialize();
    this.loadSettings();

    console.log('[PostProcessingSystem] Initialized');
  }

  initialize() {
    const size = this.renderer.getSize(new THREE.Vector2());

    // Create composer
    this.composer = new EffectComposer(this.renderer);

    // Add render pass (renders the actual scene)
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    this.passes.render = renderPass;

    // Add bloom pass
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.x, size.y),
      this.settings.bloom.strength,
      this.settings.bloom.radius,
      this.settings.bloom.threshold
    );
    bloomPass.enabled = this.settings.bloom.enabled;
    this.composer.addPass(bloomPass);
    this.passes.bloom = bloomPass;

    // Add vignette pass
    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms.offset.value = this.settings.vignette.offset;
    vignettePass.uniforms.darkness.value = this.settings.vignette.darkness;
    vignettePass.enabled = this.settings.vignette.enabled;
    this.composer.addPass(vignettePass);
    this.passes.vignette = vignettePass;

    // Add motion blur pass
    const motionBlurPass = new ShaderPass(MotionBlurShader);
    motionBlurPass.uniforms.blurAmount.value = this.settings.motionBlur.amount;
    motionBlurPass.enabled = this.settings.motionBlur.enabled;

    // Create previous frame texture
    this.previousFrameTexture = new THREE.WebGLRenderTarget(size.x, size.y);
    motionBlurPass.uniforms.tPrevious.value = this.previousFrameTexture.texture;

    this.composer.addPass(motionBlurPass);
    this.passes.motionBlur = motionBlurPass;

    // Add chromatic aberration pass
    const chromaticPass = new ShaderPass(ChromaticAberrationShader);
    chromaticPass.uniforms.amount.value = this.settings.chromaticAberration.amount;
    chromaticPass.enabled = this.settings.chromaticAberration.enabled;
    chromaticPass.renderToScreen = true; // Final pass renders to screen
    this.composer.addPass(chromaticPass);
    this.passes.chromatic = chromaticPass;
  }

  // Render with post-processing
  render() {
    if (this.composer) {
      this.composer.render();

      // Update previous frame for motion blur
      if (this.settings.motionBlur.enabled && this.previousFrameTexture) {
        this.renderer.setRenderTarget(this.previousFrameTexture);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setRenderTarget(null);
      }
    }
  }

  // Update settings
  updateSettings(category, settings) {
    if (!this.settings[category]) return;

    Object.assign(this.settings[category], settings);

    switch (category) {
      case 'bloom':
        if (this.passes.bloom) {
          this.passes.bloom.enabled = this.settings.bloom.enabled;
          this.passes.bloom.strength = this.settings.bloom.strength;
          this.passes.bloom.radius = this.settings.bloom.radius;
          this.passes.bloom.threshold = this.settings.bloom.threshold;
        }
        break;

      case 'vignette':
        if (this.passes.vignette) {
          this.passes.vignette.enabled = this.settings.vignette.enabled;
          this.passes.vignette.uniforms.offset.value = this.settings.vignette.offset;
          this.passes.vignette.uniforms.darkness.value = this.settings.vignette.darkness;
        }
        break;

      case 'motionBlur':
        if (this.passes.motionBlur) {
          this.passes.motionBlur.enabled = this.settings.motionBlur.enabled;
          this.passes.motionBlur.uniforms.blurAmount.value = this.settings.motionBlur.amount;
        }
        break;

      case 'chromaticAberration':
        if (this.passes.chromatic) {
          this.passes.chromatic.enabled = this.settings.chromaticAberration.enabled;
          this.passes.chromatic.uniforms.amount.value = this.settings.chromaticAberration.amount;
        }
        break;
    }

    this.saveSettings();
  }

  // Enable/disable specific effect
  setEffectEnabled(effect, enabled) {
    if (this.settings[effect]) {
      this.settings[effect].enabled = enabled;
      if (this.passes[effect]) {
        this.passes[effect].enabled = enabled;
      }
      this.saveSettings();
    }
  }

  // Pulse bloom effect (for explosions, etc.)
  pulseBloom(intensity = 2.0, duration = 500) {
    if (!this.passes.bloom) return;

    const originalStrength = this.settings.bloom.strength;
    const targetStrength = Math.min(originalStrength * intensity, 3.0);

    // Animate bloom strength
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentStrength = targetStrength + (originalStrength - targetStrength) * eased;

      this.passes.bloom.strength = currentStrength;

      if (progress < 1.0) {
        requestAnimationFrame(animate);
      } else {
        this.passes.bloom.strength = originalStrength;
      }
    };
    animate();
  }

  // Flash chromatic aberration (for damage/hit effects)
  flashChromaticAberration(intensity = 3.0, duration = 300) {
    if (!this.passes.chromatic) return;

    const originalAmount = this.settings.chromaticAberration.amount;
    const targetAmount = originalAmount * intensity;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      // Ease out
      const eased = 1 - Math.pow(1 - progress, 2);
      const currentAmount = targetAmount + (originalAmount - targetAmount) * eased;

      this.passes.chromatic.uniforms.amount.value = currentAmount;

      if (progress < 1.0) {
        requestAnimationFrame(animate);
      } else {
        this.passes.chromatic.uniforms.amount.value = originalAmount;
      }
    };
    animate();
  }

  // Increase vignette (for low health)
  setVignetteDarkness(darkness) {
    if (this.passes.vignette) {
      this.passes.vignette.uniforms.darkness.value = darkness;
    }
  }

  // Get all settings
  getAllSettings() {
    return { ...this.settings };
  }

  // Handle window resize
  onResize(width, height) {
    if (this.composer) {
      this.composer.setSize(width, height);
    }

    if (this.previousFrameTexture) {
      this.previousFrameTexture.setSize(width, height);
    }

    // Update bloom pass resolution
    if (this.passes.bloom) {
      this.passes.bloom.resolution.set(width, height);
    }
  }

  // Save settings to localStorage
  saveSettings() {
    try {
      localStorage.setItem('postProcessingSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('[PostProcessingSystem] Failed to save settings:', error);
    }
  }

  // Load settings from localStorage
  loadSettings() {
    try {
      const saved = localStorage.getItem('postProcessingSettings');
      if (saved) {
        const loadedSettings = JSON.parse(saved);

        // Update each category
        Object.keys(loadedSettings).forEach(category => {
          if (this.settings[category]) {
            this.updateSettings(category, loadedSettings[category]);
          }
        });

        console.log('[PostProcessingSystem] Settings loaded from storage');
      }
    } catch (error) {
      console.error('[PostProcessingSystem] Failed to load settings:', error);
    }
  }

  // Reset to default settings
  resetToDefaults() {
    this.settings = {
      bloom: {
        enabled: true,
        strength: 0.5,
        radius: 0.4,
        threshold: 0.85
      },
      vignette: {
        enabled: true,
        offset: 1.0,
        darkness: 1.5
      },
      motionBlur: {
        enabled: false,
        amount: 0.3
      },
      chromaticAberration: {
        enabled: false,
        amount: 0.003
      }
    };

    // Apply all settings
    Object.keys(this.settings).forEach(category => {
      this.updateSettings(category, this.settings[category]);
    });

    this.saveSettings();
  }

  // Cleanup
  dispose() {
    if (this.composer) {
      this.composer.passes.forEach(pass => {
        if (pass.dispose) pass.dispose();
      });
    }

    if (this.previousFrameTexture) {
      this.previousFrameTexture.dispose();
    }

    postProcessingSystemInstance = null;
  }
}

export default PostProcessingSystem;
