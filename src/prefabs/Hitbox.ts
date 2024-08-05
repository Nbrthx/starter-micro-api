import { GameObjects } from "phaser";

export class Hitbox extends Phaser.Physics.Arcade.Sprite {

    scene: Phaser.Scene;
    parent: GameObjects.GameObject;

    constructor(scene: Phaser.Scene, parent: Phaser.GameObjects.GameObject, x: number, y: number, type: 'circle' | 'rectangle', width: number, height: number = 0) {
        super(scene, x, y, '');

        this.scene = scene
        this.parent = parent

        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        
        this.visible = false
        console.log(this)
        if(type == 'circle') this.setCircle(width)
        else this.setSize(width, height)
        this.setOrigin(0.5, 0.5)
    }
}