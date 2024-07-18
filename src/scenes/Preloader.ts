import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        const bar = this.add.text(this.scale.width / 2, this.scale.height / 2, '0%', {
            fontFamily: 'Arial Black', fontSize: 50, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5, 0.5)

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.text = progress*100+'%';

        });
    }

    preload () {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('tileset', 'tilemaps.png');
        this.load.spritesheet('char', 'char.png', { frameWidth: 16, frameHeight: 16 });
        this.load.tilemapTiledJSON('map', 'overworld.json');
    }

    create () {
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('char', {
                frames: [0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1,2,1,2]
            }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'run-down',
            frames: this.anims.generateFrameNumbers('char', { start: 6, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'run-up',
            frames: this.anims.generateFrameNumbers('char', { start: 12, end: 17 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.scene.start('MainMenu');
    }
}
