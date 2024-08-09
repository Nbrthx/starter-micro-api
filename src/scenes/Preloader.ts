import { Scene } from 'phaser';

const outfits = ['basic', 'blue', 'green', 'brown']

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
            bar.text = (progress*100).toPrecision(2)+'%';

        });
    }

    preload () {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');

        this.load.image('tileset', 'tilemaps.png');

        this.load.spritesheet('char', 'character/full.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('grow-tree', 'property/grow-tree.png', { frameWidth: 32, frameHeight: 32 });

        for(var i of outfits){
            this.load.spritesheet(i+'-head', 'character/'+i+'-head.png', { frameWidth: 16, frameHeight: 16 });
            this.load.spritesheet(i+'-body', 'character/'+i+'-body.png', { frameWidth: 16, frameHeight: 16 });
        }
        this.load.spritesheet('sword', 'sword.png', { frameWidth: 48, frameHeight: 48 });

        this.load.tilemapTiledJSON('lobby', 'tilemap/map-lobby.json');
        this.load.tilemapTiledJSON('hamemayu', 'tilemap/map-hamemayu.json');
        this.load.tilemapTiledJSON('tarung', 'tilemap/map-tarung.json');
        this.load.tilemapTiledJSON('hutan', 'tilemap/map-hutan.json');
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

        for(let i of outfits){
            this.anims.create({
                key: 'idle-'+i+'-head',
                frames: this.anims.generateFrameNumbers(i+'-head', {
                    frames: [0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1,2,1,2]
                }),
                frameRate: 8,
                repeat: -1
            });
            this.anims.create({
                key: 'run-down-'+i+'-head',
                frames: this.anims.generateFrameNumbers(i+'-head', { 
                    frames: [0,0,3,0,0,3]
                }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'run-up-'+i+'-head',
                frames: this.anims.generateFrameNumbers(i+'-head', { 
                    frames: [4,4,5,4,4,5]
                }),
                frameRate: 10,
                repeat: -1
            });

            this.anims.create({
                key: 'idle-'+i+'-body',
                frames: this.anims.generateFrameNumbers(i+'-body', {
                    frames: [0]
                }),
                frameRate: 8,
                repeat: -1
            });
            this.anims.create({
                key: 'run-down-'+i+'-body',
                frames: this.anims.generateFrameNumbers(i+'-body', { start: 6, end: 11 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'run-up-'+i+'-body',
                frames: this.anims.generateFrameNumbers(i+'-body', { start: 12, end: 17 }),
                frameRate: 10,
                repeat: -1
            });
        }

        this.anims.create({
            key: 'attack',
            frames: this.anims.generateFrameNumbers('sword', {
                frames: [0,0,1,2,3,4,5,5,5,5,5,5]
            }),
            frameRate: 30,
        });
        
        this.scene.start('MainMenu');
    }
}
