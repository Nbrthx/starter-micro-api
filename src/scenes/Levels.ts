import { Joystick } from "../components/Joystick";
import { Network } from "../components/Network";
import { Enemy } from "../prefabs/Enemy";
import { Game } from "./Lobby";

export function lobby(scene: Game){
    scene.camera = scene.cameras.main;
    scene.socket = scene.registry.get('socket')

    const coor: Function = (x: number, xx: number = 1) => x*16+xx;

    // MAP
    const map: Phaser.Tilemaps.Tilemap = scene.make.tilemap({ key: 'lobby' });
    const tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage('tileset', 'tileset') as Phaser.Tilemaps.Tileset;
    scene.layer1 = map.createLayer('background', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
    scene.layer2 = map.createLayer('wall', tileset, 0, 0)?.setCollisionByExclusion([-1]) as Phaser.Tilemaps.TilemapLayer;
    scene.layer3 = map.getObjectLayer('wall2') as Phaser.Tilemaps.ObjectLayer;

    scene.collider = []
    scene.collider.push(scene.layer2)

    // Others
    scene.players = scene.add.group()

    // Hitbox
    scene.weaponHitbox = scene.add.group()

    // Custom Collision
    scene.layer3.objects.forEach((obj: Phaser.Types.Tilemaps.TiledObject) => {
        let x: integer = obj.x as integer
        let y: integer = obj.y as integer
        let width: integer = obj.width as integer
        let height: integer = obj.height as integer
        scene.collider.push(scene.physics.add.body(x, y, width, height).setImmovable(true))
    })

    // Enterance
    scene.enterance = scene.physics.add.image(coor(37), coor(17), '')
    scene.enterance.setVisible(false)
    scene.enterance.setSize(4, 64)

    // Enemy
    scene.enemy = new Enemy(scene, coor(10), coor(8), 'char')

    // Quest


    // Controller
    const joystick = document.getElementById('joystick');
    const stick = document.getElementById('stick');
    scene.attack = document.getElementById('attack');

    if(joystick && stick) scene.joystick = new Joystick(scene, joystick, stick);
    scene.attackEvent = () => {
        scene.socket.emit('attack', {
            map: 'lobby',
            x: scene.player.x,
            y: scene.player.y,
            dir: scene.player.dir
        })
        if(scene.player) scene.player.attack()
    }
    
    scene.attack?.addEventListener('click', scene.attackEvent, true)

    // Connection
    scene.network = new Network(scene)

    const updatePlayer = () => {
        if(scene.player){
            scene.player.dir.normalize()
            scene.network.updatePlayer(scene.map, scene.player.x, scene.player.y, scene.player.dir)
            setTimeout(updatePlayer, 50)
        }
    }
    updatePlayer()
    
    console.log('Hello')
}

export function hamemayu(scene: Game){
    scene.camera = scene.cameras.main;
    scene.socket = scene.registry.get('socket')

    const coor: Function = (x: number, xx: number = 1) => x*16+xx;

    // MAP
    const map: Phaser.Tilemaps.Tilemap = scene.make.tilemap({ key: 'hamemayu' });
    const tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage('tileset', 'tileset') as Phaser.Tilemaps.Tileset;
    scene.layer1 = map.createLayer('background', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
    scene.layer2 = map.createLayer('wall', tileset, 0, 0)?.setCollisionByExclusion([-1]) as Phaser.Tilemaps.TilemapLayer;

    scene.collider = []
    scene.collider.push(scene.layer2)

    // Others
    scene.players = scene.add.group()

    // Hitbox
    scene.weaponHitbox = scene.add.group()

    // Enterance
    scene.enterance = scene.physics.add.image(coor(37), coor(17), '')
    scene.enterance.setVisible(false)
    scene.enterance.setSize(4, 64)

    // Enemy
    scene.enemy = new Enemy(scene, coor(10), coor(8), 'char')

    // Quest


    // Controller
    const joystick = document.getElementById('joystick');
    const stick = document.getElementById('stick');
    scene.attack = document.getElementById('attack');

    if(joystick && stick) scene.joystick = new Joystick(scene, joystick, stick);
    scene.attackEvent = () => {
        scene.socket.emit('attack', {
            map: 'lobby',
            x: scene.player.x,
            y: scene.player.y,
            dir: scene.player.dir
        })
        if(scene.player) scene.player.attack()
    }
    
    scene.attack?.addEventListener('click', scene.attackEvent, true)

    // Connection
    scene.network = new Network(scene)

    const updatePlayer = () => {
        if(scene.player){
            scene.player.dir.normalize()
            scene.network.updatePlayer(scene.map, scene.player.x, scene.player.y, scene.player.dir)
            setTimeout(updatePlayer, 50)
        }
    }
    updatePlayer()
    
    console.log('Hello')
}