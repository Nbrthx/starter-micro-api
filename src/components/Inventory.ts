import { Socket } from "socket.io-client";

interface Item{
    name: string;
    amount: number;
}

interface Account{
    username: string;
    hash: string;
    head: string[];
    outfit: string[];
    xp: number;
    inventory: number[];
}

const contableItem = ['pohon', 'ember', 'kayu']

export class Inventory {

    current: number;
    items: Item[];
    socket: Socket;

    constructor(socket: Socket){
        this.socket = socket
        this.current = JSON.parse(localStorage.getItem('current') || '{ "current": 0 }').current
        this.items = [{
            name: 'sword',
            amount: 0
        },
        {
            name: 'pohon',
            amount: 0
        },
        {
            name: 'ember',
            amount: 0
        },
        {
            name: 'sekop',
            amount: 0
        },
        {
            name: 'kayu',
            amount: 0
        }]
        socket.emit('get-account', (data: Account) => {
            data.inventory.forEach((v, i) => {
                const item = this.items.find(w => w.name == contableItem[i])
                if(item) item.amount = v
            })
        })

        const item = document.getElementById('item');
        const itemAmount = document.getElementById('item-amount');
        if(item) item.className = 'item-'+this.currentName()
        if(itemAmount){
            if(this.current == 0 || this.current == 3) itemAmount.style.display = 'none'
            else itemAmount.style.display = 'block'
            itemAmount.innerHTML = this.items[this.current].amount+'x'
        }
    }

    addItem(name: string, amount: number){
        const item = this.items.find(v => v.name == name)
        if(item){
            item.amount += amount
            this.socket.emit('inventory-update', 'add', name, amount)
            return true
        }
        return false
    }

    setItem(name: string, amount: number){
        const item = this.items.find(v => v.name == name)
        if(item){
            item.amount = amount
            this.socket.emit('inventory-update', 'set', name, amount)
            return true
        }
        return false
    }

    removeItem(name: string, amount: number){
        const item = this.items.find(v => v.name == name)
        if(item && item.amount >= amount){
            item.amount -= amount
            this.socket.emit('inventory-update', 'sub', name, amount)
            return true
        }
        return false
    }

    currentName(){
        return this.items[this.current].name
    }

    changeItem(){
        this.current++
        if(this.current >= this.items.length) this.current = 0
        localStorage.setItem('current', JSON.stringify({ current: this.current }))
    }
}