import { Player } from '../prefabs/Player';
import { Socket } from 'socket.io-client';
import { Game as Lobby } from '../scenes/Lobby';
import { Game as Hamemayu } from '../scenes/Hamemayu';

interface PlayerData{
    map: string;
    id: string;
    username: string;
    x: number;
    y: number;
    posX: number;
    posY: number;
    chat: string;
}

export class Network {

    socket: Socket;
    player: Player;
    scene: Lobby | Hamemayu;
    map: string;

    constructor(scene: Lobby | Hamemayu, x: number, y: number){
        this.scene = scene;
        this.socket = scene.socket;
        this.map = scene.map;

        // setInterval(() => {
        //     let time = Date.now()
        //     this.socket.emit('ping', (data: string) => {
        //         console.log(Date.now()-time, data)
        //     })
        // }, 50)

        const coor: Function = (x: number, xx: number = 0) => x*16+xx;

        this.socket.on('join', (data: PlayerData[]) => {
            data.forEach((player: PlayerData) => {
                if(player.id == this.socket.id){
                    this.scene.addPlayer(player, true)
                }
                else{
                    this.scene.addPlayer(player, false)
                }
            })
        })

        this.socket.on('newplayer', (data: PlayerData) => {
            this.scene.addPlayer(data, false)
        })

        this.socket.on('leftplayer', (id: string) => {
            this.scene.deletePlayer(id)
        })

        this.socket.on('update-player', data => {
            this.scene.updatePlayer(data || [])
        })

        if(this.socket.id){
            const data = {
                map: this.map,
                id: this.socket.id,
                username: 'test',
                x: x,
                y: y,
                chat: ''
            }
            this.socket.emit('join', data)
        }
    }

    updatePlayer(map: string, x: number, y: number, dir: Phaser.Math.Vector2){
        this.socket.emit('update', {
            map: map,
            x: x,
            y: y,
            dir: dir
        })
    }

    changeMap(map: string){
        this.socket.removeAllListeners()
        this.socket.emit('change-map', map)
    }
}