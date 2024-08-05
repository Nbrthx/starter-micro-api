import { Scene, GameObjects } from 'phaser';
import io from 'socket.io-client'

const socket = io('https://3000-idx-mygame-1719896715970.cluster-a3grjzek65cxex762e4mwrzl46.cloudworkstations.dev/', { transports: ['websocket'] })

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor () {
        super('MainMenu');
    }

    create () {
        this.cameras.main.setBackgroundColor('#444499');

        this.background = this.add.image(this.scale.width/2, this.scale.height/2, 'background');
        this.background.setAlpha(0.5);

        this.logo = this.add.image(this.scale.width/2, 300, 'logo');

        this.title = this.add.text(this.scale.width/2, 460, 'Play', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        
        this.registry.set('socket', socket)
        this.title.setInteractive()
        this.title.once('pointerdown', () => {

            this.scene.start('Lobby');

        });
        console.log('connected')
    }
}