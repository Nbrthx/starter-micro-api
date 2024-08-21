import { Scene } from 'phaser';
import { Player } from '../prefabs/Player';
import { Socket } from 'socket.io-client';
import { Joystick } from '../components/Joystick';
import { Enemy } from '../prefabs/Enemy2';
import { Network } from '../components/Network';
import { Hitbox } from '../prefabs/Hitbox';
import { Quest } from '../components/Quest'
import Plant from '../prefabs/Plant';
import { Inventory } from '../components/Inventory';
import { Controller } from '../components/Controller';
import { Bullet } from '../prefabs/Bullet';

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
    collider: any;
    network: Network;
    enterance: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[];
    attackEvent: () => void;
    attack: HTMLElement | null;
    enemyTrack: () => void;
    quest: Quest;
    inventory: Inventory;
    counter: number;
    embung: Phaser.Tilemaps.TilemapLayer;
    bullets: Phaser.GameObjects.Group;

    constructor () {
        super('Kolam');
        this.map = 'kolam'
    }

    create () {
        this.camera = this.cameras.main;
        this.socket = this.registry.get('socket')

        const coor: Function = (x: number, xx: number = 0) => x*16+xx;

        // MAP
        const map: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: 'kolam' });
        const tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage('tileset', 'tileset') as Phaser.Tilemaps.Tileset;
        this.layer1 = map.createLayer('background', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
        this.layer2 = map.createLayer('wall', tileset, 0, 0)?.setCollisionByExclusion([-1]) as Phaser.Tilemaps.TilemapLayer;
        this.embung = map.createLayer('embung', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;

        this.collider = []
        this.collider.push(this.layer2)

        // Quest
        this.quest = new Quest()
        this.counter = 0
        console.log(this.counter)

        // Others
        this.players = this.add.group()

        // Hitbox
        this.bullets = this.add.group()

        // Enemy
        this.enemy = new Enemy(this, coor(13), coor(8))

        // Player
        this.player = new Player(this, coor(5), coor(8), 'char', true)
        this.camera.startFollow(this.player, true, 0.05, 0.05)
                    
        this.player.head.setTexture('green-head')
        this.player.id = '-'
        this.player.setCollideWorldBounds(true)

        // Enterance
        this.enterance = []
        this.enterance.push(this.physics.add.image(coor(0), coor(9), ''))
        this.enterance[0].setVisible(false)
        this.enterance[0].setSize(4, 32)

        // Enemy
        const shot = () => {
            if(this.enemy.active){
                if(this.enemy.enemyState == 2){
                    this.enemy.attack(this.player.x, this.player.y)
                    setTimeout(shot, 1500)
                }
                else{
                    const x = Math.random()*64+this.player.x-32
                    const y = Math.random()*64+this.player.y-32
                    this.enemy.attack(x, y)
                    setTimeout(shot, 800)
                }
            }
        }
        shot()
        this.physics.add.overlap(this.player, this.bullets, (_player, _bullet) => {
            if(!this.player.damaged){
                this.player.damaged = true
                this.player.health -= 5

                let bullet = _bullet as Bullet
                if(bullet.body){
                    this.player.knockbackDir.x = bullet.body.velocity.x
                    this.player.knockbackDir.y = bullet.body.velocity.y
                    this.player.knockback = 400
                }
                
                this.add.tween({
                    targets: [this.player.head, this.player.outfit],
                    duration: 50,
                    ease: 'ease-in-out',
                    alpha: 0,
                    repeat: 1,
                    yoyo: true
                })

                if(this.player.health <= 0){
                    this.socket.removeAllListeners()
                    this.player.destroy()
                    if(this.attackEvent) this.attack?.removeEventListener('touchstart', this.attackEvent, true)
                    this.scene.start('GameOver')
                }
                setTimeout(() => this.player.damaged = false, 300)
            }
        })
        this.physics.add.overlap(this.enemy, this.player.weaponHitbox, () => {
            if(!this.enemy.damaged){
                this.enemy.damaged = true
                this.enemy.heart -= 5

                this.enemy.x = Math.floor(Math.random()*16*17)+16*2
                this.enemy.y = Math.floor(Math.random()*16*10)+16*3

                this.add.tween({
                    targets: this.enemy,
                    duration: 50,
                    ease: 'ease-in-out',
                    alpha: 0,
                    repeat: 1,
                    yoyo: true
                })

                if(this.enemy.heart <= 0){
                    this.enemy.destroy()
                }
                setTimeout(() => this.enemy.damaged = false, 300)
            }
        })

        // Quest


        // Inventory
        this.inventory = new Inventory()
        const item = document.getElementById('item');
        const itemAmount = document.getElementById('item-amount');
        if(item) item.className = 'item-'+this.inventory.currentName()
        if(itemAmount) itemAmount.innerHTML = this.inventory.items[this.inventory.current].amount+'x'
        if(itemAmount){
            itemAmount.innerHTML = this.inventory.items[this.inventory.current].amount+'x'
            if(this.inventory.current == 0) itemAmount.style.display = 'none'
            else itemAmount.style.display = 'block'
        }

        // Controller
        Controller.kolam(this)

        // Camera
        let tinyScale = 1
        console.log(this.scale.width, map.width*16*5)
        if(this.scale.width > map.width*16*5) tinyScale = this.scale.width / (map.width*16*5)
        console.log(tinyScale)
        this.camera.setZoom(5*tinyScale,5*tinyScale)
        this.camera.setBounds(0, 0, map.width*16, map.height*16)
        this.physics.world.setBounds(0, 0, map.width*16, map.height*16)
        this.physics.add.collider(this.player, this.collider)
        
        console.log('Hello')
    }

    update(){
        if(!this.player) return
        if(!this.player.active) return

        Controller.movement(this)
     
        this.player.update()

        if(!this.enemy) return
        if(!this.enemy.active) return

        this.enemy.update()
        this.player.targetPos.x = this.enemy.x
        this.player.targetPos.y = this.enemy.y

        this.bullets.getChildren().forEach(v => {
            v.update()
        })
    }

    addCounter(){
        this.counter++
        if(this.counter >= 198){
            if(this.enemy.active) this.enemy.destroy()
            this.physics.add.overlap(this.enterance[0], this.player, (_obj1, _player) => {
                if(this.attackEvent) this.attack?.removeEventListener('touchstart', this.attackEvent, true)
                this.scene.start('Eling', { from: 'kolam' })
            })
            this.quest.completeQuest(0)
        }
    }
}
