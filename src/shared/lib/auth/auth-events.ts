export type AuthEventType = "token-refresh-success" | "token-refresh-failed";

export interface AuthEventPayload {
  "token-refresh-success": { accessToken: string; expiresIn: number };
  "token-refresh-failed": { reason?: string };
}

type Listener<T extends AuthEventType> = (payload: AuthEventPayload[T]) => void;

class AuthEventEmitter {
  private listeners: Map<AuthEventType, Listener<any>[]> = new Map();

  emit<T extends AuthEventType>(event: T, payload: AuthEventPayload[T]): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(payload));
    }
  }

  on<T extends AuthEventType>(event: T, listener: Listener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener as Listener<any>);
  }

  off<T extends AuthEventType>(event: T, listener: Listener<T>): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      this.listeners.set(
        event,
        listeners.filter((l) => l !== listener),
      );
    }
  }
}

export const authEvents = new AuthEventEmitter();
