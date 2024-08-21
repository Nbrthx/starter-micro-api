// Suggested code may be subject to a license. Learn more: ~LicenseLog:2987568547.

export class Home extends Phaser.Physics.Arcade.Sprite {

    id: number;
    itr: number;
    complete: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, id: number) {
      super(scene, x, y, 'dynamic-home');
      this.id = id
      this.scene = scene;
      this.scene.add.existing(this);
      this.scene.physics.add.existing(this);
      this.setSize(40, 40)
      this.setDepth(this.y+4)
  
      this.itr = 0
      this.complete = false

      this.setFrame(this.itr)
    }
  
    fix(player: Phaser.Types.Physics.Arcade.ArcadeColliderType | undefined){
      if(this.scene.physics.overlap(this, player)){
        if(this.itr < 3){
          this.itr++
          this.setFrame(this.itr)
          if(this.itr == 3){
            this.complete = true
          }
          return true
        }
      }
      return false
    }
  }
  