import { supabase } from "@/integrations/supabase/client";

export type WSMessage =
  | { type: "authenticate"; token: string }
  | { type: "subscribe_achievements" }
  | { type: "list_teachers" }
  | { type: "ping" };

export type WSResponse =
  | { type: "connected"; message: string }
  | { type: "authenticated"; userId: string; role: string }
  | { type: "subscribed"; channel: string }
  | { type: "teachers_online"; teachers: Array<{ user_id: string; full_name: string; department?: string | null }> }
  | { type: "new_submission"; data: any }
  | { type: "achievement_updated"; data: any }
  | { type: "error"; message: string };

export class WSClient {
  private socket: WebSocket | null = null;
  private url: string;
  private onMessageCb?: (msg: WSResponse) => void;
  private onStatusCb?: (s: 'connecting' | 'open' | 'closed' | 'error' | 'reconnecting') => void;
  private backoff = 1000; // start 1s
  private maxBackoff = 30000; // 30s
  private shouldReconnect = true;
  private sendQueue: string[] = [];

  constructor(url: string) {
    // Normalize http/https to ws/wss
    if (url.startsWith('https://')) {
      this.url = url.replace('https://', 'wss://');
    } else if (url.startsWith('http://')) {
      this.url = url.replace('http://', 'ws://');
    } else {
      this.url = url;
    }
  }

  async connect(onMessage?: (msg: WSResponse) => void, onStatus?: WSClient['onStatusCb']) {
    this.onMessageCb = onMessage;
    this.onStatusCb = onStatus;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    this.onStatusCb?.('connecting');
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.onStatusCb?.('open');
      this.backoff = 1000;
      if (token) {
        this.send({ type: "authenticate", token });
      }
      // Flush queue
      while (this.sendQueue.length) {
        const msg = this.sendQueue.shift()!;
        this.socket?.send(msg);
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const data: WSResponse = JSON.parse(event.data);
        this.onMessageCb?.(data);
      } catch (e) {
        console.warn("WS parse error", e);
      }
    };

    this.socket.onclose = () => {
      this.onStatusCb?.('closed');
      if (this.shouldReconnect) {
        this.reconnect(onMessage, onStatus);
      }
    };

    this.socket.onerror = () => {
      this.onStatusCb?.('error');
    };
  }

  send(msg: WSMessage) {
    const payload = JSON.stringify(msg);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
    } else {
      this.sendQueue.push(payload);
    }
  }

  close() {
    this.socket?.close();
    this.shouldReconnect = false;
  }

  private async reconnect(onMessage?: (msg: WSResponse) => void, onStatus?: WSClient['onStatusCb']) {
    this.onStatusCb?.('reconnecting');
    await new Promise((r) => setTimeout(r, this.backoff));
    this.backoff = Math.min(this.backoff * 2, this.maxBackoff);
    this.connect(onMessage, onStatus);
  }
}
