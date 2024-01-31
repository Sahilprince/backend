import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    }
})
export class EventsGateway {
    @WebSocketServer() io: Namespace;
    
    @SubscribeMessage('join')
    subscribe(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        client.join(data)
    }

    sendMessageToClient(payload){
        this.io.timeout(10000).to('wallet_alert').emit('message', payload);
        this.io.on('error', function (err) {
            console.log(err);
        });
    }
}