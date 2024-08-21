import { Game } from "../scenes/Kolam";
import { Bullet } from "./Bullet";
import { Player } from "./Player";

export class Enemy extends Phaser.Physics.Arcade.Sprite {

    scene: Phaser.Scene;
    id: String;
    enemyName: Phaser.GameObjects.Text;
    container: Phaser.GameObjects.Container;
    dir: Phaser.Math.Vector2;
    damaged: boolean;
    heart: number;
    enemyState: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'enemy3');

        this.scene = scene
        
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.setBodySize(10, 10)
        this.setOffset(3, 6)

        this.enemyState = 0
        this.damaged = false
        this.heart = 100

        this.enemyName = this.scene.add.text(0,-12, 'Enemy', {
            fontFamily: 'Arial Black', fontSize: 4, color: '#ffffff',
            stroke: '#000000', strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5, 0.5).setResolution(5)

        this.container = this.scene.add.container(0, 0, [
            this.enemyName
        ])

        this.scene.events.on('postupdate', () => {
            this.container.x = this.x;
            this.container.y = this.y;
        })

        this.dir = new Phaser.Math.Vector2(0, 0);
    }

    update() {
        if(this.dir.x > 0) this.flipX = false
        else if(this.dir.x < 0) this.flipX = true

        this.anims.play('enemy3-idle', true)

        this.enemyName.text = 'Enemy'

        this.setDepth(this.y-4)
        this.container.setDepth(this.y-3)
    }

    attack(x: number, y: number) {
        let rot: number = Phaser.Math.Angle.Between(this.x, this.y, x, y)
        let dirX = Math.cos(rot)
        let dirY = Math.sin(rot)

        this.dir.x = dirX;

        (this.scene as Game).bullets.add(new Bullet(this.scene, this, dirX, dirY, 'bullet').setTint(0x000000))
    }

    destroy(): void {
        this.container.destroy()
        super.destroy()
    }
}
