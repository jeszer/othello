import { ConnectedSocket, MessageBody, OnDisconnect, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";

@SocketController()
export class RoomController {
    private getSocketGameRoom(socket: Socket): string {
        const socketRooms = Array.from(socket.rooms.values()).filter((r) => r !== socket.id);
        const gameRoom = socketRooms && socketRooms[0];
        return gameRoom;
    }

    @OnMessage('join_game')
    public async joinGame(
        @SocketIO() io: Server,
        @ConnectedSocket() socket: Socket,
        @MessageBody() message: any
    ) {
        console.log('\n\n======================================================\n',
                    socket.id, " is joining room ",
                    '"', message.roomId, '"');

        const connectedSockets = io.sockets.adapter.rooms.get(message.roomId);
        const socketRooms = Array.from(socket.rooms.values()).filter((r) => r !== socket.id);
    
        if(socketRooms.length > 0 || connectedSockets && connectedSockets.size === 2) {
            socket.emit('room_join_error', {
                error: "Room is already full :("
            });
        } else {
            await socket.join(message.roomId);
            socket.emit("room_joined");

            console.log('------------------------------------------------------\nRoom member = ', 
                        Array.from(connectedSockets),
                        '\n------------------------------------------------------\n\n');

            if(connectedSockets.size === 2) {
                const gameRoom = this.getSocketGameRoom(socket);
                socket.emit('ready_to_start');
                socket.to(gameRoom).emit('ready_to_start');
            }
        }
    }

    @OnMessage('start_game')
    public startGame(
        @SocketIO() io: Server,
        @ConnectedSocket() socket: Socket
    ) {
        const gameRoom = this.getSocketGameRoom(socket);
        
        if(io.sockets.adapter.rooms.get(gameRoom).size === 2) { 

            let rand = Math.floor(Math.random() * 2);

            if(rand === 0) { 
                //to the sender
                socket.emit('on_game_start', { start: true, color: 1 }); 
                //to all clients in gameRoom EXCEPT the sender
                socket.to(gameRoom).emit('on_game_start', { start: false, color: 2}); 
            } else {
                socket.emit('on_game_start', { start: false, color: 2 });
                socket.to(gameRoom).emit('on_game_start', { start: true, color: 1});
            }
        }
    }
}