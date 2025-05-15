import express from "express";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { AppDataSource } from "./config/data.source";
import { MessageService } from "./service/message.service";
import { UserService } from "./service/user.service";
import { ChatService } from "./service/chat.service";
import { ClientInfo } from "./interface/client";

export class ServerBootstrap {
  public app: express.Application = express();
  private port: number = 3000;
  private server = http.createServer(this.app);
  private messageService = new MessageService();
  private userService = new UserService();
  private chatService = new ChatService();
  private wss = new WebSocketServer({ server: this.server });

  private clients = new Map<WebSocket, ClientInfo>();

  private async dbConnect() {
    try {
      await AppDataSource.initialize();
      console.log("Base de datos conectada");
    } catch (error) {
      console.error("Error al conectar BD:", error);
    }
  }

  private setupWebSocket() {
    this.wss.on("connection", (ws) => {
      console.log("Cliente conectado");

      ws.on("message", async (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          const { type } = parsed;

          if (type === "init") {
            const { senderName, receiverName } = parsed;

            const sender = await this.userService.findOrCreate(senderName);
            const receiver = await this.userService.findOrCreate(receiverName);
            const chat = await this.chatService.getOrCreateChat(
              sender,
              receiver
            );

            this.clients.set(ws, {
              ws,
              userName: sender.userName,
              chatId: chat.id,
            });

            const history = (
              await this.messageService.getMessagesByChat(chat.id)
            ).map((m) => ({
              id: m.id,
              content: m.content,
              createdAt: m.createdAt,
              senderName: m.sender.userName,
            }));

            ws.send(
              JSON.stringify({
                type: "history",
                messages: history,
                chatId: chat.id,
              })
            );
          } else if (type === "message") {
            const { chatId, content, senderName } = parsed;

            const sender = await this.userService.findOrCreate(senderName);
            const chat = await this.chatService.findOne(chatId);

            if (!chat) throw new Error("Chat no encontrado");

            const savedMessage = await this.messageService.createMessage(
              content,
              chat,
              sender
            );

            const messageToSend = {
              type: "message",
              message: {
                id: savedMessage.id,
                content: savedMessage.content,
                createdAt: savedMessage.createdAt,
                senderName: sender.userName,
                chatId: chat.id,
              },
            };

            this.clients.forEach((client) => {
              if (
                client.chatId === chat.id &&
                client.ws.readyState === ws.OPEN
              ) {
                client.ws.send(JSON.stringify(messageToSend));
              }
            });
          }
        } catch (error) {
          console.error("Error procesando mensaje:", error);
        }
      });

      ws.on("close", () => {
        console.log("Cliente desconectado");
        this.clients.delete(ws);
      });
    });
  }

  public async start() {
    await this.dbConnect();
    this.setupWebSocket();
    this.server.listen(this.port, () => {
      console.log(`Servidor en http://localhost:${this.port}`);
    });
  }
}
