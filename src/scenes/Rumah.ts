import { Scene } from 'phaser';
import { Player, PlayerData } from '../prefabs/Player';
import { Socket } from 'socket.io-client';
import { Joystick } from '../components/Joystick';
import { Network } from '../components/Network';
import { Inventory } from '../components/Inventory';
import { Controller } from '../components/Controller';
import { Trees } from '../components/Trees';
import { Quest } from '../components/Quest';
import { Home } from '../prefabs/Home';
import { Enemy } from '../prefabs/Enemy3';
import { Popup } from '../components/Popup';

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
    collider: any[];
    network: Network;
    enterance: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[];
    spawnPoint: (from: string) => { x: any; y: any; };
    from: string;
    attackEvent: () => void;
    attack: HTMLElement | null;
    inventory: Inventory;
    enemy: Enemy;
    bullets: Phaser.GameObjects.Group;
    homes: Home[];
    counter: number;

    constructor () {
        super('Rumah');
        this.map = 'rumah'
        this.spawnPoint = (from: string) => {
            if(from == 'rukun')
                return { x: coor(2), y: coor(8) }
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
        const map: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: 'rumah' });
        const tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage('tileset', 'tileset') as Phaser.Tilemaps.Tileset;
        this.layer1 = map.createLayer('background', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
        this.layer2 = map.createLayer('wall', tileset, 0, 0)?.setCollisionByExclusion([-1]) as Phaser.Tilemaps.TilemapLayer;
        this.layer3 = map.getObjectLayer('wall2') as Phaser.Tilemaps.ObjectLayer;
        // const tree1 = map.getObjectLayer('tree1') as Phaser.Tilemaps.ObjectLayer;

        this.collider = []
        this.collider.push(this.layer2)

        // Custom Collision
        // Trees.tree1(this, tree1.objects)
        Trees.collision(this, this.layer3.objects)

        // Others
        this.players = this.add.group()

        // Hitbox
        this.weaponHitbox = this.add.group()

        // Enterance
        this.enterance = []
        this.enterance.push(this.physics.add.image(coor(0), coor(7), ''))
        this.enterance[0].setVisible(false)
        this.enterance[0].setSize(4, 32)

        // Enemy
        this.bullets = this.add.group()

        this.enemy = new Enemy(this, coor(8), coor(9))

        // Quest
        this.counter = 0

        // Home
        this.homes = []
        this.homes.push(new Home(this, coor(2, 8), coor(2), 0))
        this.homes.push(new Home(this, coor(5, 4), coor(2), 1))
        this.homes.push(new Home(this, coor(8), coor(2), 2))
        this.homes.push(new Home(this, coor(10, 12), coor(2), 3))
        this.homes.push(new Home(this, coor(13, 8), coor(2), 4))

        this.socket.on('home', data => {
            console.log(data)
            this.homes.forEach((v, i) => {
                v.itr = data[i]
                v.setFrame(data[i])
                if(v.itr == 3){
                    v.complete = true
                }
            })
        })

        // Inventory
        this.inventory = new Inventory(this.socket)
        const item = document.getElementById('item');
        const itemAmount = document.getElementById('item-amount');
        if(item) item.className = 'item-'+this.inventory.currentName()
        if(itemAmount){
            itemAmount.innerHTML = this.inventory.items[this.inventory.current].amount+'x'
            if(this.inventory.current == 0) itemAmount.style.display = 'none'
            else itemAmount.style.display = 'block'
        }

        // Controller
        Controller.rumah(this)

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

        this.socket.on('enemy-attack', data => {
            if(this.enemy) this.enemy.attack(data.x, data.y)
        })

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

        Controller.movement(this)
        
        this.player.update()
        this.enemy.update()

        this.bullets.getChildren().forEach(v => {
            v.update()
        })
    }

    addPlayer(player: PlayerData, main: boolean = false){
        console.log(player)
        if(main && (!this.player || !this.player.active)){
            // Player
            this.player = new Player(this, this.spawnPoint(this.from).x, this.spawnPoint(this.from).y, 'char', true)
            this.player.healthBar.setVisible(true)
            this.player.bar.setVisible(true)
                    
            this.player.head.setTexture('green-head')
            this.player.id = player.id
            this.player.setCollideWorldBounds(true)
            this.weaponHitbox.add(this.player.weaponHitbox)
            console.log(player)

            // Camera
            this.camera.startFollow(this.player, true, 0.05, 0.05)
            this.physics.add.collider(this.player, this.collider)

            // Enterence
            this.physics.add.overlap(this.enterance[0], this.player, (_obj1, _player) => {
                this.network.changeMap('lobby')
                this.removeListener()
                this.scene.start('Rukun', { from: 'rumah' })
            })
        }
        else{
            const newPlayer = new Player(this, player.x, player.y, 'char', false)
            newPlayer.id = player.id
            console.log(player.id)
            this.players.add(newPlayer)
        }
    }

    removeListener(){
        this.player.destroy()
        this.attack?.removeEventListener('touchstart', this.attackEvent, true)
    }

    addCounter(){
        this.counter++;
        Popup.misionComplete('Anda Berkontribusi Mewujudkan "Rukun Agawe Santoso"')
    }
}
