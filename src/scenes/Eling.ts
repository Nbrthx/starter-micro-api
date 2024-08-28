import { Scene } from 'phaser';
import { Player, PlayerData } from '../prefabs/Player';
import { Socket } from 'socket.io-client';
import { Joystick } from '../components/Joystick';
import { Network } from '../components/Network';
import { Inventory } from '../components/Inventory';
import { Controller } from '../components/Controller';
import { Trees } from '../components/Trees';
import { Quest } from '../components/Quest';
import { Stats } from '../components/Stats';
import { Outfit } from '../components/Outfit';

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
    changeBtnEvent: () => void;
    attack: HTMLElement | null;
    npc: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    inventory: Inventory;
    quest: Quest;
    questGoEvent: EventListener;
    questCancelEvent: EventListener;
    stats: Stats;
    outfit: Outfit;

    constructor () {
        super('Eling');
        this.map = 'eling'
        this.spawnPoint = (from: string) => {
            if(from == 'lobby')
                return { x: coor(1), y: coor(9) }
            if(from == 'kolam')
                return { x: coor(15), y: coor(9) }
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
        const map: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: 'eling' });
        const tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage('tileset', 'tileset') as Phaser.Tilemaps.Tileset;
        this.layer1 = map.createLayer('background', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
        this.layer2 = map.createLayer('wall', tileset, 0, 0)?.setCollisionByExclusion([-1]) as Phaser.Tilemaps.TilemapLayer;
        this.layer3 = map.getObjectLayer('wall2') as Phaser.Tilemaps.ObjectLayer;
        //const home1 = map.getObjectLayer('home1') as Phaser.Tilemaps.ObjectLayer;

        this.collider = []
        this.collider.push(this.layer2)

        // Custom Collision
        Trees.collision(this, this.layer3.objects)
        //Trees.home1(this, home1.objects)

        // NPCs
        this.npc = this.physics.add.sprite(coor(6, 8), coor(6, 8), 'npc')
        this.npc.play('npc-idle')
        this.npc.setFlipX(true)

        // Others
        this.players = this.add.group()

        // Hitbox
        this.weaponHitbox = this.add.group()

        // Enterance
        this.enterance = []
        this.enterance.push(this.physics.add.image(coor(0), coor(9), ''))
        this.enterance[0].setVisible(false)
        this.enterance[0].setSize(4, 32)

        this.enterance.push(this.physics.add.image(coor(16), coor(9), ''))
        this.enterance[1].setVisible(false)
        this.enterance[1].setSize(4, 32)

        // Quest
        this.quest = new Quest()

        // Outfit
        this.outfit = new Outfit(this.socket)

        // Stats
        this.stats = new Stats(this.socket)

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
                this.scene.start('Lobby', { from: 'eling' })
            })

            // NPCs
            const questBox = document.getElementById('quest-box')

            this.physics.add.overlap(this.npc, this.player.weaponHitbox, (_obj1, _player) => {
                if(!this.quest.opened) this.quest.requestQuest(1, this.inventory, this.stats, this.questGoEvent, this.questCancelEvent)
                
                if(questBox){
                    questBox.style.display = 'block'
                    questBox.scrollTo(0, 0)
                }
            })

            let overlapEvent: Phaser.Physics.Arcade.Collider

            this.questGoEvent = (evt) => {
                let difficulty = (evt.target as HTMLButtonElement).value
                if(overlapEvent) overlapEvent.destroy()
                overlapEvent = this.physics.add.overlap(this.enterance[1], this.player, (_obj1, _player) => {
                    this.network.changeMap('Kolam')
                    if(this.attackEvent) this.attack?.removeEventListener('touchstart', this.attackEvent, true)
                    this.scene.start('Kolam', { difficulty: difficulty })
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
        const questGo = document.getElementById("go");
        const questGo2 = document.getElementById("go2");
        const questGo3 = document.getElementById("go3");
        const questCancel = document.getElementById("cancel");
        questGo?.removeEventListener("click", this.questGoEvent);
        questGo2?.removeEventListener("click", this.questGoEvent);
        questGo3?.removeEventListener("click", this.questGoEvent);
        questCancel?.removeEventListener('click', this.questCancelEvent)
        this.attack?.removeEventListener('touchstart', this.attackEvent, true)
    }
}
