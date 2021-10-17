import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from "socket.io-client/build/typed-events";

class SocketService {
    public socket: Socket | null = null;    

    public connect(url: string): Promise<Socket<DefaultEventsMap, DefaultEventsMap>> {
        return new Promise((rs, rj) => {
            this.socket = io(url, {
                withCredentials: true
            });

            if(!this.socket) return rj();

            this.socket.on('connect', () => {
                rs(this.socket as Socket);
            });

            this.socket.on('connect_error', (err) => {
                console.log('Connection error: ', err);
                rj(err);
            })
        });
    }
};

export default new SocketService();