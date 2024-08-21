import { Game } from "../scenes/Kolam";
import { Bullet } from "./Bullet";
import { Player } from "./Player";

export class Enemy extends Phaser.Physics.Arcade.Sprite {

    scene: Phaser.Scene;
    id: String;
    enemyName: Phaser.GameObjects.Text;
    container: Phaser.GameObjects.Container;
    dir: Phaser.Math.Vector2;
    weapon: Phaser.GameObjects.Image;
    damaged: boolean;
    heart: number;
    enemyState: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'enemy2');

        this.scene = scene
        
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.setBodySize(10, 10)
        this.setOffset(3, 6)

        this.weapon = this.scene.add.image(0, 0, 'ketapel')
        this.weapon.setOrigin(0.5, 0.5)

        this.enemyState = 0
        this.damaged = false
        this.heart = 100

        this.enemyName = this.scene.add.text(0,-12, 'Enemy', {
            fontFamily: 'Arial Black', fontSize: 4, color: '#ffffff',
            stroke: '#000000', strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5, 0.5).setResolution(5)

        this.container = this.scene.add.container(0, 0, [
            this.enemyName, this.weapon
        ])

        this.scene.events.on('postupdate', () => {
            this.container.x = this.x;
            this.container.y = this.y;
        })

        this.dir = new Phaser.Math.Vector2(0, 0);
        this.changeState()
    }

    update() {
        if(this.dir.x > 0) this.flipX = false
        else if(this.dir.x < 0) this.flipX = true

        this.anims.play('enemy2-idle', true)

        this.enemyName.text = 'Enemy '+this.heart

        this.setDepth(this.y-4)
        this.container.setDepth(this.y-3)
    }

    changeState(){
        this.enemyState++
        if(this.enemyState == 1) setTimeout(() => this.changeState(), 6000)
        else if(this.enemyState == 2){
            setTimeout(() => this.changeState(), 2000)
            this.setTint(0xff0000)
        }
        else{ 
            this.enemyState = 0
            setTimeout(() => this.changeState(), 5000)
            this.setTint(0xffffff)
        }
    }

    attack(x: number, y: number) {
        if(this.enemyState == 1) return

        this.weapon.rotation = Phaser.Math.Angle.Between(this.x, this.y, x, y)
        let dirX = Math.cos(this.weapon.rotation)
        let dirY = Math.sin(this.weapon.rotation)

        this.weapon.x = dirX*6
        this.weapon.y = dirY*6

        if(dirX < 0) this.weapon.flipY = true;
        else this.weapon.flipY = false;

        (this.scene as Game).bullets.add(new Bullet(this.scene, this, dirX, dirY, 'bullet'))
    }

    destroy(): void {
        this.container.destroy()
        super.destroy()
    }
}
