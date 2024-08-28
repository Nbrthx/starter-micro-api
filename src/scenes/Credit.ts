import { Scene } from 'phaser';

export class Credit extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text : Phaser.GameObjects.Text;

    constructor ()
    {
        super('Credit');
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0x112228);

        this.gameover_text = this.add.text(this.scale.width/2, 360, '', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        this.gameover_text.setOrigin(0.5);
        this.gameover_text.setText('CREDIT\n'+
        'Developer: Ektada Benabi Muhamad El Amin\n'+
        'Artist/Designer: Muhammad Fakhir Nafis Al Khuluq\n'+
        'Director: Adji Saiddinullah\n'+
        'Music Backsound: Robin Wild Green')

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
    }
}
