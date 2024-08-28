import { Game } from "../scenes/Lobby";
import { Hitbox } from "./Hitbox";
import { Player } from "./Player";

export class Enemy extends Phaser.Physics.Arcade.Sprite {

    scene: Phaser.Scene;
    id: String;
    enemyName: Phaser.GameObjects.Text;
    container: Phaser.GameObjects.Container;
    dir: Phaser.Math.Vector2;
    attackArea: Phaser.Physics.Arcade.Image;
    weapon: Phaser.GameObjects.Sprite;
    weaponHitbox: Hitbox;
    damaged: boolean;
    health: number;
    enemyState: number;
    healthBar: Phaser.GameObjects.Rectangle;
    bar: Phaser.GameObjects.Rectangle;
    difficulty: string;
    speed: number[];
    maxHealth: number;

    constructor(scene: Phaser.Scene, x: number, y: number, difficulty: string = 'easy') {
        super(scene, x, y, 'enemy');

        this.scene = scene
        this.difficulty = difficulty
        
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.setBodySize(10, 10)
        this.setOffset(3, 6)

        this.attackArea = new Hitbox(this.scene, this, -8, -8, 'circle', 24)

        this.weapon = this.scene.add.sprite(0, 0, 'axe')
        this.weapon.setOrigin(0.1, 0.5)

        this.weaponHitbox = new Hitbox(this.scene, this, 0, 0, 'circle', 12)

        this.healthBar = this.scene.add.rectangle(0, -9, 20, 2, 0xff4455)
        this.bar = this.scene.add.rectangle(0, -9, 20, 2, 0x777777)

        this.speed = [30, 50]

        this.enemyState = 0
        this.damaged = false
        this.maxHealth = 150

        this.enemyName = this.scene.add.text(0,-13, 'Penebang Liar lvl.1', {
            fontFamily: 'Arial Black', fontSize: 4, color: '#ffffff',
            stroke: '#000000', strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5, 0.5).setResolution(5)
        
        if(difficulty == 'normal'){
            this.speed = [40, 60]
            this.maxHealth = 200
            this.enemyName.setText('Penebang Liar lvl.2')
        }
        else if(difficulty == 'hard'){
            this.speed = [40, 70]
            this.maxHealth = 250
            this.enemyName.setText('Penebang Liar lvl.3')
        }
        
        this.health = this.maxHealth

        this.container = this.scene.add.container(0, 0, [
            this.enemyName, this.attackArea, this.weapon, this.weaponHitbox, this.bar, this.healthBar
        ])

        this.scene.events.on('postupdate', () => {
            this.container.x = this.x;
            this.container.y = this.y;
        })

        this.dir = new Phaser.Math.Vector2(0, 0);
        this.changeState()
    }

    update() {
        this.setVelocity(this.dir.x, this.dir.y)

        if(this.dir.x > 0) this.flipX = false
        else if(this.dir.x < 0) this.flipX = true

        if((this.dir.y != 0 || this.dir.x != 0) && this.enemyState != 1){
            this.anims.play('enemy-run', true)
        }else this.anims.play('enemy-idle', true)

        if(this.weapon.anims.currentFrame?.index == 2){
            this.weaponHitbox.enableBody()
        }
        else{
            this.weaponHitbox.disableBody()
        }

        if(this.weapon.anims.isPlaying) this.weapon.setVisible(true)
        else this.weapon.setVisible(false)

        this.body?.velocity.normalize().scale(this.speed[0])

        if(this.enemyState == 1){
            this.body?.velocity.normalize().scale(0)
        }
        else if(this.enemyState == 2){
            this.body?.velocity.normalize().scale(this.speed[1])
        }

        this.setDepth(this.y-4)
        this.healthBar.setSize(20*this.health/this.maxHealth, 2)
        this.healthBar.setX(-10-10*this.health/-this.maxHealth)
    }

    changeState(){
        this.enemyState++
        if(this.enemyState == 1) setTimeout(() => this.changeState(), 5000)
        else if(this.enemyState == 2){
            setTimeout(() => this.changeState(), 4000)
            this.setTint(0xff0000)
        }
        else{ 
            this.enemyState = 0
            setTimeout(() => this.changeState(), 6000)
            this.setTint(0xffffff)
        }
    }

    attack(x: number, y: number) {
        if(this.enemyState == 1) return

        this.scene.sound.play('swing')

        this.weapon.visible = true;
        this.weapon.play('attack-axe', true)
        this.weapon.rotation = Phaser.Math.Angle.Between(this.x, this.y, x, y)
        let dirX = Math.cos(this.weapon.rotation)*14
        let dirY = Math.sin(this.weapon.rotation)*14

        if(dirX < 0) this.weapon.flipY = true
        else this.weapon.flipY = false
        
        this.weaponHitbox.x = dirX+4
        this.weaponHitbox.y = dirY+4
    }

    track(player: Player){
        const dir = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)

        if(Phaser.Math.Distance.BetweenPoints(this, player) > 10){
            this.dir.x = Math.cos(dir)
            this.dir.y = Math.sin(dir)
        }
        else{
            this.dir.x = 0
            this.dir.y = 0
        }
    }

    destroy(): void {
        this.container.destroy()
        super.destroy()
    }
}
