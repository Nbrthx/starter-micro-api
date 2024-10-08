import { Scene } from 'phaser';
import { Player } from '../prefabs/Player';
import { Socket } from 'socket.io-client';
import { Joystick } from '../components/Joystick';
import { Enemy } from '../prefabs/Enemy';
import { Network } from '../components/Network';
import { Hitbox } from '../prefabs/Hitbox';
import { Quest } from '../components/Quest'
import Plant from '../prefabs/Plant';
import { Inventory } from '../components/Inventory';
import { Controller } from '../components/Controller';
import { Popup } from '../components/Popup';
import { Stats } from '../components/Stats';
import { Outfit } from '../components/Outfit';

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
    joystick: Joystick;
    enemy: Enemy;
    weaponHitbox: Phaser.GameObjects.Group;
    collider: any;
    network: Network;
    enterance: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[];
    attackEvent: () => void;
    changeBtnEvent: () => void;
    attack: HTMLElement | null;
    enemyTrack: () => void;
    quest: Quest;
    plants: Plant[];
    inventory: Inventory;
    counter: number;
    stats: Stats;
    difficulty: string;
    outfit: Outfit;

    constructor () {
        super('Hutan');
        this.map = 'hutan'
        this.difficulty = 'easy'
    }

    init(props: { difficulty: string }){
        this.difficulty = props.difficulty
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
        this.quest = new Quest()
        this.counter = 0
        console.log(this.counter)

        // Others
        this.players = this.add.group()

        // Hitbox
        this.weaponHitbox = this.add.group()

        // Enemy
        this.enemy = new Enemy(this, coor(13), coor(8), this.difficulty)

        // Outfit
        this.outfit = new Outfit(this.socket)
        
        // Stats
        this.stats = new Stats(this.socket)

        // Player
        this.player = new Player(this, coor(5), coor(8), 'char', true)
        this.player.healthBar.setVisible(true)
        this.player.bar.setVisible(true)
        this.camera.startFollow(this.player, true, 0.05, 0.05)
                    
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
        this.plants = []
        this.plants.push(new Plant(this, coor(4), coor(4), 0))
        this.plants.push(new Plant(this, coor(6), coor(4), 1))
        this.plants.push(new Plant(this, coor(10), coor(4), 2))
        this.plants.push(new Plant(this, coor(12), coor(4), 2))
        this.plants.push(new Plant(this, coor(4), coor(7), 3))
        this.plants.push(new Plant(this, coor(6), coor(7), 4))
        this.plants.push(new Plant(this, coor(10), coor(7), 5))
        this.plants.push(new Plant(this, coor(12), coor(7), 5))
        this.plants.push(new Plant(this, coor(4), coor(10), 6))
        this.plants.push(new Plant(this, coor(6), coor(10), 7))
        this.plants.push(new Plant(this, coor(10), coor(10), 8))
        this.plants.push(new Plant(this, coor(12), coor(10), 8))

        // Enemy
        let cooldown = true
        this.physics.add.overlap(this.player, this.enemy.attackArea, (_player, parent) => {
            if(cooldown){
                const { x, y } = this.player
                const enemy = ((parent as Hitbox).parent as Enemy)
                let reflectTime = [200, 400]
                let cooldownTime = [1000, 1500]

                if(this.difficulty == 'normal'){
                    reflectTime = [100, 300]
                    cooldownTime = [800, 1200]
                }
                else if(this.difficulty == 'hard'){
                    reflectTime = [100, 200]
                    cooldownTime = [600, 1000]
                }

                setTimeout(() => {
                    enemy.attack(x, y)
                }, enemy.enemyState == 2? reflectTime[0] : reflectTime[1])

                cooldown = false
                setTimeout(() => cooldown = true, enemy.enemyState == 2? cooldownTime[0] : cooldownTime[1])
                
            }
        })
        this.physics.add.overlap(this.player, this.enemy.weaponHitbox, () => {
            if(!this.player.damaged){
                this.player.damaged = true
                this.player.health -= 5
                this.sound.play('hit')
                
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
                this.enemy.health -= 5
                this.sound.play('hit', { volume: 0.5 })

                this.add.tween({
                    targets: this.enemy,
                    duration: 50,
                    ease: 'ease-in-out',
                    alpha: 0,
                    repeat: 1,
                    yoyo: true
                })

                if(this.enemy.health <= 0){
                    if(this.difficulty == 'easy') this.outfit.addOutfit('head', 'women-purple')
                    else if(this.difficulty == 'normal') this.outfit.addOutfit('head', 'brown')
                    else if(this.difficulty == 'hard') this.outfit.addOutfit('outfit', 'dark')
                    this.enemy.destroy()
                }
                setTimeout(() => this.enemy.damaged = false, 300)
            }
        })

        // Inventory
        this.inventory = new Inventory(this.socket)

        // Controller
        Controller.hutan(this)

        // Prompt
        const prompt = document.getElementById('prompt')
        if(prompt) prompt.innerHTML = 'Ganti item ke bibit pohon pada tempatnya untuk memulai menanam'

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

        this.enemy.track(this.player)
        this.enemy.update()
        this.player.targetPos.x = this.enemy.x
        this.player.targetPos.y = this.enemy.y
    }

    addCounter(){
        this.counter++
        if(this.counter >= 60){
            if(this.enemy.active) this.enemy.destroy()
                this.physics.add.overlap(this.enterance[0], this.player, (_obj1, _player) => {
            if(this.attackEvent) this.attack?.removeEventListener('touchstart', this.attackEvent, true)
                    this.scene.start('Hamemayu', { from: 'hutan' })
            })
            
            let reward = [2, 2]
            if(this.difficulty == 'normal') reward = [4, 4]
            else if(this.difficulty == 'hard') reward = [6, 6]
            
            Popup.misionComplete('Misi "Memayu Hayuning Bawana" Selesai', 'Item yang didapat: kayu <b>'+reward[0]+'x</b>, XP <b>'+reward[1]+'x</b>')
            this.inventory.addItem('kayu', reward[0])
            this.stats.addXp(reward[1])
        }
    }
}
