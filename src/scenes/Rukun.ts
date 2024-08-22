import { Scene } from 'phaser';
import { Player, PlayerData } from '../prefabs/Player';
import { Socket } from 'socket.io-client';
import { Joystick } from '../components/Joystick';
import { Network } from '../components/Network';
import { Inventory } from '../components/Inventory';
import { Controller } from '../components/Controller';
import { Trees } from '../components/Trees';
import { Quest } from '../components/Quest';

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
    npc: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    inventory: Inventory;
    quest: Quest;
    questGoEvent: EventListener;
    questCancelEvent: EventListener;

    constructor () {
        super('Rukun');
        this.map = 'rukun'
        this.spawnPoint = (from: string) => {
            if(from == 'lobby')
                return { x: coor(1), y: coor(5) }
            if(from == 'rumah')
                return { x: coor(14), y: coor(5) }
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
        const map: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: 'rukun' });
        const tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage('tileset', 'tileset') as Phaser.Tilemaps.Tileset;
        this.layer1 = map.createLayer('background', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
        this.layer2 = map.createLayer('wall', tileset, 0, 0)?.setCollisionByExclusion([-1]) as Phaser.Tilemaps.TilemapLayer;
        this.layer3 = map.getObjectLayer('wall2') as Phaser.Tilemaps.ObjectLayer;
        const tree1 = map.getObjectLayer('tree1') as Phaser.Tilemaps.ObjectLayer;

        this.collider = []
        this.collider.push(this.layer2)

        // Custom Collision
        Trees.collision(this, this.layer3.objects)
        Trees.tree1(this, tree1.objects)

        // NPCs
        this.npc = this.physics.add.sprite(coor(10, 8), coor(6, 8), 'char')

        // Others
        this.players = this.add.group()

        // Hitbox
        this.weaponHitbox = this.add.group()

        // Enterance
        this.enterance = []
        this.enterance.push(this.physics.add.image(coor(0), coor(5), ''))
        this.enterance[0].setVisible(false)
        this.enterance[0].setSize(4, 32)

        this.enterance.push(this.physics.add.image(coor(13), coor(5), ''))
        this.enterance[1].setVisible(false)
        this.enterance[1].setSize(4, 32)

        // Quest
        this.quest = new Quest()

        // Inventory
        this.inventory = new Inventory(this.socket)

        // Controller
        Controller.basic(this)

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

        Controller.movement(this)
        
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

            // Enterence
            this.physics.add.overlap(this.enterance[0], this.player, (_obj1, _player) => {
                this.network.changeMap('lobby')
                this.removeListener()
                this.scene.start('Lobby', { from: 'rukun' })
            })

            // NPCs
            const questBox = document.getElementById('quest-box')
            this.physics.add.overlap(this.npc, this.player.weaponHitbox, (_obj1, _player) => {
                this.quest.requestQuest(2)
                
                const questGo = document.getElementById('go')
                const questCancel = document.getElementById('cancel')
                questGo?.addEventListener('click', this.questGoEvent)
                questCancel?.addEventListener('click', this.questCancelEvent)
                
                if(questBox) questBox.style.display = 'block'
            })
            this.questGoEvent = () => {
                this.physics.add.overlap(this.enterance[1], this.player, (_obj1, _player) => {
                    this.network.changeMap('hutan')
                    if(this.attackEvent) this.attack?.removeEventListener('touchstart', this.attackEvent, true)
                    this.scene.start('Rumah', { from: 'rukun' })
                })
                if(questBox) questBox.style.display = 'none'
            }
            this.questCancelEvent = () => {
                if(questBox) questBox.style.display = 'none'
            }
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
        const questGo = document.getElementById('go')
        const questCancel = document.getElementById('cancel')
        questGo?.removeEventListener('click', this.questGoEvent)
        questCancel?.removeEventListener('click', this.questCancelEvent)
        this.attack?.removeEventListener('touchstart', this.attackEvent, true)
    }
}
