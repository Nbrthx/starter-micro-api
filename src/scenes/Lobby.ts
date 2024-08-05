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
    enemy: Phaser.Physics.Arcade.Sprite;
    weaponHitbox: Phaser.GameObjects.Group;
    collider: any;
    network: Network;
    enterance: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    attackEvent: EventListener;
    attack: HTMLElement | null;

    constructor () {
        super('Lobby');
        this.map = 'lobby'
    }

    create () {
        this.camera = this.cameras.main;
        this.socket = this.registry.get('socket')

        const coor: Function = (x: number, xx: number = 0) => x*16+xx;

        // MAP
        const map: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: 'lobby' });
        const tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage('tileset', 'tileset') as Phaser.Tilemaps.Tileset;
        this.layer1 = map.createLayer('background', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
        this.layer2 = map.createLayer('wall', tileset, 0, 0)?.setCollisionByExclusion([-1]) as Phaser.Tilemaps.TilemapLayer;
        this.layer3 = map.getObjectLayer('wall2') as Phaser.Tilemaps.ObjectLayer;

        this.collider = []
        this.collider.push(this.layer2)

        // Others
        this.players = this.add.group()

        // Hitbox
        this.weaponHitbox = this.add.group()

        // Custom Collision
        this.layer3.objects.forEach((obj: Phaser.Types.Tilemaps.TiledObject) => {
            let x: integer = obj.x as integer
            let y: integer = obj.y as integer
            let width: integer = obj.width as integer
            let height: integer = obj.height as integer
            this.collider.push(this.physics.add.body(x, y, width, height).setImmovable(true))
        })

        // Enterance
        this.enterance = this.physics.add.image(coor(37), coor(17), '')
        this.enterance.setVisible(false)
        this.enterance.setSize(4, 64)

        // Enemy
        this.enemy = this.physics.add.sprite(coor(12), coor(8), 'char')

        this.physics.add.overlap(this.enemy as any, this.weaponHitbox, (_obj1: any, hitbox: any) => {
            console.log(hitbox.parent.id);
            this.network.changeMap('arena')
            if(this.attackEvent) this.attack?.removeEventListener('click', this.attackEvent, true)
            this.scene.pause('Lobby')
            this.scene.start('Arena')
        })

        // Quest


        // Controller
        const joystick = document.getElementById('joystick');
        const stick = document.getElementById('stick');
        this.attack = document.getElementById('attack');

        if(joystick && stick) this.joystick = new Joystick(joystick, stick);
        this.attackEvent = () => {
            this.socket.emit('attack', {
                map: this.map,
                x: this.player.x,
                y: this.player.y,
                dir: this.player.dir
            })
            if(this.player && !this.player.attacking) this.player.attack()
        }
        
        this.attack?.addEventListener('click', this.attackEvent, true)

        // Camera
        this.camera.setZoom(5,5)
        this.camera.setBounds(0, 0, this.layer1.width, this.layer1.height)
        this.physics.world.setBounds(0, 0, this.layer1.width, this.layer1.height)

        // Connection
        this.network = new Network(this)

        const updatePlayer = () => {
            if(this.player){
                this.player.dir.normalize()
                this.network.updatePlayer(this.map, this.player.x, this.player.y, this.player.dir)
                console.log('test')
            }
            setTimeout(() => updatePlayer(), 50)
        }
        updatePlayer()
        
        console.log('Hello')
    }

    update(){
        if(!this.player) return
        if(!this.player.active) return

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
        if(main && (!this.player || !this.player.active)){
            // Player
            this.player = new Player(this, player.x, player.y, 'char', true)
                    
            this.player.head.setTexture('green-head')
            this.player.id = player.id
            this.player.setCollideWorldBounds(true)
            this.weaponHitbox.add(this.player.weaponHitbox)
            this.players.add(this.player)
            console.log(player)

            // Camera
            this.camera.startFollow(this.player, true, 0.05, 0.05)
            this.physics.add.collider(this.player, this.collider)

            this.physics.add.overlap(this.enterance, this.player, (_obj1, _player) => {
                console.log('hdhsdas')
                this.network.changeMap('hamemayu')
                if(this.attackEvent) this.attack?.removeEventListener('click', this.attackEvent, true)
                this.scene.stop()
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
