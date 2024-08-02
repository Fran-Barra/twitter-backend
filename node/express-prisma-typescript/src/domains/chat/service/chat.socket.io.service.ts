import { DisconnectReason, Socket } from "socket.io";
import { ErrorHandlingSocket, ForbiddenException, ValidationException } from "@utils";
import { CursorPagination } from "@types";
import { ChatService } from "./chat.service";


export class SocketService {
    constructor(private readonly chatService: ChatService){}

    onConnectionStarted(socket: Socket) : void {
        try {            
            socket.on("message", (message: string, ...args) => this.onMessage(socket, message))
    
            socket.on("join chat", (chatId: string, ...args) => this.onJoinChat(socket, chatId))
            socket.on("left chat", (...args)=>this.onLeftChat(socket))
            //TODO: generic system event
            socket.on("system get messages", (pagination: CursorPagination, ...args) => this.getChatMessages(socket, pagination))
    
            socket.on('disconnect', this.onDisconnect)
    
            if (!socket.recovered) this.recover(socket)
        } catch (err) {
            ErrorHandlingSocket(err, socket)
        }
    }
    
    private onDisconnect(reason: DisconnectReason, description?: any) : void {
        console.log(`disconnection reason: ${reason}`);
    }
    
    private async onMessage(socket: Socket, message: string) : Promise<void> {
        try {
            const chatId = Array.from(socket.rooms).find(roomId => roomId !== socket.id);
            if (!chatId) throw new ForbiddenException();
            const userId = socket.data.context.userId
    
    
            const messageDTO = await this.chatService.sendMessage(userId, chatId, message)
            socket.to(chatId).emit("message", messageDTO)
        } catch (err) {
            ErrorHandlingSocket(err, socket)
        }
    }
    
    private async onJoinChat(socket: Socket, chatId: string) : Promise<void> {
        try {
            const isParticipantOrOwner = await this.chatService.isParticipantOrOwner(socket.data.context.userId, chatId)
            if (!isParticipantOrOwner) throw new ForbiddenException()
            this.onLeftChat(socket)
            
            socket.join(chatId)
        } catch (err) {
            ErrorHandlingSocket(err, socket)
        }
    }
    
    private async getChatMessages(socket: Socket, pagination: CursorPagination) : Promise<void> {
        try {
            console.log("in rooms:" + socket.rooms.size);
            
            const chatId = Array.from(socket.rooms).find(roomId => roomId !== socket.id);
            if (!chatId) throw new ValidationException([new String("not in chat")]);
    
            const messages = await this.chatService.getChatMessages(socket.data.context.userId, chatId, pagination)
            socket.emit("system get messages", messages)
        } catch (err) {
            ErrorHandlingSocket(err, socket)
        }
    }
    
    private onLeftChat(socket: Socket) : void {
        try {
            const chatId = Array.from(socket.rooms).find(roomId => roomId !== socket.id);
            if (!chatId) return
    
            console.log(`user ${socket.data.context.userId} disconnected from chat ${chatId}}`)
            socket.leave(chatId)
        } catch (err) {
            ErrorHandlingSocket(err, socket)
        }
    }
    
    private recover(socket: Socket) : void {
        try {
            if (socket.rooms.size == 1) return
            const limit = socket.handshake.auth.limit || 0
            console.log("called recover with limit: " + limit);
            this.getChatMessages(socket, {limit: limit}) 
        } catch (err) {
            ErrorHandlingSocket(err, socket)
        }
    }
}

