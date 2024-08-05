import { Hitbox } from "./Hitbox";

export class Player extends Phaser.Physics.Arcade.Sprite {

    scene: Phaser.Scene;
    main: boolean;
    id: String;
    playerName: Phaser.GameObjects.Text;
    container: Phaser.GameObjects.Container;
    dir: Phaser.Math.Vector2;
    weapon: Phaser.GameObjects.Sprite;
    weaponHitbox: Phaser.Physics.Arcade.Image;
    head: Phaser.GameObjects.Sprite;
    outfit: Phaser.GameObjects.Sprite;
    lastDir: Phaser.Math.Vector2;
    heart: number;
    damaged: boolean;
    attacking: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, char: string, main: boolean) {
        super(scene, x, y, char);

        this.scene = scene
        this.main = main
        
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.setVisible(false)
        this.setBodySize(10, 10)
        this.setOffset(3, 6)
        this.setDepth(1)

        this.head = this.scene.add.sprite(0, 0, 'green-head')
        this.head.setOrigin(0.5, 0.5)

        this.outfit = this.scene.add.sprite(0, 0, 'brown-body')
        this.outfit.setOrigin(0.5, 0.5)

        this.weapon = this.scene.add.sprite(0, 0, 'sword')
        this.weapon.setOrigin(0.4, 0.5)

        this.weaponHitbox = new Hitbox(this.scene, this, 0, 0, 'circle', 12)

        this.attacking = false
        this.damaged = false
        this.heart = 100

        this.playerName = this.scene.add.text(0,-12, 'other', {
            fontFamily: 'Arial Black', fontSize: 4, color: '#ffffff',
            stroke: '#000000', strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5, 0.5).setResolution(5)

        this.container = this.scene.add.container(0, 0, [
            this.playerName, this.head, this.outfit, this.weapon, this.weaponHitbox
        ])
        this.container.setDepth(100)

        if(main)
            (this.container.list[0] as Phaser.GameObjects.Text).setText(this.heart+'')

        this.scene.events.on('postupdate', () => {
            this.container.x = this.x;
            this.container.y = this.y;
        })

        this.lastDir = new Phaser.Math.Vector2(0, 0);
        this.dir = new Phaser.Math.Vector2(0, 0);
    }

    attack() {
        if(this.attacking) return

        this.weapon.visible = true;
        this.weapon.play('attack', true)
        this.weapon.rotation = Phaser.Math.Angle.Between(0, 0, this.lastDir.x, this.lastDir.y)
        let dirX = Math.cos(this.weapon.rotation)*14
        let dirY = Math.sin(this.weapon.rotation)*14

        if(dirX < 0) this.weapon.flipY = true
        else this.weapon.flipY = false
        
        this.weaponHitbox.x = dirX+4
        this.weaponHitbox.y = dirY+4

        this.attacking = true
        setTimeout(() => {
            this.attacking = false
        }, 800)
    }

    update() {
        if(this.main) this.setVelocity(this.dir.x, this.dir.y)

        if(this.dir.x > 0){
            this.flipX = false
            this.head.flipX = false
            this.outfit.flipX = false
        }
        else if(this.dir.x < 0){
            this.flipX = true
            this.head.flipX = true
            this.outfit.flipX = true
        }

        if(this.dir.y != 0 || this.dir.x != 0){
            this.lastDir.x = this.dir.x
            this.lastDir.y = this.dir.y
            if(this.dir.y < 0){
                //this.anims.play('run-up', true)
                this.head.anims.play('run-up-'+this.head.texture.key, true)
                this.outfit.anims.play('run-up-'+this.outfit.texture.key, true)
            }
            else{
                //this.anims.play('run-down', true)
                this.head.anims.play('run-down-'+this.head.texture.key, true)
                this.outfit.anims.play('run-down-'+this.outfit.texture.key, true)
            }
        }else{
            //this.anims.play('idle', true)
            this.head.anims.play('idle-'+this.head.texture.key, true)
            this.outfit.anims.play('idle-'+this.outfit.texture.key, true)
        }

        this.playerName.text = this.heart+''

        if(this.weapon.anims.currentFrame?.index == 2){
            this.weaponHitbox.enableBody()
        }
        else{
            this.weaponHitbox.disableBody()
        }

        if(this.weapon.anims.isPlaying) this.weapon.setVisible(true)
        else this.weapon.setVisible(false)

        this.body?.velocity.normalize().scale(80)
    }

    destroy(): void {
        this.container.destroy()
        super.destroy()
    }
}
