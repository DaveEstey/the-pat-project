// Create a safe event emitter class to prevent null reference crashes
export class SafeEventEmitter {
  constructor() {
    this.listeners = new Map();
  }
  
  on(event, callback) {
    if (typeof event !== 'string' || typeof callback !== 'function') {
      console.warn('Invalid event listener parameters:', event, callback);
      return;
    }
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event).push(callback);
  }
  
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }
  
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
  
  // Remove all listeners for cleanup
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
  
  // Get count of listeners for debugging
  getListenerCount(event) {
    if (event) {
      return this.listeners.get(event)?.length || 0;
    }
    return Array.from(this.listeners.values()).reduce((total, callbacks) => total + callbacks.length, 0);
  }
}

export default SafeEventEmitter;