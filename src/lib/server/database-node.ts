import { neonConfig } from "@neondatabase/serverless";
import WebSocket from "ws";

// Node uses native TLS over IPv4; Workers use platform WebSockets.
class DatabaseWebSocket extends WebSocket {
  constructor(address: string, protocols?: string | string[]) {
    super(address, protocols, { family: 4, handshakeTimeout: 10000 });
  }
}
neonConfig.webSocketConstructor = DatabaseWebSocket;
