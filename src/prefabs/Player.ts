import { TextBox } from "../components/Textbox";
import { Game } from "../scenes/Lobby";
import { Hitbox } from "./Hitbox";

export interface PlayerData{
    map: string;
    id: string;
    username: string;
    x: number;
    y: number;
    health: number;
}

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
    health: number;
    damaged: boolean;
    attacking: boolean;
    targetPos: Phaser.Math.Vector2;
    healthBar: Phaser.GameObjects.Rectangle;
    playerChat: TextBox;
    sendChat: () => void;
    sendEnter: (e: KeyboardEvent) => void;
    knockback: number;
    knockbackDir: Phaser.Math.Vector2;
    bar: Phaser.GameObjects.Rectangle;
    step: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

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

        this.targetPos = new Phaser.Math.Vector2(0, 0)

        this.attacking = false
        this.damaged = false
        this.health = 100

        this.knockback = 0
        this.knockbackDir = new Phaser.Math.Vector2(0, 0)

        this.head = this.scene.add.sprite(0, 0, 'green-head')
        this.head.setOrigin(0.5, 0.5)

        this.outfit = this.scene.add.sprite(0, 0, 'brown-outfit')
        this.outfit.setOrigin(0.5, 0.5)

        this.weapon = this.scene.add.sprite(0, 0, 'sword')
        this.weapon.setOrigin(0.4, 0.5)

        this.weaponHitbox = new Hitbox(scene, this, 0, 0, 'circle', 12)

        this.healthBar = this.scene.add.rectangle(0, -9, 20, 2, 0x33ff66)
        this.bar = this.scene.add.rectangle(0, -9, 20, 2, 0x777777)
        this.healthBar.setVisible(false)
        this.bar.setVisible(false)

        this.playerChat = new TextBox(this.scene, 0, -20)

        this.step = this.scene.sound.add('step')
        this.step.setRate(2)

        this.playerName = this.scene.add.text(0,-13, 'other', {
            fontFamily: 'Arial Black', fontSize: 4, color: '#ffffff',
            stroke: '#000000', strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5, 0.5).setResolution(5)

        this.container = this.scene.add.container(0, 0, [
            this.playerName, this.head, this.outfit, this.weapon, this.weaponHitbox, this.bar, this.healthBar, this.playerChat
        ])
        this.container.setDepth(100)

        if(main){
            this.playerName.setText(this.scene.registry.get('username'))

            const sendBtn = document.getElementById('btn-send');
            const chatInput = document.getElementById('chat') as HTMLInputElement;

            if(chatInput && sendBtn){

                this.sendChat = () => {
                    this.playerChat.writeText(chatInput.value)
                    const gameScene = (this.scene as Game)
                    gameScene.socket.emit('chat', { map: gameScene.map, text: chatInput.value })
                    chatInput.value = ''
                }

                this.sendEnter = (e: KeyboardEvent) => {
                    if(e.key === 'Enter')
                    this.sendChat()
                }

                sendBtn.addEventListener('click', this.sendChat, false)
                chatInput.addEventListener('keypress', this.sendEnter, false)

                chatInput.onfocus = () => {
                    if(this.scene.input.keyboard){
                        this.scene.input.keyboard.enabled = false
                        this.scene.input.keyboard.resetKeys()
                    }
                }
                this.scene.input.on("pointerdown", () => {
                    if(this.scene.input.keyboard) this.scene.input.keyboard.enabled = true
                    chatInput.blur()
                })
            }
        }

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
        if(this.targetPos.x != 0 || this.targetPos.y != 0) this.weapon.rotation = Phaser.Math.Angle.Between(this.x, this.y, this.targetPos.x, this.targetPos.y)
        else this.weapon.rotation = Phaser.Math.Angle.Between(0, 0, this.lastDir.x, this.lastDir.y)
        let dirX = Math.cos(this.weapon.rotation)*14
        let dirY = Math.sin(this.weapon.rotation)*14

        if(dirX < 0) this.weapon.flipY = true
        else this.weapon.flipY = false
        
        this.weaponHitbox.x = dirX+4
        this.weaponHitbox.y = dirY+4

        this.attacking = true
        setTimeout(() => {
            this.attacking = false
        }, 600)
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
            if(!this.step.isPlaying) this.step.play()
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

        if(this.weapon.anims.currentFrame?.index == 2){
            this.weaponHitbox.enableBody()
        }
        else{
            this.weaponHitbox.disableBody()
        }

        if(this.weapon.anims.isPlaying) this.weapon.setVisible(true)
        else this.weapon.setVisible(false)

        if(this.knockback > 0){
            this.setVelocity(this.knockbackDir.x, this.knockbackDir.y)
            this.body?.velocity.normalize().scale(this.knockback)
            this.knockback = Math.floor(this.knockback/2)
        }
        else this.body?.velocity.normalize().scale(80)

        this.container.setDepth(this.y-4)
        this.healthBar.setSize(20*this.health/100, 2)
        this.healthBar.setX(-10-10*this.health/-100)
    }

    destroy(): void {
        const chatInput = document.getElementById('chat') as HTMLInputElement;
        const sendBtn = document.getElementById('btn-send') as HTMLButtonElement;
        sendBtn.removeEventListener('click', this.sendChat, false)
        chatInput.removeEventListener('keypress', this.sendEnter, false)

        this.container.destroy()
        super.destroy()
    }
}
