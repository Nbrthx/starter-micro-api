// Suggested code may be subject to a license. Learn more: ~LicenseLog:2987568547.

import { Game } from "../scenes/Arena";

// Suggested code may be subject to a license. Learn more: ~LicenseLog:213122389.
export default class Plant extends Phaser.Physics.Arcade.Sprite {

    id: number;
    planted: boolean;
    itr: number;
    complete: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, id: number) {
      super(scene, x, y, 'grow-tree');
      this.id = id
      this.scene = scene;
      this.scene.add.existing(this);
      this.scene.physics.add.existing(this,);
      this.body?.setCircle(6)
      this.body?.setOffset(10, 20)
      this.setDepth(this.y+(this.height/2*this.originY)+8)
  
      this.planted = false
      this.itr = 0
      this.complete = false
  
      var savedState = JSON.parse(localStorage.getItem('plants') || '{}')
      if(savedState && savedState[this.id]){
        this.planted = savedState[this.id].planted
        this.itr = savedState[this.id].itr
        this.complete = savedState[this.id].complete
      }
  
      if(this.planted){
        this.tint = 0xffffff
        this.alpha = 1
      }
      else{
        this.tint = 0x000000
        this.alpha = 0.5
      }
      this.setFrame(this.itr)
    }
  
    plant(player: Phaser.Types.Physics.Arcade.ArcadeColliderType | undefined){
      if(this.scene.physics.overlap(this, player) && !this.planted){
        this.planted = true
        this.tint = 0xffffff
        this.alpha = 1
        // this.scene.stats.addXP(5)
        this.saveState()
        return true
      }
      return false
    }
  
    grow(player: Phaser.Types.Physics.Arcade.ArcadeColliderType | undefined){
      if(this.scene.physics.overlap(this, player) && this.planted){
        if(this.itr < 5){
          this.itr++
          this.setFrame(this.itr)
          if(this.itr == 5){
            // this.complete = true
            // this.scene.stats.addXP(5)
          }
          this.saveState()
          return true
        }
      }
      return false
    }
  
    saveState(){
      const data = JSON.parse(localStorage.getItem('plants') || '{}') || {}
      data[this.id] = {
        planted: this.planted,
        itr: this.itr,
        complete: this.complete
      }
      localStorage.setItem('plants', JSON.stringify(data))
    }
    
  }
  