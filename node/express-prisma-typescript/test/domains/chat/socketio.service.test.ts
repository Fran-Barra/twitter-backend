import { Server, Socket } from "socket.io";
import { createServer, Server as NodeServer} from "node:http";
import { io as ioc, Socket as SocketC } from "socket.io-client";
import { SocketService } from "../../../src/domains/chat/service/chat.socket.io.service"
import { prismaMock } from "../../singleton";
import { ChatServiceImpl } from "../../../src/domains/chat/service/chat.service.impl"
import { ChatRepositoryImpl } from "../../../src/domains/chat/repository/chat.repository.impl"
import { UsersFollowEachOtherAndChatParticipants } from "../../../src/domains/auth/service/usersFollowEachOtherAndChatParticipants.service.impl"
import { FollowServiceImpl } from "../../../src/domains/follower/service/follow.service.impl"
import { FollowRepositoryImpl } from "../../../src/domains/follower/repository/follow.repository.impl"
import httpStatus from "http-status";
import { chat } from "./data";

function getPortFromServer(server: NodeServer) : string {
    const address = server.address()
    if (!address) throw new Error("address is null")
    if (typeof(address) === "string") return address
    return address.port.toString()
}

interface SystemError {
    message: String
    code: number
    errors?: any
}

describe("chat testing from socket.io service", () => {
    let io: Server, clientSocket : SocketC;
    let port: string;

    beforeEach((done)=>{
        const chatRepository = new ChatRepositoryImpl(prismaMock)
        const socketService = new SocketService(new ChatServiceImpl(
            chatRepository, 
            new UsersFollowEachOtherAndChatParticipants(
                new FollowServiceImpl(new FollowRepositoryImpl(prismaMock)), 
                chatRepository)
        ))

        const httpServer = createServer();
        io = new Server(httpServer);

        httpServer.listen(() => {
            port = getPortFromServer(httpServer);
            clientSocket = ioc(`http://localhost:${port}`);

            io.on("connection", (socket: Socket) => {
                socket.data.context = {userId: "1"}
                socketService.onConnectionStarted(socket)
            })

            clientSocket.on("connect", done);
        });
    })

    afterEach(()=>{
        io.close();
        clientSocket.disconnect();
    })

    test("call message outside chat get system error", (done) => {

        clientSocket.on("system error", (error: SystemError, ...args) => {
            try {
                expect(error.code).toBe(httpStatus.FORBIDDEN);
                done();
            }catch(err){
                done(err)
            }
        })

        clientSocket.emit("message", "hy there");
    })

    test("join a chat when the chat does not exists", (done)=>{
        clientSocket.on("system error", (error: SystemError, ...args) => {
            try {
                expect(error.code).toBe(httpStatus.NOT_FOUND)
                done()
            } catch (err) {                
                done(err);
            }
        })

        clientSocket.emit("join chat", "1");
    })

    test("join chat that where the user is not participant of", (done) => {
        prismaMock.chat.findFirst.mockResolvedValue(chat)

        clientSocket.on("system error", (error: SystemError, ...args) => {
            try {
                expect(error.code).toBe(httpStatus.FORBIDDEN)
                done()
            } catch (err) {                
                done(err);
            }
        })

        clientSocket.emit("join chat", "1");
    })
})