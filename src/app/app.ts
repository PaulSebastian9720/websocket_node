import express from "express";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { AppDataSource } from "./config/data.source";

import { MessageService } from "./service/message.service";
import { UserService } from "./service/user.service";
import { ChatService } from "./service/chat.service";
import { GroupService } from "./service/group.service";

import { ClientInfo } from "./interface/client";
import { GroupMessageService } from "./service/groupMessages.service";

export class ServerBootstrap {
  public app: express.Application = express();
  private port: number = 3000;
  private server = http.createServer(this.app);

  private messageService = new MessageService();
  private groupMessageService = new GroupMessageService();
  private userService = new UserService();
  private chatService = new ChatService();
  private groupService = new GroupService();

  private wss = new WebSocketServer({ server: this.server });
  private clients = new Map<WebSocket, ClientInfo>();

  public async start() {
    await this.dbConnect();
    this.setupWebSocket();
    this.server.listen(this.port, () => {
      console.log(`Servidor en http://localhost:${this.port}`);
    });
  }

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

          switch (type) {
            case "init":
              await this.handlePrivateInit(ws, parsed);
              break;

            case "message":
              await this.handlePrivateMessage(ws, parsed);
              break;

            case "group-init":
              await this.handleGroupInit(ws, parsed);
              break;

            case "group-message":
              await this.handleGroupMessage(ws, parsed);
              break;

            default:
              console.warn("Tipo de mensaje desconocido:", type);
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

  private async handlePrivateInit(ws: WebSocket, parsed: any) {
    const { senderName, receiverName } = parsed;
    const sender = await this.userService.findOrCreate(senderName);
    const receiver = await this.userService.findOrCreate(receiverName);
    const chat = await this.chatService.getOrCreateChat(sender, receiver);

    this.clients.set(ws, {
      ws,
      userName: sender.userName,
      chatId: chat.id,
    });

    const history = (await this.messageService.getMessagesByChat(chat.id)).map(
      (m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt,
        senderName: m.sender.userName,
      })
    );

    ws.send(
      JSON.stringify({
        type: "history",
        messages: history,
        chatId: chat.id,
      })
    );
  }

  private async handlePrivateMessage(ws: WebSocket, parsed: any) {
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

    this.broadcastToChat(chat.id, messageToSend);
  }

  private async handleGroupInit(ws: WebSocket, parsed: any) {
    const { senderName, groupId, groupName } = parsed;
    const sender = await this.userService.findOrCreate(senderName);
    const group = await this.groupService.findOrCreate(groupId, groupName);

    this.clients.set(ws, {
      ws,
      userName: sender.userName,
      groupId: group.id,
    });

    const history = (
      await this.groupMessageService.getMessagesByGroup(group.id)
    ).map((m ) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      senderName: m.sender.userName,
    }));

    ws.send(
      JSON.stringify({
        type: "group-history",
        messages: history,
        groupId: group.id,
      })
    );
  }

  private async handleGroupMessage(ws: WebSocket, parsed: any) {
    const { groupId, groupName, content, senderName } = parsed;

    const sender = await this.userService.findOrCreate(senderName);
    const group = await this.groupService.findOrCreate(groupId, groupName);

    const savedMessage = await this.groupMessageService.createMessage(
      content,
      group,
      sender
    );

    const messageToSend = {
      type: "group-message",
      message: {
        id: savedMessage.id,
        content: savedMessage.content,
        createdAt: savedMessage.createdAt,
        senderName: sender.userName,
        groupId: group.id,
      },
    };

    this.broadcastToGroup(group.id, messageToSend);
  }

  private broadcastToChat(chatId: number, message: any) {
    this.clients.forEach((client) => {
      if (client.chatId === chatId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  private broadcastToGroup(groupId: number, message: any) {
    this.clients.forEach((client) => {
      if (
        client.groupId === groupId &&
        client.ws.readyState === WebSocket.OPEN
      ) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }
}
