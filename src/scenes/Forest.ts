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

const coor: Function = (x: number, xx: number = 0) => x*16+xx;

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
    enterance: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[];
    spawnPoint: (from: string) => { x: any; y: any; };
    from: string;
    attackEvent: EventListener;
    attack: HTMLElement | null;
    npc: any;

    constructor () {
        super('Hutann');
        this.map = 'hutann'
        this.spawnPoint = (from: string) => {
            if(from == 'hamemayu')
            return { x: coor(1), y: coor(7) }
            else return { x: coor(8), y: coor(8) }
        }
        this.from = ''
    }

    init(props: { from: string }) {
        this.from = props.from
    }

    create () {
        this.camera = this.cameras.main;
        this.socket = this.registry.get('socket')

        // MAP
        const map: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: 'hutan' });
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
        this.enterance = []
        this.enterance.push(this.physics.add.image(coor(0), coor(7), ''))
        this.enterance[0].setVisible(false)
        this.enterance[0].setSize(4, 32)

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
        let tinyScale = 1
        console.log(this.scale.width, map.width*16*5)
        if(this.scale.width > map.width*16*5) tinyScale = this.scale.width / (map.width*16*5)
        console.log(tinyScale)
        this.camera.setZoom(5*tinyScale,5*tinyScale)
        this.camera.setBounds(0, 0, map.width*16, map.height*16)
        this.physics.world.setBounds(0, 0, map.width*16, map.height*16)

        // Connection
        this.network = new Network(this, this.spawnPoint(this.from).x, this.spawnPoint(this.from).y)

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
        console.log(player)
        if(main && (!this.player || !this.player.active)){
            // Player
            this.player = new Player(this, this.spawnPoint(this.from).x, this.spawnPoint(this.from).y, 'char', true)
                    
            this.player.head.setTexture('green-head')
            this.player.id = player.id
            this.player.setCollideWorldBounds(true)
            this.weaponHitbox.add(this.player.weaponHitbox)
            console.log(player)

            // Camera
            this.camera.startFollow(this.player, true, 0.05, 0.05)
            this.physics.add.collider(this.player, this.collider)

            this.physics.add.overlap(this.enterance[0], this.player, (_obj1, _player) => {
                console.log('hdhsdas')
                this.network.changeMap('hamemayu')
                if(this.attackEvent) this.attack?.removeEventListener('click', this.attackEvent, true)
                this.scene.start('Hamemayu', { from: 'hutan' })
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
