import { Socket } from "socket.io-client";

interface Account{
    username: string;
    hash: string;
    head: string[];
    outfit: string[];
    xp: number;
    inventory: number[];
}

export class Outfit {

    socket: Socket;
    head: string[];
    outfit: string[];
    currentHead: string;
    currentOutfit: string;
    elementName: string[]
    eventListener: EventListener[]
    opened: boolean;

    constructor(socket: Socket){
        this.socket = socket
        this.head = []
        this.outfit = []

        if(!localStorage.getItem('current-head')) localStorage.setItem('current-head', 'basic-head')
        if(!localStorage.getItem('current-outfit')) localStorage.setItem('current-outfit', 'basic-outfit')

        this.currentHead = localStorage.getItem('current-head') || 'basic-head'
        this.currentOutfit = localStorage.getItem('current-outfit') || 'basic-outfit'

        this.elementName = []
        this.eventListener = []

        this.opened = false
    }

    open(){
        if(this.opened) return
        this.opened = true
        const outfitBox = document.getElementById('outfit-box')

        this.socket.emit('get-account', (data: Account) => {
            this.head = data.head
            this.outfit = data.outfit

            if(outfitBox){ 
                outfitBox.innerHTML = '<h1>Ganti Muka dan Baju</h1>'
                outfitBox.innerHTML += '<b>Muka</b><br />'
                for(let i of this.head){
                    outfitBox.innerHTML += i+' <button id="custom-'+i+'-head">Pakai</button><br />'
                    this.eventListener.push(() => {
                        outfitBox.style.display = 'none'
                        this.opened = false
                        this.currentHead = i+'-head'
                        localStorage.setItem('current-head', this.currentHead)
                        this.removeListener()
                    })
                    this.elementName.push('custom-'+i+'-head')

                }
                outfitBox.innerHTML += '<br /><b>Baju</b><br />'
                for(let i of this.outfit){
                    outfitBox.innerHTML += i+' <button id="custom-'+i+'-outfit">Pakai</button><br />'
                    this.eventListener.push(() => {
                        outfitBox.style.display = 'none'
                        this.opened = false
                        this.currentOutfit = i+'-outfit'
                        localStorage.setItem('current-outfit', this.currentOutfit)
                        this.removeListener()
                    })
                    this.elementName.push('custom-'+i+'-outfit')
                }
                outfitBox.innerHTML += '<button id="cancel">Nggak Dulu</button><br />'   

                this.eventListener.push(() => {
                    outfitBox.style.display = 'none'
                    this.opened = false
                    this.removeListener()
                })
                this.elementName.push('cancel')

                for(let i=0; i<this.elementName.length; i++){
                    document.getElementById(this.elementName[i])?.addEventListener('click', this.eventListener[i])
                }
            }
        })
    }

    static addOutfit(socket: Socket, type: string, name: string){
        if(type == 'head') socket.emit('outfit-update', { type: 'head', name: name })
        else if(type == 'outfit') socket.emit('outfit-update', { type: 'outfit', name: name })
    }

    removeListener(){
        for(let i=0; i<this.elementName.length; i++){
            document.getElementById(this.elementName[i])?.removeEventListener('click', this.eventListener[i])
        }
    }
}

