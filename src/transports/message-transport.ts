export interface MessageTransport {
  close: () => void;
  read: () => AsyncIterable<string>;
  send: (message: string) => Promise<void>;
}
