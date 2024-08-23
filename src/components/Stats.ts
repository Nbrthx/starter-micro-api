import { Socket } from "socket.io-client";

interface Account{
    username: string;
    hash: string;
    head: string[];
    outfit: string[];
    xp: number;
    inventory: number[];
}

export class Stats{

    socket: Socket;
    xp: number;
    level: number;

    constructor(socket: Socket){
        this.socket = socket
        this.xp = 0
        socket.emit('get-account', (data: Account) => {
            this.xp = data.xp
        })
    }

    addXp(amount: number){
        this.xp += amount
        this.socket.emit('xp-update', amount)
    }

    getLevel(){
        let level = 1
        while(((level/0.3)**2)/11 < this.xp){
            level++
        }
        return level
    }
}