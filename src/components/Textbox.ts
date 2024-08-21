export class TextBox extends Phaser.GameObjects.Text {
    itr: number;
    timer: Phaser.Time.TimerEvent;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, '', { fontSize: 8, color: '#000', strokeThickness: 2, stroke: '#fff' });
        this.scene = scene;
        this.scene.add.existing(this)
        this.setResolution(5)
        
        this.itr = 0;

        this.setFontFamily('Pixel');
        this.setFontStyle('bold');
        this.setOrigin(0.5, 0.5);
        this.setDepth(999)
    }
//
    writeText(preText = ''){
        if(this.timer) this.timer.destroy()
        this.itr = 0
        this.tick(preText)
    }

    tick(preText: string){
        if (this.itr <= preText.length) {
            this.text = preText.substring(0, this.itr)
            this.itr++;
            this.scene.time.addEvent({
                delay: 50,
                callback: () => this.tick(preText),
            });
        }
        else{
            this.timer = this.scene.time.addEvent({
                delay: 4000,
                callback: () => {
                    this.itr = 0
                    this.text = ''
                }
            });
        }
    }

    destroy(){
        super.destroy()
    }
}
