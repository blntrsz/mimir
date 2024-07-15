export interface Event {
  name: string;
  body: Record<string, unknown>;
}

export interface EventEmitter {
  publish(event: Event): Promise<void>;
}
