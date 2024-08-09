import { Scene } from 'phaser';
import { Player } from '../prefabs/Player';
import { Socket } from 'socket.io-client';
import { Joystick } from '../components/Joystick';
import { Enemy } from '../prefabs/Enemy';
import { Network } from '../components/Network';
import { Hitbox } from '../prefabs/Hitbox';
import { Quest } from '../components/Quest'
import Plant from '../prefabs/Plant';

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
    enemy: Enemy;
    weaponHitbox: Phaser.GameObjects.Group;
    collider: any;
    network: Network;
    enterance: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[];
    attackEvent: EventListener;
    attack: HTMLElement | null;
    enemyTrack: () => void;
    quest: Quest;
    plants: Phaser.GameObjects.Group;

    constructor () {
        super('Hutan');
        this.map = 'hutan'
    }

    create () {
        this.camera = this.cameras.main;
        this.socket = this.registry.get('socket')

        const coor: Function = (x: number, xx: number = 0) => x*16+xx;

        // MAP
        const map: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: 'hutan' });
        const tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage('tileset', 'tileset') as Phaser.Tilemaps.Tileset;
        this.layer1 = map.createLayer('background', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
        this.layer2 = map.createLayer('wall', tileset, 0, 0)?.setCollisionByExclusion([-1]) as Phaser.Tilemaps.TilemapLayer;

        this.collider = []
        this.collider.push(this.layer2)

        // Quest
        this.quest = new Quest(0)

        // Others
        this.players = this.add.group()

        // Hitbox
        this.weaponHitbox = this.add.group()

        // Enemy
        this.enemy = new Enemy(this, coor(14), coor(8), 'char')

        // Player
        this.player = new Player(this, coor(5), coor(8), 'char', true)
                    
        this.player.head.setTexture('green-head')
        this.player.id = '-'
        this.player.setCollideWorldBounds(true)
        this.weaponHitbox.add(this.player.weaponHitbox)

        // Enterance
        this.enterance = []
        this.enterance.push(this.physics.add.image(coor(0), coor(7), ''))
        this.enterance[0].setVisible(false)
        this.enterance[0].setSize(4, 32)

        // Plants
        this.plants = this.add.group()
        this.plants.add(new Plant(this, coor(8), coor(8), 0))

        // Enemy
        let cooldown = true
        this.physics.add.overlap(this.player, this.enemy.attackArea, (_player, parent) => {
            if(cooldown){
                const { x, y } = this.player
                const enemy = ((parent as Hitbox).parent as Enemy)
                setTimeout(() => {
                    enemy.attack(x, y)
                }, enemy.enemyState == 2? 100 : 300)
                cooldown = false
                setTimeout(() => cooldown = true, enemy.enemyState == 2? 800 : 1500)
                
            }
        })
        this.physics.add.overlap(this.player, this.enemy.weaponHitbox, () => {
            if(!this.player.damaged){
                this.player.damaged = true
                this.player.heart -= 5
                
                this.add.tween({
                    targets: [this.player.head, this.player.outfit],
                    duration: 50,
                    ease: 'ease-in-out',
                    alpha: 0,
                    repeat: 1,
                    yoyo: true
                })

                if(this.player.heart <= 0){
                    this.socket.removeAllListeners()
                    if(this.attackEvent) this.attack?.removeEventListener('click', this.attackEvent, true)
                    this.scene.start('GameOver')
                }
                setTimeout(() => this.player.damaged = false, 300)
            }
        })
        this.physics.add.overlap(this.enemy, this.player.weaponHitbox, () => {
            if(!this.enemy.damaged){
                this.enemy.damaged = true
                this.enemy.heart -= 5

                this.add.tween({
                    targets: this.enemy,
                    duration: 50,
                    ease: 'ease-in-out',
                    alpha: 0,
                    repeat: 1,
                    yoyo: true
                })

                if(this.enemy.heart <= 0){
                    this.physics.add.overlap(this.enterance[0], this.player, (_obj1, _player) => {
                        if(this.attackEvent) this.attack?.removeEventListener('click', this.attackEvent, true)
                        this.scene.start('Hamemayu', { from: 'hutan' })
                    })
                    this.enemy.destroy()
                }
                setTimeout(() => this.enemy.damaged = false, 300)
            }
        })

        // Quest


        // Controller
        const joystick = document.getElementById('joystick');
        const stick = document.getElementById('stick');
        this.attack = document.getElementById('attack');

        if(joystick && stick) this.joystick = new Joystick(joystick, stick);
        this.attackEvent = () => {
            this.socket.emit('attack', {
                map: 'arena',
                x: this.player.x,
                y: this.player.y,
                dir: this.player.dir
            })
            if(this.player && !this.player.attacking) this.player.attack()
        }
        
        this.attack?.addEventListener('click', this.attackEvent, true)

        // Camera
        this.camera.startFollow(this.player, true, 0.05, 0.05)
        this.camera.setZoom(5,5)
        this.camera.setBounds(0, 0, this.layer1.width, this.layer1.height)
        this.physics.world.setBounds(0, 0, this.layer1.width, this.layer1.height)
        this.physics.add.collider(this.player, this.collider)
        
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

        if(!this.enemy) return
        if(!this.enemy.active) return

        this.enemy.track(this.player)
        this.enemy.update()
        this.player.targetPos.x = this.enemy.x
        this.player.targetPos.y = this.enemy.y
    }

    addPlayer(_player: PlayerData, _main: boolean = false){
        //
    }

    deletePlayer(_id: string){
        //
    }

    updatePlayer(_data: PlayerData[]){
        //
    }
}
