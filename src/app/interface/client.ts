import { WebSocket } from "ws";

export interface ClientInfo {
  ws: WebSocket;
  userName: string;
  chatId: number;
}
