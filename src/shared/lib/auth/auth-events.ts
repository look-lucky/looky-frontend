import { EventEmitter } from "events";

export type AuthEventType = "token-refresh-success" | "token-refresh-failed";

export interface AuthEventPayload {
  "token-refresh-success": { accessToken: string; expiresIn: number };
  "token-refresh-failed": { reason?: string };
}

class AuthEventEmitter extends EventEmitter {
  emit<T extends AuthEventType>(event: T, payload: AuthEventPayload[T]): boolean {
    return super.emit(event, payload);
  }

  on<T extends AuthEventType>(
    event: T,
    listener: (payload: AuthEventPayload[T]) => void,
  ): this {
    return super.on(event, listener);
  }

  off<T extends AuthEventType>(
    event: T,
    listener: (payload: AuthEventPayload[T]) => void,
  ): this {
    return super.off(event, listener);
  }
}

export const authEvents = new AuthEventEmitter();
