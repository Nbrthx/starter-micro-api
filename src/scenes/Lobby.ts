import { Scene } from 'phaser';
import { Player, PlayerData } from '../prefabs/Player';
import { Socket } from 'socket.io-client';
import { Joystick } from '../components/Joystick';
import { Network } from '../components/Network';
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
    network: Network;
    enterance: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[];
    attackEvent: () => void;
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

    constructor () {
        super('Lobby');
        this.map = 'lobby',
        this.spawnPoint = (from: string) => {
            if(from == 'hamemayu')
            return { x: coor(36), y: coor(17) }
            if(from == 'eling')
                return { x: coor(36), y: coor(8) }
            if(from == 'rukun')
                return { x: coor(34), y: coor(25) }
            else return { x: coor(8), y: coor(8) }
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
        if(!this.sound.get('backsound').isPlaying) this.backsound.play()

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
        this.menuOutfit = this.physics.add.sprite(coor(16), coor(8), 'menu')
        this.menuOutfit.play('menu-idle')
        this.add.text(this.menuOutfit.x, this.menuOutfit.y-13, 'Mas "Ganti Baju"', {
            fontFamily: 'Arial Black', fontSize: 4, color: '#ffffff',
            stroke: '#000000', strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5, 0.5).setResolution(5)

        this.menuOptional = this.physics.add.sprite(coor(18), coor(12), 'menu')
        this.menuOptional.play('menu-idle')
        this.add.text(this.menuOptional.x, this.menuOptional.y-13, 'Mas "Optional Mission"', {
            fontFamily: 'Arial Black', fontSize: 4, color: '#ffffff',
            stroke: '#000000', strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5, 0.5).setResolution(5)

        this.menuLogout = this.physics.add.sprite(coor(8), coor(12), 'menu')
        this.menuLogout.play('menu-idle')
        this.add.text(this.menuLogout.x, this.menuLogout.y-13, 'Mas "Logout"', {
            fontFamily: 'Arial Black', fontSize: 4, color: '#ffffff',
            stroke: '#000000', strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5, 0.5).setResolution(5)

        // Outfit
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

        this.enterance.push(this.physics.add.image(coor(37), coor(8), ''))
        this.enterance[1].setVisible(false)
        this.enterance[1].setSize(4, 32)

        this.enterance.push(this.physics.add.image(coor(33, 8), coor(26), ''))
        this.enterance[2].setVisible(false)
        this.enterance[2].setSize(48, 4)

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
            if(this.player && this.player.active){
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

        Controller.movement(this)
        
        this.player.update()

        this.fog.tilePositionX += 0.1
        this.fog.tilePositionY += 0.05
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

            // Menu
            this.physics.add.overlap(this.menuOutfit, this.player.weaponHitbox, (_obj1, _player) => {
                this.outfit.open()
                const outfitBox = document.getElementById('outfit-box')
                if(outfitBox) outfitBox.style.display = 'block'
            })
            this.physics.add.overlap(this.menuOptional, this.player.weaponHitbox, (_obj1, _player) => {
                const optionalBox = document.getElementById('optional-box')
                const cancelBtn = document.getElementById('cancel-info')
                if(optionalBox && cancelBtn){
                    const cancel = () => {
                        optionalBox.style.display = 'none'
                        cancelBtn.removeEventListener('click', cancel)
                    }
                    cancelBtn.addEventListener('click', cancel)
                    optionalBox.style.display = 'block'
                }
            })
            this.physics.add.overlap(this.menuLogout, this.player.weaponHitbox, (_obj1, _player) => {
                const logoutBox = document.getElementById('logout-box')
                const goBtn = document.getElementById('logout')
                const cancelBtn = document.getElementById('cancel-logout')
                if(logoutBox && goBtn && cancelBtn){
                    const go = () => {
                        logoutBox.style.display = 'none'
                        localStorage.removeItem('hash')
                        this.network.changeMap('')
                        this.removeListener()
                        location.reload()
                        goBtn.removeEventListener('click', go)
                    }
                    const cancel = () => {
                        logoutBox.style.display = 'none'
                        cancelBtn.removeEventListener('click', cancel)
                    }
                    goBtn.addEventListener('click', go)
                    cancelBtn.addEventListener('click', cancel)
                    logoutBox.style.display = 'block'
                }
            })

            // Enterance
            this.physics.add.overlap(this.enterance[0], this.player, (_obj1, _player) => {
                this.network.changeMap('hamemayu')
                this.removeListener()
                this.scene.start('Hamemayu', { from: 'lobby' })
            })

            this.physics.add.overlap(this.enterance[1], this.player, (_obj1, _player) => {
                this.network.changeMap('eling')
                this.removeListener()
                this.scene.start('Eling', { from: 'lobby' })
            })

            this.physics.add.overlap(this.enterance[2], this.player, (_obj1, _player) => {
                this.network.changeMap('eling')
                this.removeListener()
                this.scene.start('Rukun', { from: 'lobby' })
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
        if(this.player) this.player.destroy()
        if(this.attackEvent) this.attack?.removeEventListener('touchstart', this.attackEvent, true)
    }
}
