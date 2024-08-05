import { Scene } from 'phaser';
import { Player } from '../prefabs/Player';
import { Socket } from 'socket.io-client';
import { Joystick } from '../components/Joystick';
import { Network } from '../components/Network';

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

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text: Phaser.GameObjects.Text;
    layer1: Phaser.Tilemaps.TilemapLayer;
    layer2: Phaser.Tilemaps.TilemapLayer;
    layer3: Phaser.Tilemaps.ObjectLayer;
    player: Player;
    socket: Socket;
    players: Phaser.GameObjects.Group;
    map: string;
    player2: Player;
    joystick: Joystick;
    weaponHitbox: Phaser.GameObjects.Group;
    collider: any;
    network: Network;
    enterance: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

    constructor () {
        super('Hamemayu');
        this.map = 'hamemayu'
    }

    create () {
        this.camera = this.cameras.main;
        this.socket = this.registry.get('socket')

        const coor: Function = (x: number, xx: number = 0) => x*16+xx;

        // MAP
        const map: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: 'hamemayu' });
        const tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage('tileset', 'tileset') as Phaser.Tilemaps.Tileset;
        this.layer1 = map.createLayer('background', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
        this.layer2 = map.createLayer('wall', tileset, 0, 0)?.setCollisionByExclusion([-1]) as Phaser.Tilemaps.TilemapLayer;
        //this.layer3 = map.getObjectLayer('wall2') as Phaser.Tilemaps.ObjectLayer;

        this.collider = []
        this.collider.push(this.layer2)

        // Others
        this.players = this.add.group()

        // Hitbox
        this.weaponHitbox = this.add.group()

        // Enterance
        this.enterance = this.physics.add.image(coor(37), coor(17), '')
        this.enterance.setVisible(false)
        this.enterance.setSize(4, 64)

        // Quest


        // Controller
        const joystick = document.getElementById('joystick');
        const stick = document.getElementById('stick');
        const attack = document.getElementById('attack');

        if(joystick && stick) this.joystick = new Joystick(joystick, stick);
        attack?.addEventListener('click', () => {
            this.socket.emit('attack', {
                map: 'lobby',
                x: this.player.x,
                y: this.player.y,
                dir: this.player.dir
            })
            if(this.player) this.player.attack()
        })

        // Connection
        this.network = new Network(this)

        const updatePlayer = () => {
            if(this.player){
                this.player.dir.normalize()
                this.network.updatePlayer(this.map, this.player.x, this.player.y, this.player.dir)
            }
            setTimeout(() => updatePlayer(), 50)
        }
        updatePlayer()
        
        console.log('Hello')
    }

    update(){
        if(!this.player) return

        const cursors: any = this.input.keyboard?.addKeys('W,A,S,D') as Phaser.Input.Keyboard.KeyboardManager;
        
        if (cursors.A.isDown) {
            this.player.dir.x = -1
        } else if (cursors.D.isDown) {
            this.player.dir.x = 1
        } else {
            this.player.dir.x = this.joystick.x
        }

        if (cursors.W.isDown) {
            this.player.dir.y = -1
        } else if (cursors.S.isDown) {
            this.player.dir.y = 1
        } else {
            this.player.dir.y = this.joystick.y
        }
        
        this.player.update()
    }

    addPlayer(player: PlayerData, main: boolean = false){
        console.log(player)
        if(main && !this.player){
            // Player
            this.player = new Player(this, player.x, player.y, 'char', true)
                    
            this.player.head.setTexture('green-head')
            this.player.id = player.id
            this.player.setCollideWorldBounds(true)
            this.weaponHitbox.add(this.player.weaponHitbox)
            console.log(player)

            // Camera
            this.camera.startFollow(this.player, true, 0.05, 0.05)
            this.camera.setZoom(5,5)
            this.camera.setBounds(0, 0, this.layer1.width, this.layer1.height)
            this.physics.world.setBounds(0, 0, this.layer1.width, this.layer1.height)
            this.physics.add.collider(this.player, this.collider)

            this.physics.add.overlap(this.enterance, this.player, (_obj1, _player) => {
                console.log('hdhsdas')
                this.network.changeMap('hamemayu')
                this.scene.start('Hamemayu')
            })
        }
        else{
            const newPlayer = new Player(this, player.x, player.y, 'char', false)
            newPlayer.id = player.id
            console.log(player.id)
            this.players.add(newPlayer)
        }
    }

    deletePlayer(id: string){
        const existingPlayer = this.players.getChildren().find((p: any) => p.id === id) as Player;
        if (existingPlayer) {
            existingPlayer.destroy()
        }
    }

    updatePlayer(data: PlayerData[]){
        data.forEach((player: PlayerData) => {
            if (player.map === this.map) {
                const existingPlayer = this.players.getChildren().find((p: any) => p.id === player.id) as Player;
                if (existingPlayer && existingPlayer.id != this.socket.id) {
                    var distance = Phaser.Math.Distance.Between(existingPlayer.x, existingPlayer.y, player.x, player.y);
                    var duration = distance*10;
                    this.add.tween({
                        targets: existingPlayer,
                        x: player.x,
                        y: player.y,
                        duration: duration,
                    })
                    existingPlayer.dir.x = parseInt(player.x - existingPlayer.x+'')
                    existingPlayer.dir.y = parseInt(player.y - existingPlayer.y+'')
                    existingPlayer.dir.normalize()
                    existingPlayer.update()
                }
            }
        })
    }
}
