import { Scene } from 'phaser';
import { Player, PlayerData } from '../prefabs/Player';
import { Socket } from 'socket.io-client';
import { Joystick } from '../components/Joystick';
import { Inventory } from '../components/Inventory';
import { Controller } from '../components/Controller';
import { Trees } from '../components/Trees';
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
    joystick: Joystick;
    weaponHitbox: Phaser.GameObjects.Group;
    collider: any;
    enterance: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[];
    attackEvent: () => void;
    changeBtnEvent: () => void;
    attack: HTMLElement | null;
    spawnPoint: (from: string) => { x: number, y: number };
    from: string;
    inventory: Inventory;
    fog: Phaser.GameObjects.TileSprite;
    backsound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    stats: Stats;
    menuOutfit: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    outfit: Outfit;
    menuOptional: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    menuLogout: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    network: any;

    constructor () {
        super('Tutorial');
        this.map = 'tutorial',
        this.spawnPoint = (_from: string) => {
            return { x: coor(8), y: coor(8) }
        }
        this.from = 'hamemayu'
    }

    init(props: { from: string }) {
        this.from = props.from
    }

    create () {
        this.camera = this.cameras.main;
        this.socket = this.registry.get('socket')

        this.backsound = this.sound.add('backsound')
        this.backsound.setVolume(0.5)
        this.backsound.setLoop(true)
        this.sound.stopAll()
        this.backsound.play()

        // Fog
        this.fog = this.add.tileSprite(0, 4*16, this.physics.world.bounds.width, this.physics.world.bounds.height, 'fog')
        this.fog.setAlpha(0.1)
        this.fog.setTint(0xccddff)
        this.fog.setDepth(99999)

        // MAP
        const map: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: 'lobby' });
        const tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage('tileset', 'tileset') as Phaser.Tilemaps.Tileset;
        this.layer1 = map.createLayer('background', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
        this.layer2 = map.createLayer('wall', tileset, 0, 0)?.setCollisionByExclusion([-1]) as Phaser.Tilemaps.TilemapLayer;
        this.layer3 = map.getObjectLayer('wall2') as Phaser.Tilemaps.ObjectLayer;
        const tree1 = map.getObjectLayer('tree1') as Phaser.Tilemaps.ObjectLayer;
        const tree2 = map.getObjectLayer('tree2') as Phaser.Tilemaps.ObjectLayer;

        this.collider = []
        this.collider.push(this.layer2)

        // Others
        this.players = this.add.group()

        // Menu
        this.menuOutfit = this.physics.add.sprite(coor(23), coor(16), 'menu')
        this.menuOutfit.play('menu-idle')
        this.add.text(this.menuOutfit.x, this.menuOutfit.y-13, 'Mas "Ganti Baju"', {
            fontFamily: 'Arial Black', fontSize: 4, color: '#ffffff',
            stroke: '#000000', strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5, 0.5).setResolution(5)

        this.outfit = new Outfit(this.socket)
        
        // Stats
        this.stats = new Stats(this.socket)

        // Hitbox
        this.weaponHitbox = this.add.group()

        // Custom Collision
        Trees.collision(this, this.layer3.objects)
        Trees.tree1(this, tree1.objects)
        Trees.tree2(this, tree2.objects)

        // Enterance
        this.enterance = []

        this.enterance.push(this.physics.add.image(coor(37), coor(17), ''))
        this.enterance[0].setVisible(false)
        this.enterance[0].setSize(4, 64)

        // Player
        this.player = new Player(this, coor(8), coor(8), 'char', true)
                    
        this.player.setCollideWorldBounds(true)
        this.weaponHitbox.add(this.player.weaponHitbox)
        this.players.add(this.player)

        // Tutorial 1
        this.add.text(coor(9), coor(9), 'Gunakan Joystick untuk bergerak\natau gunakan W,A,S,D', { fontSize: 6 }).setResolution(5)
        this.add.text(coor(11), coor(12), 'Gunakan Tombol dikanan\natau huruf J untuk menggunakan item', { fontSize: 6 }).setResolution(5)
        this.add.text(coor(12), coor(15), 'Gunakan Tombol putar\natau huruf K untuk mengganti item', { fontSize: 6 }).setResolution(5)
        this.add.text(coor(19), coor(17), 'Serang NPC\nuntuk berinteraksi', { fontSize: 6 }).setResolution(5)
        this.add.text(coor(24, 8), coor(15), 'Beberapa pintu bisa dimasuki\nsetelah anda berinteraksi\ndengan NPC', { fontSize: 6 }).setResolution(5)
        this.add.text(coor(24, 8), coor(17, 8), 'Beberapa map hanya\nbisa keluar setelah\nkamu enyelesaikan misi', { fontSize: 6 }).setResolution(5)
        this.add.text(coor(31), coor(17), 'Biasakan baca\ninstruksi\ndengan baik :)', { fontSize: 6 }).setResolution(5)
        this.add.text(coor(36), coor(16), '>\n>>\n>>>\n>>\n>', { fontSize: 6 }).setResolution(5)

        // Camera
        this.camera.startFollow(this.player, true, 0.05, 0.05)
        this.physics.add.collider(this.player, this.collider)

        // Menu
        this.physics.add.overlap(this.menuOutfit, this.player.weaponHitbox, (_obj1, _player) => {
            this.outfit.open()
            const outfitBox = document.getElementById('outfit-box')
            if(outfitBox) outfitBox.style.display = 'block'
        })

        // Enterance
        this.physics.add.overlap(this.enterance[0], this.player, (_obj1, _player) => {
            this.removeListener()
            if(this.stats.xp == 0) this.stats.addXp(1)
            this.scene.start('Lobby')
        })

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
        
        console.log('Hello')
    }

    update(){
        if(!this.player) return
        if(!this.player.active) return

        Controller.movement(this)
        
        this.player.update()

        this.fog.tilePositionX += 0.15
        this.fog.tilePositionY += 0.08
    }
    addPlayer(_player: PlayerData){

    }

    removeListener(){
        this.player.destroy()
        if(this.attackEvent) this.attack?.removeEventListener('touchstart', this.attackEvent, true)
    }
}
