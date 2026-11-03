import { API_CONFIG } from './api/apiConfig';

export type RealTimeEventType = 
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'APPLICATION_UPDATED'
  | 'EMAIL_ALERT_DETECTED'
  | 'CALENDAR_SYNCED'
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT';

export interface RealTimeEventPayload {
  type: RealTimeEventType;
  entityId: string;
  data: any;
  timestamp: string;
  deviceId?: string;
}

export type RealTimeListener = (event: RealTimeEventPayload) => void;

/**
 * Real-time synchronization service designed for Spring Boot SSE or STOMP/WebSocket.
 * In development without an active backend, it tracks connection status honestly
 * and provides test broadcast methods to verify cross-component responsiveness.
 */
class RealTimeService {
  private listeners: Set<RealTimeListener> = new Set();
  private eventSource: EventSource | null = null;
  private isConnected: boolean = false;
  private reconnectTimeout: any = null;

  constructor() {
    // Initialized in disconnected state until real backend SSE endpoint is available
    this.isConnected = false;
  }

  public getConnectionStatus(): { connected: boolean; transport: 'SSE' | 'WebSocket' | 'Mock' } {
    return {
      connected: this.isConnected,
      transport: this.isConnected ? 'SSE' : 'Mock',
    };
  }

  public connect(endpoint = API_CONFIG.endpoints.sseStream) {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    try {
      this.eventSource = new EventSource(endpoint);
      this.eventSource.onopen = () => {
        this.isConnected = true;
        console.info('[DayPilot RealTime] Connected to Spring Boot SSE stream');
      };
      this.eventSource.onmessage = (event) => {
        try {
          const payload: RealTimeEventPayload = JSON.parse(event.data);
          this.notifyListeners(payload);
        } catch (err) {
          console.error('[DayPilot RealTime] Failed to parse SSE event', err);
        }
      };
      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.eventSource?.close();
      };
    } catch {
      this.isConnected = false;
    }
  }

  public disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.isConnected = false;
  }

  public subscribe(listener: RealTimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Internal dispatcher for client-side multi-tab or simulated real-time events
   */
  public broadcastSimulatedEvent(type: RealTimeEventType, entityId: string, data: any) {
    const payload: RealTimeEventPayload = {
      type,
      entityId,
      data,
      timestamp: new Date().toISOString(),
      deviceId: 'client-active-session',
    };
    this.notifyListeners(payload);
  }

  private notifyListeners(payload: RealTimeEventPayload) {
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('[DayPilot RealTime] Listener error', err);
      }
    });
  }
}

export const realtimeService = new RealTimeService();
