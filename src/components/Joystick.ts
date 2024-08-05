export class Joystick{

    joystick: HTMLElement;
    stick: HTMLElement;

    x: number;
    y: number;
    attack: boolean;

    offset: { x: number, y: number };
    isDragging: boolean;
    activeTouch: [];

    constructor(joystick: HTMLElement, stick: HTMLElement){
        this.joystick = joystick
        this.stick = stick

        this.x = 0
        this.y = 0
        this.attack = false

        this.offset = { x: 0, y: 0 };
        this.isDragging = false;
        
        this.joystick.addEventListener('touchstart', this.touchstart.bind(this));

        window.addEventListener('touchmove', this.touchmove.bind(this));
        
        window.addEventListener('touchend', this.touchend.bind(this));
    }

    touchstart(e: TouchEvent){
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.joystick.style.left = "calc("+e.touches[0].clientX+"px - 12vh)";
            this.joystick.style.top = "calc("+e.touches[0].clientY+"px - 12vh)";
            this.offset.x = e.touches[0].clientX - this.joystick.offsetLeft;
            this.offset.y = e.touches[0].clientY - this.joystick.offsetTop;
        }
    }

    touchmove(e: TouchEvent){
        if (this.isDragging) {
            this.x = e.touches[0].clientX - this.joystick.offsetLeft - this.offset.x;
            this.y = e.touches[0].clientY - this.joystick.offsetTop - this.offset.y;
    
            // Limit the stick's movement to the joystick's radius
            const radius = this.joystick.clientWidth / 2;
            const distance = Math.sqrt(this.x**2 + this.y**2);
            if (distance > radius) {
                this.x = (this.x / distance) * radius;
                this.y = (this.y / distance) * radius;
            }
    
            this.stick.style.left = 'calc('+ this.x + 'px + 6vh)';
            this.stick.style.top = 'calc('+ this.y + 'px + 6vh)';
        }
    }

    touchend(){
        this.isDragging = false;
        this.stick.style.left = 'calc(50% - 6vh)';
        this.stick.style.top = 'calc(50% - 6vh)';
        this.joystick.style.left = "80px";
        this.joystick.style.top = "calc(100svh - 32vh)";

        this.x = 0
        this.y = 0
    }
}