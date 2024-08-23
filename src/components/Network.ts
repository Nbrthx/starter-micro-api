import { Player , PlayerData} from '../prefabs/Player';
import { Socket } from 'socket.io-client';
import { Game as Lobby } from '../scenes/Lobby';
import { Game as Hamemayu } from '../scenes/Hamemayu';
import { Game as Rumah } from '../scenes/Rumah';

export class Network {

    socket: Socket;
    player: Player;
    scene: Lobby | Hamemayu | Rumah;
    map: string;

    constructor(scene: Lobby | Hamemayu | Rumah, x: number, y: number){
        this.scene = scene;
        this.socket = scene.socket;
        this.map = scene.map;

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
            const existingPlayer = this.scene.players.getChildren().find((p: any) => p.id === id) as Player;
            if (existingPlayer) {
                existingPlayer.destroy()
            }
        })

        this.socket.on('update-player', data => {
            data.forEach((player: PlayerData) => {
                if (player.map === this.map) {
                    const existingPlayer = this.scene.players.getChildren().find((p: any) => p.id === player.id) as Player;
                    if (existingPlayer && existingPlayer.id != this.socket.id) {
                        var distance = Phaser.Math.Distance.Between(existingPlayer.x, existingPlayer.y, player.x, player.y);
                        var duration = distance*10;
                        this.scene.add.tween({
                            targets: existingPlayer,
                            x: player.x,
                            y: player.y,
                            ease: 'linear',
                            duration: duration,
                        })
                        existingPlayer.dir.x = parseInt(player.x - existingPlayer.x+'')
                        existingPlayer.dir.y = parseInt(player.y - existingPlayer.y+'')
                        existingPlayer.dir.normalize()
                        existingPlayer.playerName.setText(player.username+' Lvl'+player.level)
                        existingPlayer.update()
                    }
                }
            })
        })

        this.socket.on('chat', (data: { id: number, text: string}) => {
            const existingPlayer = this.scene.players.getChildren().find((p: any) => p.id === data.id) as Player;
            if (existingPlayer) {
                existingPlayer.playerChat.writeText(data.text)
            }
        })

        this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                let time = Date.now()
                this.socket.emit('ping', () => {
                    const label = document.getElementById('ping')
                    if(label) label.innerHTML = (Date.now()-time)+'ms'
                })
            },
            callbackScope: this,
            loop: true
        })

        if(this.socket.id){
            const data = {
                map: this.map,
                id: this.socket.id,
                username: this.scene.registry.get('username'),
                x: x,
                y: y,
                level: this.scene.stats.getLevel()
            }
            this.socket.emit('join', data)
        }
    }

    updatePlayer(map: string, x: number, y: number, dir: Phaser.Math.Vector2){
        this.socket.emit('update', {
            map: map,
            x: x,
            y: y,
            dir: dir,
            level: this.scene.stats.getLevel()
        })
    }

    changeMap(map: string, callback: Function = () => {}){
        this.socket.removeAllListeners()
        this.socket.emit('change-map', map, callback)
    }
}