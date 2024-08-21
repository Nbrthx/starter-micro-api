import { Scene } from 'phaser';
import { hamemayu } from './Levels';

const head = ['basic', 'blue', 'green', 'brown', 'women', 'women-purple', 'women-red']
const outfit = ['basic', 'blue', 'green', 'brown', 'women-purple']

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
            bar.setText((progress*100).toPrecision(2)+'%');
            if(progress == 0) bar.setText('0')

        });
    }

    preload () {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');

        this.load.image('tileset', 'tilemaps.png');
        this.load.image('fog', 'fog.png');

        this.load.image('tree1', 'property/tree1.png');
        this.load.image('tree2', 'property/tree2.png');
        this.load.image('home1', 'property/static-home.png');
        this.load.spritesheet('dynamic-home', 'property/home.png', { frameWidth: 48, frameHeight: 48 });

        this.load.spritesheet('char', 'character/full.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('grow-tree', 'property/grow-tree.png', { frameWidth: 32, frameHeight: 32 });

        for(var i of head){
            this.load.spritesheet(i+'-head', 'character/head/'+i+'-head.png', { frameWidth: 16, frameHeight: 16 });
        }
        for(var i of outfit){
            this.load.spritesheet(i+'-outfit', 'character/outfit/'+i+'-outfit.png', { frameWidth: 16, frameHeight: 16 });
        }
        for(var i of outfit){
            this.load.spritesheet(i+'-outfit', 'character/outfit/'+i+'-outfit.png', { frameWidth: 16, frameHeight: 16 });
        }

        this.load.spritesheet('enemy', 'character/enemy/enemy.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('enemy2', 'character/enemy/enemy2.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('enemy3', 'character/enemy/enemy3.png', { frameWidth: 16, frameHeight: 16 });
        this.load.image('ketapel', 'character/enemy/ketapel.png');
        this.load.image('bullet', 'character/enemy/bullet.png');

        ['ember', 'kayu', 'pohon', 'sekop', 'sword'].forEach(i => {
            this.load.image('item-'+i, 'items/'+i+'.png')
        })
        this.load.spritesheet('sword', 'sword.png', { frameWidth: 48, frameHeight: 48 });

        ['lobby', 'hamemayu', 'hutan', 'eling', 'kolam', 'rukun', 'rumah'].forEach(i => {
            this.load.tilemapTiledJSON(i, 'tilemap/map-'+i+'.json');
        })
    }

    create () {
        // Player normal
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

        // Player head
        for(let i of head){
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
        }

        // Player outfit
        for(let i of outfit){
            this.anims.create({
                key: 'idle-'+i+'-outfit',
                frames: this.anims.generateFrameNumbers(i+'-outfit', {
                    frames: [0]
                }),
                frameRate: 8,
                repeat: -1
            });
            this.anims.create({
                key: 'run-down-'+i+'-outfit',
                frames: this.anims.generateFrameNumbers(i+'-outfit', { start: 6, end: 11 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'run-up-'+i+'-outfit',
                frames: this.anims.generateFrameNumbers(i+'-outfit', { start: 12, end: 17 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // Enemy2
        this.anims.create({
            key: 'enemy-idle',
            frames: this.anims.generateFrameNumbers('enemy', {
                frames: [0,0,0,0,1]
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'enemy-run',
            frames: this.anims.generateFrameNumbers('enemy', {
                frames: [2,3,4,5,6,7]
            }),
            frameRate: 10,
            repeat: -1
        });

        // Enemy2
        this.anims.create({
            key: 'enemy2-idle',
            frames: this.anims.generateFrameNumbers('enemy2', {
                frames: [0,0,0,0,1]
            }),
            frameRate: 10,
            repeat: -1
        });

        // Enemy3
        this.anims.create({
            key: 'enemy3-idle',
            frames: this.anims.generateFrameNumbers('enemy3', {
                frames: [0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1,2,1,2]
            }),
            frameRate: 8,
            repeat: -1
        });

        // Attack
        this.anims.create({
            key: 'attack',
            frames: this.anims.generateFrameNumbers('sword', {
                frames: [0,0,1,2,3,4,5,5,5,5,5,5]
            }),
            frameRate: 30,
        });

        const mainMenu =  document.getElementById('main-menu')
        if(mainMenu) mainMenu.style.display = 'block'
        
        this.scene.start('MainMenu');
    }
}
