import { Scene } from 'phaser';
import { Player } from '../prefabs/Player';
import geckos from '@geckos.io/client';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text: Phaser.GameObjects.Text;
    layer1: Phaser.Tilemaps.TilemapLayer;
    layer2: Phaser.Tilemaps.TilemapLayer;
    layer3: Phaser.Tilemaps.ObjectLayer;
    player: Phaser.Physics.Arcade.Sprite;

    constructor () {
        super('Game');
    }

    create () {
        this.camera = this.cameras.main;

        const coor: Function = (x: number, xx: number = 1) => x*16*5+xx;

        const map: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: 'map' });
        const tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage('overworld', 'tileset') as Phaser.Tilemaps.Tileset;
        this.layer1 = map.createLayer('background', tileset, 0, 0)?.setScale(5) as Phaser.Tilemaps.TilemapLayer;
        this.layer2 = map.createLayer('wall', tileset, 0, 0)?.setScale(5).setCollisionByExclusion([-1]) as Phaser.Tilemaps.TilemapLayer;
        this.layer3 = map.getObjectLayer('wall2') as Phaser.Tilemaps.ObjectLayer;
        tileset.image?.setFilter(Phaser.Textures.NEAREST);

        const collider = []
        collider.push(this.layer2)

        this.player = new Player(this, coor(5), coor(4), 'char')
        this.player.setCollideWorldBounds(true)

        this.layer3.objects.forEach((obj: Phaser.Types.Tilemaps.TiledObject) => {
            let x: integer = obj.x as integer
            let y: integer = obj.y as integer
            let width: integer = obj.width as integer
            let height: integer = obj.height as integer
            collider.push(this.physics.add.body(x*5, y*5, width*5, height*5).setImmovable(true))
        })
        
        this.camera.startFollow(this.player, true)
        this.camera.setBounds(0, 0, this.layer1.width*5, this.layer1.height*5)
        this.physics.world.setBounds(0, 0, this.layer1.width*5, this.layer1.height*5)
        this.physics.add.collider(this.player, collider)
    }

    update(): void {
        this.player.update()
    }
}
