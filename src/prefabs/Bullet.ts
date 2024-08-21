export class Bullet extends Phaser.Physics.Arcade.Image {

    scene: Phaser.Scene;
    dir: Phaser.Math.Vector2;
    parent: Phaser.GameObjects.GameObject;

    constructor(scene: Phaser.Scene, parent: Phaser.GameObjects.GameObject, x: number, y: number, char: string | Phaser.Textures.Texture) {
        super(scene, (parent as Phaser.Physics.Arcade.Image).x, (parent as Phaser.Physics.Arcade.Image).y, char);

        this.scene = scene
        this.parent = parent
        this.dir = new Phaser.Math.Vector2(x, y)
        
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)

        setTimeout(() => {
            this.destroy()
        }, 1500)
    }

    update() {
        if(this.dir.x != 0 || this.dir.y != 0){
            this.setVelocity(this.dir.x, this.dir.y)
            this.body?.velocity.normalize().scale(160)
        }
    }
}
