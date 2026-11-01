/**
 * Resilient WebSocket manager for the DreamCompanion match simulator.
 */

export function getDefaultWebSocketUrl() {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  // Determine dynamically based on current origin if same host or default to local 8000
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'ws://localhost:8000/ws/simulator';
    }
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/ws/simulator`;
  }
  return 'ws://localhost:8000/ws/simulator';
}

export class SimulatorSocketManager {
  constructor(url = getDefaultWebSocketUrl()) {
    this.url = url;
    this.ws = null;
    this.messageHandlers = new Set();
    this.statusHandlers = new Set();
    this.status = 'disconnected'; // 'disconnected' | 'connecting' | 'connected' | 'error'
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectTimeout = null;
    this.isManualClose = false;
  }

  connect() {
    this.isManualClose = false;
    this._updateStatus('connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this._updateStatus('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.messageHandlers.forEach((handler) => handler(payload));
        } catch (err) {
          console.error('[SimulatorWS] Error parsing payload:', err);
        }
      };

      this.ws.onclose = () => {
        this._updateStatus('disconnected');
        if (!this.isManualClose) {
          this._scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[SimulatorWS] Socket error:', err);
        this._updateStatus('error');
      };
    } catch (err) {
      console.warn('[SimulatorWS] Connection exception:', err);
      this._updateStatus('error');
      this._scheduleReconnect();
    }
  }

  _scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[SimulatorWS] Max reconnect attempts reached.');
      return;
    }
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;
    clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  _updateStatus(newStatus) {
    this.status = newStatus;
    this.statusHandlers.forEach((handler) => handler(newStatus));
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  start() {
    return this.send({ action: 'start' });
  }

  pause() {
    return this.send({ action: 'pause' });
  }

  reset() {
    return this.send({ action: 'reset' });
  }

  step() {
    return this.send({ action: 'step' });
  }

  setInterval(seconds) {
    return this.send({ action: 'set_interval', interval: seconds });
  }

  onMessage(callback) {
    this.messageHandlers.add(callback);
    return () => this.messageHandlers.delete(callback);
  }

  onStatusChange(callback) {
    this.statusHandlers.add(callback);
    callback(this.status);
    return () => this.statusHandlers.delete(callback);
  }

  disconnect() {
    this.isManualClose = true;
    clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._updateStatus('disconnected');
  }
}

