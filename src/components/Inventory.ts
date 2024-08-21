interface Item{
    name: string;
    amount: number;
}

export class Inventory {

    current: number;
    items: Item[];

    constructor(){
        this.current = JSON.parse(localStorage.getItem('current') || '{ "current": 0 }').current
        this.items = JSON.parse(localStorage.getItem('items') || JSON.stringify([{
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
        }]))
        localStorage.setItem('items', JSON.stringify(this.items))
    }

    addItem(name: string, amount: number){
        const item = this.items.find(v => v.name == name)
        if(item){
            item.amount += amount
            localStorage.setItem('items', JSON.stringify(this.items))
            return true
        }
        return false
    }

    setItem(name: string, amount: number){
        const item = this.items.find(v => v.name == name)
        if(item){
            item.amount = amount
            localStorage.setItem('items', JSON.stringify(this.items))
            return true
        }
        return false
    }

    removeItem(name: string, amount: number){
        const item = this.items.find(v => v.name == name)
        if(item && item.amount >= amount){
            item.amount -= amount
            localStorage.setItem('items', JSON.stringify(this.items))
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