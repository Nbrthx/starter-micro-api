import { Scene, GameObjects } from 'phaser';
import io from 'socket.io-client'

const socket = io('https://88f657d4-76d7-4a16-8879-9a5ccf160318-00-3roq4zs5sozw1.kirk.replit.dev:3000', { transports: ['websocket'] })

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

        const username = document.getElementById('username') as HTMLInputElement
        
        this.registry.set('socket', socket)
        this.title.setInteractive()
        this.title.once('pointerdown', () => {
            this.registry.set('username', username.value)
            const mainMenu =  document.getElementById('main-menu')
            const ui =  document.getElementById('game-ui')
            if(mainMenu) mainMenu.style.display = 'none'
            if(ui) ui.style.display = 'block'
            this.scene.start('Lobby');

        });
        console.log('connected')
    }
}