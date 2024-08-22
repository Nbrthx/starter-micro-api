import { Scene, GameObjects } from 'phaser';
import io from 'socket.io-client'
import { getPasscolor, readPasscolor, downloadImg } from '../components/Passcolor';

const socket = io('http://localhost:3000', { transports: ['websocket'] })

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
            }
            else{
                alert('Akun tidak ditemukan')
            }
        }

        let hash = localStorage.getItem('hash')
        if(hash) socket.emit('login', hash, (data: string) => loginCallback(data, hash)) 

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
            let text = randomString(64)
            socket.emit('register', { hash: text, username: elmUsername.value }, (succes: boolean) => {
                if(succes){
                    alert('Gambar yang kamu download adalah password akun kamu, simpan dengan baik. Kalau hilang, akunmu hilang :D')
                    downloadImg(getPasscolor(text))
                }
                else {
                    alert('Register Gagal, username sudah dipakai')
                }
            })
        }

        login.addEventListener('click', () => file.click())
        register.addEventListener('click', () => registerHandler())

        
        this.registry.set('socket', socket)

        this.title.setInteractive()
        this.title.once('pointerdown', () => {
            const mainMenu =  document.getElementById('main-menu')
            const ui =  document.getElementById('game-ui')
            if(mainMenu) mainMenu.style.display = 'none'
            if(ui) ui.style.display = 'block'
            this.scene.start('Lobby');

        });
        console.log('connected')
    }
}