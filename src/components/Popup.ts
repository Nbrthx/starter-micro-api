export class Popup{
    static misionComplete(text: string, subtext: string){
        const popup = document.getElementById('popup')
        if(popup){
            popup.innerHTML = '<label>'+text+'</label><br />'+subtext
            popup.style.top = '44vh'
            setTimeout(() => popup.style.top = '-12vh', 6000)
        }
    }
}