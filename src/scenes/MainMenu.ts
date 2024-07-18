import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor('#444499');

        this.background = this.add.image(this.scale.width/2, this.scale.height/2, 'background');
        this.background.setAlpha(0.5);

        this.logo = this.add.image(this.scale.width/2, 300, 'logo');

        this.title = this.add.text(this.scale.width/2, 460, 'Play', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.title.setInteractive()
        this.title.once('pointerdown', () => {

            this.scene.start('Game');

        });
    }
}