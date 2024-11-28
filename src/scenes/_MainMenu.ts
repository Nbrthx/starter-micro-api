import { Scene, GameObjects } from 'phaser';
import io from 'socket.io-client'
import { getPasscolor, readPasscolor, downloadImg } from '../components/Passcolor';

const socket = io('https://niberthix.eu.org', { transports: ['websocket'] })

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor () {
        super('MainMenu');
    }

    create () {
        this.cameras.main.setBackgroundColor('#000000');
        
        this.sound.stopAll()

        this.background = this.add.image(this.scale.width/2, this.scale.height/2, 'background');
        this.background.setScale((this.scale.width/this.scale.height)/(20/9))

        // Menu Button
        const play = this.add.text(this.scale.width/3*2, 405, 'Play', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0);
        const tutorial = this.add.text(this.scale.width/3*2, 475, 'Tutorial', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0);
        const credit = this.add.text(this.scale.width/3*2, 545, 'Credit', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0);
        const logout = this.add.text(this.scale.width/3*2, 615, 'Logout', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0);

        // Register and Login
        const loginBox = document.getElementById('login-box') as HTMLInputElement
        const registerBox = document.getElementById('register-box') as HTMLInputElement

        const login = document.getElementById('login') as HTMLButtonElement
        const register = document.getElementById('register') as HTMLButtonElement

        const haveAccount = document.getElementById('have-account') as HTMLInputElement
        const noAccount = document.getElementById('no-account') as HTMLInputElement

        haveAccount.addEventListener('click', () => {
            loginBox.style.display = 'block'
            registerBox.style.display = 'none'
        })
        noAccount.addEventListener('click', () => {
            loginBox.style.display = 'none'
            registerBox.style.display = 'block'
        })

        const file = document.createElement('input')
        file.type = 'file'

        let username = ''
        const loginCallback = (data: string, text: string) => {
            if(data){
                username = data
                this.registry.set('username', username)
                localStorage.setItem('hash', text)
                loginBox.style.display = 'none'
                socket.emit('get-account', (data: { xp: number }) => {
                    if(data.xp == 0){
                        const mainMenu =  document.getElementById('main-menu')
                        const ui =  document.getElementById('game-ui')
                        if(mainMenu) mainMenu.style.display = 'none'
                        if(ui) ui.style.display = 'block'
                        this.scene.start('Tutorial')
                    }
                })
                play.setInteractive()
                tutorial.setInteractive()
                credit.setInteractive()
                logout.setInteractive()
            }
            else{
                alert('Akun tidak ditemukan atau perangkat lain sudah login. Logout perangkat lain lalu refresh.')
            }
        }

        let hash = localStorage.getItem('hash') as string
        if(hash){
            if(!this.registry.has('username')) socket.emit('login', hash, (data: string) => loginCallback(data, hash))
            else{
                play.setInteractive()
                tutorial.setInteractive()
                credit.setInteractive()
                logout.setInteractive()
            }
        } 

        file.onchange = e => readPasscolor(((e.target as HTMLInputElement).files as FileList)[0], text => {
            socket.emit('login', text, (data: string) => loginCallback(data, text))
        })

        const elmUsername = document.getElementById('username') as HTMLInputElement

        const randomString = (n: number) => {
            let text = ''
            let format = '0123456789abcdef'
            for(let i=0; i<n; i++){
                text += format[Math.floor(Math.random()*16)]
            }
            return text
        }

        const registerHandler = () => {
            if(elmUsername.value.length < 4){
                alert('Nama harus lebih dari 3 huruf')
                return
            }
            if(elmUsername.value.length >= 16){
                alert('Nama harus kurang dari 16 huruf')
                return
            }
            let text = randomString(64)
            socket.emit('register', { hash: text, username: elmUsername.value }, (succes: boolean) => {
                if(succes){
                    alert('Gambar yang kamu download adalah password akun kamu, simpan dengan baik. Kalau hilang, akunmu hilang :D')
                    downloadImg(getPasscolor(text), elmUsername.value)
                }
                else {
                    alert('Register Gagal, username sudah dipakai')
                }
            })
        }

        login.addEventListener('click', () => file.click())
        register.addEventListener('click', () => registerHandler())

        this.registry.set('socket', socket)

        const mainMenu =  document.getElementById('main-menu')
        const ui =  document.getElementById('game-ui')
        if(mainMenu) mainMenu.style.display = 'block'
        if(ui) ui.style.display = 'none'

        play.on('pointerdown', () => {
            if(mainMenu) mainMenu.style.display = 'none'
            if(ui) ui.style.display = 'block'
            this.scene.start('Lobby', { from: '' });
            
            const backsound = this.sound.add('backsound')
            backsound.setVolume(0.5)
            backsound.setLoop(true)
            if(!this.sound.get('backsound').isPlaying) backsound.play()
        });

        tutorial.on('pointerdown', () => {
            if(mainMenu) mainMenu.style.display = 'none'
            if(ui) ui.style.display = 'block'
            this.scene.start('Tutorial');

        });

        credit.on('pointerdown', () => {
            this.scene.start('Credit');
        });

        logout.once('pointerdown', () => {
            localStorage.removeItem('hash')
            location.reload()
        });
        console.log('connected')
    }
}