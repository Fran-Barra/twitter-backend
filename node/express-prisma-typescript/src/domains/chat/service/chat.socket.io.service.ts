import { DisconnectReason, Socket } from "socket.io";
import { chatService } from "../resources";
import { ErrorHandlingSocket, ForbiddenException, ValidationException } from "@utils";
import { CursorPagination } from "@types";

export function onConnectionStarted(socket: Socket) : void {
    try {
        socket.on("message", (message: string, ...args) => onMessage(socket, message))

        socket.on("join chat", (chatId: string, ...args) => onJoinChat(socket, chatId))
        socket.on("left chat", (...args)=>onLeftChat(socket))
        //TODO: generic system event
        socket.on("system get messages", (pagination: CursorPagination, ...args) => getChatMessages(socket, pagination))

        socket.on('disconnect', onDisconnect)

        if (!socket.recovered) recover(socket)
    } catch (err) {
        ErrorHandlingSocket(err, socket)
    }
}

function onDisconnect(reason: DisconnectReason, description?: any) : void {
    console.log(`disconnection reason: ${reason}`);
}

async function onMessage(socket: Socket, message: string) : Promise<void> {
    try {
        const chatId = Array.from(socket.rooms).find(roomId => roomId !== socket.id);
        if (!chatId) throw new ValidationException([new String("not in chat")]);
        const userId = socket.data.context.userId


        const messageDTO = await chatService.sendMessage(userId, chatId, message)
        socket.to(chatId).emit("message", messageDTO)
    } catch (err) {
        ErrorHandlingSocket(err, socket)
    }
}

async function onJoinChat(socket: Socket, chatId: string) : Promise<void> {
    try {
        const isParticipantOrOwner = await chatService.isParticipantOrOwner(socket.data.context.userId, chatId)
        if (!isParticipantOrOwner) throw new ForbiddenException()
        onLeftChat(socket)
        
        socket.join(chatId)
    } catch (err) {
        ErrorHandlingSocket(err, socket)
    }
}

async function getChatMessages(socket: Socket, pagination: CursorPagination) : Promise<void> {
    try {
        console.log("in rooms:" + socket.rooms.size);
        
        const chatId = Array.from(socket.rooms).find(roomId => roomId !== socket.id);
        if (!chatId) throw new ValidationException([new String("not in chat")]);

        const messages = await chatService.getChatMessages(socket.data.context.userId, chatId, pagination)
        socket.emit("system get messages", messages)
    } catch (err) {
        ErrorHandlingSocket(err, socket)
    }
}

function onLeftChat(socket: Socket) : void {
    try {
        const chatId = Array.from(socket.rooms).find(roomId => roomId !== socket.id);
        if (!chatId) return

        console.log(`user ${socket.data.context.userId} disconnected from chat ${chatId}}`)
        socket.leave(chatId)
    } catch (err) {
        ErrorHandlingSocket(err, socket)
    }
}

function recover(socket: Socket) : void {
    try {
        if (socket.rooms.size == 1) return
        const limit = socket.handshake.auth.limit || 0
        console.log("called recover with limit: " + limit);
        getChatMessages(socket, {limit: limit}) 
    } catch (err) {
        ErrorHandlingSocket(err, socket)
    }
}
