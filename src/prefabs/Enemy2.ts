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
    health: number;
    enemyState: number;
    healthBar: Phaser.GameObjects.Rectangle;
    bar: Phaser.GameObjects.Rectangle;
    difficulty: string;
    maxHealth: number;

    constructor(scene: Phaser.Scene, x: number, y: number, difficulty: string) {
        super(scene, x, y, 'enemy2');

        this.scene = scene
        this.difficulty = difficulty
        
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.setBodySize(10, 10)
        this.setOffset(3, 6)

        this.weapon = this.scene.add.image(0, 0, 'ketapel')
        this.weapon.setOrigin(0.5, 0.5)
        
        this.healthBar = this.scene.add.rectangle(0, -9, 20, 2, 0xff4455)
        this.bar = this.scene.add.rectangle(0, -9, 20, 2, 0x777777)

        this.enemyState = 0
        this.damaged = false
        this.maxHealth = 100

        this.enemyName = this.scene.add.text(0,-13, 'Perusak Air Tanah lvl.1', {
            fontFamily: 'Arial Black', fontSize: 4, color: '#ffffff',
            stroke: '#000000', strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5, 0.5).setResolution(5)

        if(this.difficulty == 'normal'){
            this.maxHealth = 150
            this.enemyName.setText('Perusak Air Tanah lvl.2')
        }
        else if(this.difficulty == 'hard'){
            this.maxHealth = 200
            this.enemyName.setText('Perusak Air Tanah lvl.3')
        }

        this.health = this.maxHealth

        this.container = this.scene.add.container(0, 0, [
            this.enemyName, this.weapon, this.bar, this.healthBar
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

        this.setDepth(this.y-4)
        this.container.setDepth(this.y-3)
        this.healthBar.setSize(20*this.health/this.maxHealth, 2)
        this.healthBar.setX(-10-10*this.health/-this.maxHealth)
    }

    changeState(){
        this.enemyState++

        let stateTime = [6000, 2000, 5000]

        if(this.difficulty == 'normal'){
            stateTime = [5000, 3000, 4000]
        }
        else if(this.difficulty == 'hard'){
            stateTime = [Math.floor(Math.random()*3000)+4000, 4000, Math.floor(Math.random()*3000)+3000]
        }

        if(this.enemyState == 1) setTimeout(() => this.changeState(), stateTime[0])
        else if(this.enemyState == 2){
            setTimeout(() => this.changeState(), stateTime[1])
            this.setTint(0xff0000)
        }
        else{ 
            this.enemyState = 0
            setTimeout(() => this.changeState(), stateTime[2])
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
