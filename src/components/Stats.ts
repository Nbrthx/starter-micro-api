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

            const xp = document.getElementById('xp')
            const xpNow = this.xp-Math.floor(((this.getLevel()-1)/0.3)**2/11)
            const xpNext = Math.floor((this.getLevel()/0.3)**2/11)-Math.floor(((this.getLevel()-1)/0.3)**2/11)
            if(xp) xp.innerHTML = xpNow+'/'+xpNext+' XP'
        })
    }

    addXp(amount: number){
        this.xp += amount
        this.socket.emit('xp-update', amount)

        const xp = document.getElementById('xp')
        const xpNow = this.xp-Math.floor(((this.getLevel()-1)/0.3)**2/11)
        const xpNext = Math.floor((this.getLevel()/0.3)**2/11)-Math.floor(((this.getLevel()-1)/0.3)**2/11)
        if(xp) xp.innerHTML = xpNow+'/'+xpNext+' XP'
    }

    getLevel(){
        let level = 1
        while(Math.floor((level/0.3)**2)/11 < this.xp){
            level++
        }
        return level
    }
}