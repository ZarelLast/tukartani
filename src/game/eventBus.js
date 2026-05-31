/**
 * eventBus.js — Jembatan komunikasi React ↔ Phaser
 * Dari docs/07-frontend-react.md (Orion Protocol)
 */

const listeners = {};

export const eventBus = {
  on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
  },

  off(event, callback) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  },

  emit(event, data) {
    if (!listeners[event]) return;
    listeners[event].forEach(cb => cb(data));
  },

  removeAll() {
    Object.keys(listeners).forEach(key => delete listeners[key]);
  },
};

// Event constants
export const EVENTS = {
  ANIMATION_COMPLETE: 'ANIMATION_COMPLETE',
  PARTICLE_LAND: 'PARTICLE_LAND',
  STATE_UPDATE: 'STATE_UPDATE',
  KOORDINAT_TARGET: 'KOORDINAT_TARGET',
};
