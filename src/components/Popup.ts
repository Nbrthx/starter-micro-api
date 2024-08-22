export class Popup{
    static misionComplete(text: string){
        const popup = document.getElementById('popup')
        if(popup){
            popup.innerHTML = text
            popup.style.top = '45vh'
            setTimeout(() => popup.style.top = '-10vh', 2000)
        }
    }
}