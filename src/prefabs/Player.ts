// Suggested code may be subject to a license. Learn more: ~LicenseLog:849228425.
export class Player extends Phaser.Physics.Arcade.Sprite {

    scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number, char: string | Phaser.Textures.Texture) {
        super(scene, x, y, char);

        this.scene = scene
        
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.setScale(5)
        this.setBodySize(10, 10)
        this.setOffset(3, 6)

        const container: Phaser.GameObjects.Container = this.scene.add.container(0, 0, [
            this.scene.add.text(0,0, '', {
                fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
                stroke: '#000000', strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5, 0.5)
        ])

        this.scene.events.on('postupdate', () => {
            container.x = this.x;
            container.y = this.y-50;
            (container.list[0] as Phaser.GameObjects.Text).setText(this.scene.game.loop.actualFps+'')
        })
    }

    update() {
        const cursors: any = this.scene.input.keyboard?.addKeys('W,A,S,D') as Phaser.Input.Keyboard.KeyboardManager;

        if (cursors.A.isDown) {
            this.setVelocityX(-1)
        } else if (cursors.D.isDown) {
            this.setVelocityX(1)
        } else {
            this.setVelocityX(0)
        }

        if (cursors.W.isDown) {
            this.setVelocityY(-1)
        } else if (cursors.S.isDown) {
            this.setVelocityY(1)
        } else {
            this.setVelocityY(0)
        }

        if(this.body && this.body.velocity.x > 0) this.flipX = false
        else if(this.body && this.body.velocity.x < 0) this.flipX = true

        if(this.body && (this.body.velocity.y != 0 || this.body.velocity.x != 0)){
            if(this.body.velocity.y < 0) this.anims.play('run-up', true)
            else this.anims.play('run-down', true)
        }else this.anims.play('idle', true)

        this.body?.velocity.normalize().scale(400)
    }
}
